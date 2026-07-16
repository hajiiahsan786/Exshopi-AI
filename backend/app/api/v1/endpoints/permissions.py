from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.permission import PermissionCreate
from app.services.permission_service import PermissionService

router = APIRouter()


@router.get("/")
def get_permissions(db: Session = Depends(get_db)):
    return PermissionService.get_all(db)


@router.post("/")
def create_permission(
    data: PermissionCreate,
    db: Session = Depends(get_db),
):
    return PermissionService.create(db, data)


@router.get("/{permission_id}")
def get_permission(
    permission_id: int,
    db: Session = Depends(get_db),
):
    return PermissionService.get_by_id(db, permission_id)