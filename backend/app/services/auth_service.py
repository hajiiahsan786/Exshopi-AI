from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe

from sqlalchemy.orm import Session

from app.core.settings import settings
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from app.repositories.auth_repository import AuthRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
)
from app.security.hashing import (
    hash_password,
    hash_token,
    verify_password,
    verify_token_hash,
)
from app.security.jwt import create_access_token, create_refresh_token, verify_token


class AuthError(Exception):
    def __init__(self, message: str, status_code: int = 400, errors=None):
        self.message = message
        self.status_code = status_code
        self.errors = errors
        super().__init__(message)


class AuthService:
    DEFAULT_ROLES = [
        "Admin",
        "Owner",
        "CEO",
        "Manager",
        "HR",
        "Sales",
        "Finance",
        "Employee",
        "Customer",
    ]

    DEFAULT_PERMISSIONS = [
        "users.create",
        "users.read",
        "users.update",
        "users.delete",
        "employees.*",
        "customers.*",
        "crm.*",
        "inventory.*",
        "finance.*",
        "marketing.*",
        "ai.*",
        "settings.*",
    ]

    ROLE_PERMISSIONS = {
        "Admin": DEFAULT_PERMISSIONS,
        "Owner": DEFAULT_PERMISSIONS,
        "CEO": [
            "users.read",
            "employees.*",
            "customers.*",
            "crm.*",
            "inventory.*",
            "finance.*",
            "marketing.*",
            "ai.*",
            "settings.*",
        ],
        "Manager": [
            "users.read",
            "employees.*",
            "customers.*",
            "crm.*",
            "inventory.*",
            "marketing.*",
            "ai.*",
        ],
        "HR": ["users.read", "employees.*"],
        "Sales": ["customers.*", "crm.*", "marketing.*", "ai.*"],
        "Finance": ["customers.read", "finance.*"],
        "Employee": ["users.read"],
        "Customer": ["customers.read"],
    }

    @staticmethod
    def _utc_now() -> datetime:
        return datetime.now(timezone.utc)

    @staticmethod
    def ensure_defaults(db: Session) -> None:
        permissions_by_name: dict[str, Permission] = {}

        for permission_name in AuthService.DEFAULT_PERMISSIONS:
            permission = AuthRepository.get_permission_by_name(db, permission_name)

            if not permission:
                permission = Permission(
                    name=permission_name,
                    description=f"Allows {permission_name}",
                )
                db.add(permission)
                db.flush()

            permissions_by_name[permission_name] = permission

        for role_name in AuthService.DEFAULT_ROLES:
            role = AuthRepository.get_role_by_name(db, role_name)

            if not role:
                role = Role(
                    name=role_name,
                    description=f"{role_name} role",
                )
                db.add(role)
                db.flush()

            assigned = AuthService.ROLE_PERMISSIONS.get(role_name, [])
            role.permissions = [
                permissions_by_name[permission_name]
                for permission_name in assigned
                if permission_name in permissions_by_name
            ]

        db.commit()

    @staticmethod
    def _public_user(user: User) -> dict:
        return {
            "id": user.id,
            "uuid": user.uuid,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role.name if user.role else None,
            "is_active": user.is_active,
            "is_verified": user.is_verified,
            "last_login": user.last_login,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }

    @staticmethod
    def _issue_tokens(db: Session, user: User) -> dict:
        role_name = user.role.name if user.role else "Employee"
        access_token, _, access_expires_at = create_access_token(
            subject=str(user.id),
            email=user.email,
            role=role_name,
        )
        refresh_token, refresh_jti, refresh_expires_at = create_refresh_token(
            subject=str(user.id),
            email=user.email,
            role=role_name,
        )

        AuthRepository.add_refresh_token(
            db,
            user_id=user.id,
            token_jti=refresh_jti,
            expires_at=refresh_expires_at,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "access_token_expires_at": access_expires_at,
            "refresh_token_expires_at": refresh_expires_at,
        }

    @staticmethod
    def register(db: Session, request: RegisterRequest) -> dict:
        AuthService.ensure_defaults(db)

        existing = AuthRepository.get_user_by_email(db, str(request.email))

        if existing:
            raise AuthError("Email already exists", status_code=409)

        owner_role = AuthRepository.get_role_by_name(db, "Owner")

        if not owner_role:
            raise AuthError("Default role configuration failed", status_code=500)

        verification_token = token_urlsafe(48)
        verification_expires_at = AuthService._utc_now() + timedelta(
            minutes=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES
        )
        user = User(
            full_name=request.full_name,
            email=str(request.email).lower(),
            phone=request.phone,
            password_hash=hash_password(request.password),
            role_id=owner_role.id,
            is_active=True,
            is_verified=False,
            email_verification_token_hash=hash_token(verification_token),
            email_verification_expires_at=verification_expires_at,
        )

        user = AuthRepository.create_user(db, user)
        db.refresh(user, attribute_names=["role"])

        return {
            "user": AuthService._public_user(user),
            "email_verification": {
                "token": verification_token,
                "expires_at": verification_expires_at,
            },
        }

    @staticmethod
    def login(db: Session, request: LoginRequest) -> dict:
        user = AuthRepository.get_user_by_email(db, str(request.email))

        if not user or not verify_password(request.password, user.password_hash):
            raise AuthError("Invalid email or password", status_code=401)

        if not user.is_active:
            raise AuthError("Inactive user", status_code=403)

        user.last_login = AuthService._utc_now()
        db.commit()
        db.refresh(user)
        db.refresh(user, attribute_names=["role"])

        return {
            "user": AuthService._public_user(user),
            "tokens": AuthService._issue_tokens(db, user),
        }

    @staticmethod
    def refresh(db: Session, refresh_token: str) -> dict:
        payload = verify_token(refresh_token, expected_type="refresh")

        if not payload:
            raise AuthError("Invalid or expired refresh token", status_code=401)

        token_record = AuthRepository.get_refresh_token(db, payload["jti"])

        if not token_record or token_record.revoked:
            raise AuthError("Refresh token has been revoked", status_code=401)

        user = AuthRepository.get_user_by_id(db, int(payload["sub"]))

        if not user:
            raise AuthError("User not found", status_code=401)

        if not user.is_active:
            raise AuthError("Inactive user", status_code=403)

        AuthRepository.revoke_refresh_token(db, payload["jti"])
        db.refresh(user, attribute_names=["role"])

        return AuthService._issue_tokens(db, user)

    @staticmethod
    def logout(db: Session, user: User, refresh_token: str | None = None) -> dict:
        if refresh_token:
            payload = verify_token(refresh_token, expected_type="refresh")

            if payload:
                AuthRepository.revoke_refresh_token(db, payload["jti"])
                return {"revoked_tokens": 1}

        revoked_tokens = AuthRepository.revoke_all_user_refresh_tokens(db, user.id)
        return {"revoked_tokens": revoked_tokens}

    @staticmethod
    def forgot_password(db: Session, email: str) -> dict | None:
        user = AuthRepository.get_user_by_email(db, email)

        if not user:
            return None

        reset_token = token_urlsafe(48)
        reset_expires_at = AuthService._utc_now() + timedelta(
            minutes=settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
        )
        user.password_reset_token_hash = hash_token(reset_token)
        user.password_reset_expires_at = reset_expires_at
        db.commit()

        return {
            "token": reset_token,
            "expires_at": reset_expires_at,
        }

    @staticmethod
    def reset_password(db: Session, request: ResetPasswordRequest) -> None:
        users = db.query(User).filter(User.password_reset_token_hash.isnot(None)).all()
        now = AuthService._utc_now()

        for user in users:
            expires_at = user.password_reset_expires_at

            if expires_at and expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)

            if (
                verify_token_hash(request.token, user.password_reset_token_hash)
                and expires_at
                and expires_at > now
            ):
                user.password_hash = hash_password(request.new_password)
                user.password_reset_token_hash = None
                user.password_reset_expires_at = None
                AuthRepository.revoke_all_user_refresh_tokens(db, user.id)
                db.commit()
                return

        raise AuthError("Invalid or expired reset token", status_code=400)

    @staticmethod
    def change_password(
        db: Session,
        user: User,
        request: ChangePasswordRequest,
    ) -> None:
        if not verify_password(request.current_password, user.password_hash):
            raise AuthError("Current password is incorrect", status_code=400)

        user.password_hash = hash_password(request.new_password)
        AuthRepository.revoke_all_user_refresh_tokens(db, user.id)
        db.commit()

    @staticmethod
    def verify_email(db: Session, token: str) -> User:
        users = (
            db.query(User)
            .filter(User.email_verification_token_hash.isnot(None))
            .all()
        )
        now = AuthService._utc_now()

        for user in users:
            expires_at = user.email_verification_expires_at

            if expires_at and expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)

            if (
                verify_token_hash(token, user.email_verification_token_hash)
                and expires_at
                and expires_at > now
            ):
                user.is_verified = True
                user.email_verification_token_hash = None
                user.email_verification_expires_at = None
                db.commit()
                db.refresh(user)
                db.refresh(user, attribute_names=["role"])
                return user

        raise AuthError("Invalid or expired verification token", status_code=400)

    @staticmethod
    def me(user: User) -> dict:
        return AuthService._public_user(user)
