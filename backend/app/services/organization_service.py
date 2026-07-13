from sqlalchemy.orm import Session

from app.models.organization import Organization
from app.repositories.organization_repository import OrganizationRepository
from app.schemas.organization import OrganizationCreate


class OrganizationService:

    @staticmethod
    def create(
        db: Session,
        request: OrganizationCreate,
        owner_id: int,
    ):

        organization = Organization(
            name=request.name,
            slug=request.slug,
            description=request.description,
            website=request.website,
            email=request.email,
            phone=request.phone,
            country=request.country,
            city=request.city,
            owner_id=owner_id,
        )

        return OrganizationRepository.create(
            db,
            organization,
        )

    @staticmethod
    def get_all(db: Session):
        return OrganizationRepository.get_all(db)

    @staticmethod
    def get_by_id(
        db: Session,
        organization_id: int,
    ):
        return OrganizationRepository.get_by_id(
            db,
            organization_id,
        )