from collections.abc import Callable

from fastapi import Depends, HTTPException, status

from app.models.user import User
from app.security.dependencies import get_current_active_user


def _permission_names(user: User) -> set[str]:
    if not user.role:
        return set()
    return {permission.name for permission in user.role.permissions}


def require_hr_permission(permission_name: str) -> Callable:
    def dependency(current_user: User = Depends(get_current_active_user)) -> User:
        permissions = _permission_names(current_user)
        module_wildcard = permission_name.split(".", maxsplit=1)[0] + ".*"
        allowed = {
            permission_name,
            module_wildcard,
            "hr.manage",
            "hr.*",
        }

        if permissions.isdisjoint(allowed):
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
