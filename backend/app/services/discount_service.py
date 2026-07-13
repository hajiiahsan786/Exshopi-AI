from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.discount_repository import DiscountRepository
from app.services.order_service import BaseSalesService, decimal_or_zero


class DiscountService(BaseSalesService):
    repository = DiscountRepository
    entity_name = "Discount"
    duplicate_fields = ("code",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "name", "code", "discount_type", "value", "status")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "organization_id")
            cls.ensure_required(payload, "name")
            cls.ensure_required(payload, "discount_type")
            cls.ensure_required(payload, "value")
        cls.validate_org_scope(db, payload, item)
        discount_type = payload.get("discount_type", getattr(item, "discount_type", None))
        value = decimal_or_zero(payload.get("value", getattr(item, "value", 0)))
        if discount_type == "Percentage" and value > 100:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Percentage discount cannot exceed 100"})
