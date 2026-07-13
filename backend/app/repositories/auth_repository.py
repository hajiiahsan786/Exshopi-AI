from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.auth_token import AuthToken
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User


class AuthRepository:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email.lower()).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_role_by_name(db: Session, name: str) -> Role | None:
        return db.query(Role).filter(Role.name == name).first()

    @staticmethod
    def get_permission_by_name(db: Session, name: str) -> Permission | None:
        return db.query(Permission).filter(Permission.name == name).first()

    @staticmethod
    def create_user(db: Session, user: User) -> User:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def save(db: Session) -> None:
        db.commit()

    @staticmethod
    def add_refresh_token(
        db: Session,
        *,
        user_id: int,
        token_jti: str,
        expires_at: datetime,
    ) -> AuthToken:
        auth_token = AuthToken(
            user_id=user_id,
            token_jti=token_jti,
            token_type="refresh",
            expires_at=expires_at,
            revoked=False,
        )

        db.add(auth_token)
        db.commit()
        db.refresh(auth_token)
        return auth_token

    @staticmethod
    def get_refresh_token(db: Session, token_jti: str) -> AuthToken | None:
        return (
            db.query(AuthToken)
            .filter(
                AuthToken.token_jti == token_jti,
                AuthToken.token_type == "refresh",
            )
            .first()
        )

    @staticmethod
    def revoke_refresh_token(db: Session, token_jti: str) -> bool:
        auth_token = AuthRepository.get_refresh_token(db, token_jti)

        if not auth_token or auth_token.revoked:
            return False

        auth_token.revoked = True
        auth_token.revoked_at = datetime.now(timezone.utc)
        db.commit()
        return True

    @staticmethod
    def revoke_all_user_refresh_tokens(db: Session, user_id: int) -> int:
        tokens = (
            db.query(AuthToken)
            .filter(
                AuthToken.user_id == user_id,
                AuthToken.token_type == "refresh",
                AuthToken.revoked.is_(False),
            )
            .all()
        )

        now = datetime.now(timezone.utc)

        for token in tokens:
            token.revoked = True
            token.revoked_at = now

        db.commit()
        return len(tokens)
