from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.department import DepartmentCreate, DepartmentResponse
from app.services.department_service import DepartmentService

router = APIRouter()


@router.get("/", response_model=list[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return DepartmentService.get_all(db)


@router.post("/", response_model=DepartmentResponse)
def create_department(
    data: DepartmentCreate,
    db: Session = Depends(get_db),
):
    return DepartmentService.create(db, data)


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    return DepartmentService.get_by_id(db, department_id)
