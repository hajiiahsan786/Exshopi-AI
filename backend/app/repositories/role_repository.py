from sqlalchemy.orm import Session

from app.models.role import Role


class RoleRepository:

    @staticmethod
    def create(db: Session, name: str, description: str = None):

        role = Role(
            name=name,
            description=description,
        )

        db.add(role)
        db.commit()
        db.refresh(role)

        return role

    @staticmethod
    def get_all(db: Session):
        return db.query(Role).all()

    @staticmethod
    def get_by_id(db: Session, role_id: int):
        return db.query(Role).filter(Role.id == role_id).first()