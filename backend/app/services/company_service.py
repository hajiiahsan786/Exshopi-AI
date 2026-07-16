from sqlalchemy.orm import Session

from app.repositories.company_repository import CompanyRepository


class CompanyService:
    @staticmethod
    def get_all(db: Session):
        return CompanyRepository.get_all(db)

    @staticmethod
    def get_by_id(db: Session, company_id: int):
        return CompanyRepository.get_by_id(db, company_id)

    @staticmethod
    def create(db: Session, data):
        return CompanyRepository.create(db, data)
