from sqlalchemy.orm import Session

from app.repositories.employee_repository import EmployeeRepository


class EmployeeService:
    @staticmethod
    def get_all(db: Session):
        return EmployeeRepository.get_all(db)

    @staticmethod
    def get_by_id(db: Session, employee_id: int):
        return EmployeeRepository.get_by_id(db, employee_id)

    @staticmethod
    def create(db: Session, data):
        return EmployeeRepository.create(db, data)
