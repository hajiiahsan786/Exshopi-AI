from fastapi import APIRouter, Depends

from app.models.user import User
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("/me")
def me(
    current_user: User = Depends(get_current_user),
):
    return {
        "success": True,
        "message": "Current user loaded",
        "data": {
            "id": current_user.id,
            "uuid": current_user.uuid,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role.name if current_user.role else None,
            "is_active": current_user.is_active,
            "is_verified": current_user.is_verified,
        },
    }
