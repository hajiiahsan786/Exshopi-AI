from sqlalchemy.orm import Session

from app.models.employee import Employee


class EmployeeRepository:
    @staticmethod
    def get_all(db: Session):
        return db.query(Employee).all()

    @staticmethod
    def get_by_id(db: Session, employee_id: int):
        return db.query(Employee).filter(Employee.id == employee_id).first()

    @staticmethod
    def create(db: Session, data):
        employee = Employee(**data.model_dump())
        db.add(employee)
        db.commit()
        db.refresh(employee)
        return employee
