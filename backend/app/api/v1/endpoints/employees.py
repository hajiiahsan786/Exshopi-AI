from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.employee import EmployeeCreate, EmployeeResponse
from app.services.employee_service import EmployeeService

router = APIRouter()


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    return EmployeeService.get_all(db)


@router.post("/", response_model=EmployeeResponse)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
):
    return EmployeeService.create(db, data)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    return EmployeeService.get_by_id(db, employee_id)
