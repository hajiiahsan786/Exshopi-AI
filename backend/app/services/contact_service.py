from typing import Any

from sqlalchemy.orm import Session

from app.repositories.contact_repository import ContactRepository
from app.services.crm_service import CRMService


class ContactService(CRMService):
    repository = ContactRepository
    entity_name = "Contact"
    duplicate_fields = ("email", "phone")

    @classmethod
    def validate_payload(
        cls,
        db: Session,
        payload: dict[str, Any],
        item: Any | None = None,
    ) -> None:
        cls.ensure_customer(db, payload.get("customer_id"))
