from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.security.jwt import verify_token
from app.security.oauth2 import oauth2_scheme


def _permission_names(user: User) -> set[str]:
    if not user.role:
        return set()

    return {permission.name for permission in user.role.permissions}


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = verify_token(token, expected_type="access")

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": "Invalid or expired token",
                "errors": None,
            },
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": "Invalid token subject",
                "errors": None,
            },
        )

    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "success": False,
                "message": "User not found",
                "errors": None,
            },
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "success": False,
                "message": "Inactive user",
                "errors": None,
            },
        )

    return current_user


def require_role(*allowed_roles: str) -> Callable:
    def dependency(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        role_name = current_user.role.name if current_user.role else None

        if role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "success": False,
                    "message": "Insufficient role",
                    "errors": {"required_roles": list(allowed_roles)},
                },
            )

        return current_user

    return dependency


def require_permission(permission_name: str) -> Callable:
    def dependency(
        current_user: User = Depends(get_current_active_user),
    ) -> User:
        permissions = _permission_names(current_user)
        wildcard = permission_name.split(".", maxsplit=1)[0] + ".*"

        if permission_name not in permissions and wildcard not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "success": False,
                    "message": "Insufficient permission",
                    "errors": {"required_permission": permission_name},
                },
            )

        return current_user

    return dependency
