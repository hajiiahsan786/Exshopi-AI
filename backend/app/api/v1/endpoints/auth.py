from fastapi import APIRouter, Depends, Query, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.security.dependencies import get_current_active_user
from app.services.auth_service import AuthError, AuthService

router = APIRouter()


def success_response(message: str, data=None, status_code: int = 200):
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder({
            "success": True,
            "message": message,
            "data": data,
        }),
    )


def error_response(error: AuthError):
    return JSONResponse(
        status_code=error.status_code,
        content=jsonable_encoder({
            "success": False,
            "message": error.message,
            "errors": error.errors,
        }),
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        data = AuthService.register(db, request)
        return success_response(
            "Registration successful. Verify your email to activate trust status.",
            data=data,
            status_code=status.HTTP_201_CREATED,
        )
    except AuthError as error:
        return error_response(error)


@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        data = AuthService.login(db, request)
        return success_response("Login successful", data=data)
    except AuthError as error:
        return error_response(error)


@router.post("/logout")
def logout(
    request: LogoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    data = AuthService.logout(db, current_user, request.refresh_token)
    return success_response("Logout successful", data=data)


@router.post("/refresh")
def refresh(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    try:
        data = AuthService.refresh(db, request.refresh_token)
        return success_response("Token refreshed successfully", data=data)
    except AuthError as error:
        return error_response(error)


@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    reset_data = AuthService.forgot_password(db, str(request.email))
    data = {"reset": reset_data} if reset_data else None
    return success_response(
        "If the email exists, password reset instructions have been generated.",
        data=data,
    )


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    try:
        AuthService.reset_password(db, request)
        return success_response("Password reset successful")
    except AuthError as error:
        return error_response(error)


@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    try:
        AuthService.change_password(db, current_user, request)
        return success_response("Password changed successfully")
    except AuthError as error:
        return error_response(error)


@router.get("/me")
def me(
    current_user: User = Depends(get_current_active_user),
):
    return success_response("Current user loaded", data=AuthService.me(current_user))


@router.get("/verify-email")
def verify_email(
    token: str = Query(min_length=1),
    db: Session = Depends(get_db),
):
    try:
        user = AuthService.verify_email(db, token)
        return success_response(
            "Email verified successfully",
            data={"user": AuthService.me(user)},
        )
    except AuthError as error:
        return error_response(error)
