from sqlalchemy.orm import Session

from app.repositories.role_repository import RoleRepository


class RoleService:

    @staticmethod
    def create(db: Session, data):

        return RoleRepository.create(
            db,
            data.name,
            data.description,
        )

    @staticmethod
    def get_all(db: Session):
        return RoleRepository.get_all(db)

    @staticmethod
    def get_by_id(db: Session, role_id: int):
        return RoleRepository.get_by_id(db, role_id)