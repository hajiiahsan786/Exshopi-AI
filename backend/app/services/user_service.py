from sqlalchemy.orm import Session

from app.schemas.auth import LoginRequest, RegisterRequest
from app.services.auth_service import AuthService


class UserService:
    @staticmethod
    def register(
        db: Session,
        full_name: str,
        email: str,
        password: str,
    ):
        request = RegisterRequest(
            full_name=full_name,
            email=email,
            password=password,
        )
        return AuthService.register(db, request)

    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str,
    ):
        request = LoginRequest(email=email, password=password)
        return AuthService.login(db, request)
