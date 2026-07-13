from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.company import CompanyCreate, CompanyResponse
from app.services.company_service import CompanyService

router = APIRouter()


@router.get("/")
def get_companies(db: Session = Depends(get_db)):
    return CompanyService.get_all(db)


@router.post("/", response_model=CompanyResponse)
def create_company(
    data: CompanyCreate,
    db: Session = Depends(get_db),
):
    return CompanyService.create(db, data)


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
):
    return CompanyService.get_by_id(db, company_id)
