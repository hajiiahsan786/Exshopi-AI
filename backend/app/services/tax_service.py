from typing import Any

from sqlalchemy.orm import Session

from app.repositories.tax_repository import TaxRepository
from app.services.order_service import BaseSalesService


class TaxService(BaseSalesService):
    repository = TaxRepository
    entity_name = "Tax"
    export_fields = ("id", "uuid", "organization_id", "company_id", "name", "tax_type", "country", "rate", "status")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "organization_id")
            cls.ensure_required(payload, "name")
            cls.ensure_required(payload, "tax_type")
            cls.ensure_required(payload, "rate")
        cls.validate_org_scope(db, payload, item)
