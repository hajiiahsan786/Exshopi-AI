from sqlalchemy.orm import Session

from app.models.company import Company


class CompanyRepository:
    @staticmethod
    def get_all(db: Session):
        return db.query(Company).all()

    @staticmethod
    def get_by_id(db: Session, company_id: int):
        return db.query(Company).filter(Company.id == company_id).first()

    @staticmethod
    def create(db: Session, data):
        company = Company(**data.model_dump())
        db.add(company)
        db.commit()
        db.refresh(company)
        return company
