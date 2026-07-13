from sqlalchemy.orm import Session
from app.models.permission import Permission


class PermissionRepository:

    @staticmethod
    def get_all(db: Session):
        return db.query(Permission).all()

    @staticmethod
    def get_by_id(db: Session, permission_id: int):
        return db.query(Permission).filter(
            Permission.id == permission_id
        ).first()

    @staticmethod
    def create(db: Session, data):
        permission = Permission(**data.model_dump())
        db.add(permission)
        db.commit()
        db.refresh(permission)
        return permission