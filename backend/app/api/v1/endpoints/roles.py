from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.role import RoleCreate
from app.services.role_service import RoleService

router = APIRouter()


@router.get("/")
def get_roles(db: Session = Depends(get_db)):
    return RoleService.get_all(db)


@router.post("/")
def create_role(
    data: RoleCreate,
    db: Session = Depends(get_db),
):
    return RoleService.create(db, data)


@router.get("/{role_id}")
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
):
    return RoleService.get_by_id(db, role_id)