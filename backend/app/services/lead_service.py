from typing import Any

from sqlalchemy.orm import Session

from app.repositories.lead_repository import LeadRepository
from app.services.crm_service import CRMService


class LeadService(CRMService):
    repository = LeadRepository
    entity_name = "Lead"
    duplicate_fields = ("lead_number", "email", "phone")

    @classmethod
    def validate_payload(
        cls,
        db: Session,
        payload: dict[str, Any],
        item: Any | None = None,
    ) -> None:
        cls.ensure_organization(db, payload.get("organization_id"))
        cls.ensure_user(db, payload.get("assigned_to"), "assigned_to")
