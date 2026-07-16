from typing import Any

from sqlalchemy.orm import Session

from app.repositories.opportunity_repository import OpportunityRepository
from app.services.crm_service import CRMService


class OpportunityService(CRMService):
    repository = OpportunityRepository
    entity_name = "Opportunity"

    @classmethod
    def validate_payload(
        cls,
        db: Session,
        payload: dict[str, Any],
        item: Any | None = None,
    ) -> None:
        cls.ensure_customer(db, payload.get("customer_id"))
        cls.ensure_user(db, payload.get("owner"), "owner")
