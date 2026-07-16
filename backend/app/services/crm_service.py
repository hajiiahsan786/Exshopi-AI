from math import ceil
from typing import Any, Generic, TypeVar

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.customer import Customer
from app.models.lead import Lead
from app.models.opportunity import Opportunity
from app.models.organization import Organization
from app.models.user import User
from app.repositories.crm_repository import CRMRepository
from app.schemas.crm_common import PaginatedResponse

ModelT = TypeVar("ModelT")


class CRMService(Generic[ModelT]):
    repository: type[CRMRepository[ModelT]]
    entity_name = "CRM entity"
    duplicate_fields: tuple[str, ...] = ()

    @classmethod
    def list(cls, db: Session, **params: Any) -> PaginatedResponse:
        items, total = cls.repository.list(db, **params)
        page = params.get("page", 1)
        page_size = params.get("page_size", 20)
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            pages=ceil(total / page_size) if total else 0,
        )

    @classmethod
    def get(cls, db: Session, item_id: int, include_deleted: bool = False) -> ModelT:
        item = cls.repository.get_by_id(db, item_id, include_deleted=include_deleted)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "success": False,
                    "message": f"{cls.entity_name} not found",
                    "errors": {"id": item_id},
                },
            )
        return item

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> ModelT:
        payload = cls.repository.to_dict(data)
        cls.validate_payload(db, payload)
        cls.ensure_unique(db, payload)
        return cls.repository.create(db, payload, user_id)

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> ModelT:
        item = cls.get(db, item_id)
        payload = cls.repository.to_dict(data, exclude_unset=True)
        cls.validate_payload(db, payload, item=item)
        cls.ensure_unique(db, payload, exclude_id=item_id)
        return cls.repository.update(db, item, payload, user_id)

    @classmethod
    def delete(cls, db: Session, item_id: int, user_id: int | None = None) -> ModelT:
        item = cls.get(db, item_id)
        return cls.repository.soft_delete(db, item, user_id)

    @classmethod
    def restore(cls, db: Session, item_id: int, user_id: int | None = None) -> ModelT:
        item = cls.get(db, item_id, include_deleted=True)
        return cls.repository.restore(db, item, user_id)

    @classmethod
    def ensure_unique(
        cls,
        db: Session,
        payload: dict[str, Any],
        exclude_id: int | None = None,
    ) -> None:
        for field_name in cls.duplicate_fields:
            value = payload.get(field_name)
            if not value:
                continue
            existing = cls.repository.get_by_field(
                db,
                field_name,
                value,
                exclude_id=exclude_id,
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "success": False,
                        "message": f"Duplicate {field_name}",
                        "errors": {field_name: value},
                    },
                )

    @classmethod
    def validate_payload(
        cls,
        db: Session,
        payload: dict[str, Any],
        item: ModelT | None = None,
    ) -> None:
        return None

    @staticmethod
    def ensure_exists(db: Session, model: type[Any], item_id: int | None, label: str) -> None:
        if item_id is None:
            return
        exists = db.query(model.id).filter(model.id == item_id).first()
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": f"Invalid {label}",
                    "errors": {label: item_id},
                },
            )

    @classmethod
    def ensure_organization(cls, db: Session, organization_id: int | None) -> None:
        cls.ensure_exists(db, Organization, organization_id, "organization_id")

    @classmethod
    def ensure_user(cls, db: Session, user_id: int | None, label: str = "user_id") -> None:
        cls.ensure_exists(db, User, user_id, label)

    @classmethod
    def ensure_customer(cls, db: Session, customer_id: int | None) -> None:
        cls.ensure_exists(db, Customer, customer_id, "customer_id")

    @classmethod
    def ensure_lead(cls, db: Session, lead_id: int | None) -> None:
        cls.ensure_exists(db, Lead, lead_id, "lead_id")

    @classmethod
    def ensure_contact(cls, db: Session, contact_id: int | None) -> None:
        cls.ensure_exists(db, Contact, contact_id, "contact_id")

    @classmethod
    def ensure_opportunity(cls, db: Session, opportunity_id: int | None) -> None:
        cls.ensure_exists(db, Opportunity, opportunity_id, "opportunity_id")
