from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db

from app.schemas.organization import (
    OrganizationCreate,
    OrganizationResponse,
)

from app.services.organization_service import OrganizationService

from app.security.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post(
    "/",
    response_model=OrganizationResponse,
)
def create_organization(
    request: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    return OrganizationService.create(
        db=db,
        request=request,
        owner_id=current_user.id,
    )


@router.get(
    "/",
    response_model=list[OrganizationResponse],
)
def get_organizations(
    db: Session = Depends(get_db),
):

    return OrganizationService.get_all(db)


@router.get(
    "/{organization_id}",
    response_model=OrganizationResponse,
)
def get_organization(
    organization_id: int,
    db: Session = Depends(get_db),
):

    return OrganizationService.get_by_id(
        db,
        organization_id,
    )
