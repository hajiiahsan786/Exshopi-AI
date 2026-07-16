from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.activity_repository import ActivityRepository
from app.services.crm_service import CRMService


class ActivityService(CRMService):
    repository = ActivityRepository
    entity_name = "Activity"

    @classmethod
    def validate_payload(
        cls,
        db: Session,
        payload: dict[str, Any],
        item: Any | None = None,
    ) -> None:
        cls.ensure_organization(db, payload.get("organization_id"))
        cls.ensure_customer(db, payload.get("customer_id"))
        cls.ensure_lead(db, payload.get("lead_id"))
        cls.ensure_contact(db, payload.get("contact_id"))
        cls.ensure_opportunity(db, payload.get("opportunity_id"))
        cls.ensure_user(db, payload.get("owner"), "owner")

        parent_ids = [
            payload.get("customer_id", getattr(item, "customer_id", None)),
            payload.get("lead_id", getattr(item, "lead_id", None)),
            payload.get("contact_id", getattr(item, "contact_id", None)),
            payload.get("opportunity_id", getattr(item, "opportunity_id", None)),
        ]
        if not any(parent_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "At least one CRM parent reference is required",
                    "errors": {"parent": "customer_id, lead_id, contact_id, or opportunity_id"},
                },
            )
