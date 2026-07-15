from collections.abc import Callable
from fastapi import Depends
from app.models.user import User
from app.security.permissions import get_current_active_user, require_permission

def require_project_permission(permission_name: str) -> Callable:
    """
    Dependency that ensures the user has a specific project permission.
    Example usage:
        @router.get("/")
        def list_items(user: User = Depends(require_project_permission("project.read"))): ...
    """
    return require_permission(f"project.{permission_name}")
