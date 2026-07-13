from sqlalchemy.orm import Session

from app.repositories.permission_repository import PermissionRepository


class PermissionService:

    @staticmethod
    def get_all(db: Session):
        return PermissionRepository.get_all(db)

    @staticmethod
    def get_by_id(db: Session, permission_id: int):
        return PermissionRepository.get_by_id(db, permission_id)

    @staticmethod
    def create(db: Session, data):
        return PermissionRepository.create(db, data)