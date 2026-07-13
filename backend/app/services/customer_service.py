from typing import Any

from sqlalchemy.orm import Session

from app.models.company import Company
from app.repositories.customer_repository import CustomerRepository
from app.services.crm_service import CRMService


class CustomerService(CRMService):
    repository = CustomerRepository
    entity_name = "Customer"
    duplicate_fields = ("customer_code", "email", "phone", "mobile")

    @classmethod
    def validate_payload(
        cls,
        db: Session,
        payload: dict[str, Any],
        item: Any | None = None,
    ) -> None:
        cls.ensure_organization(db, payload.get("organization_id"))
        cls.ensure_exists(db, Company, payload.get("company_id"), "company_id")
        cls.ensure_user(db, payload.get("assigned_to"), "assigned_to")
