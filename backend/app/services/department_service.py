from sqlalchemy.orm import Session

from app.repositories.department_repository import DepartmentRepository


class DepartmentService:
    @staticmethod
    def get_all(db: Session):
        return DepartmentRepository.get_all(db)

    @staticmethod
    def get_by_id(db: Session, department_id: int):
        return DepartmentRepository.get_by_id(db, department_id)

    @staticmethod
    def create(db: Session, data):
        return DepartmentRepository.create(db, data)
