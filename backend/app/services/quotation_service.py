from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.customer import Customer
from app.models.organization import Organization
from app.models.sales import Quote, QuoteApproval, QuoteItem, QuoteVersion
from app.repositories.quotation_repository import (
    QuoteApprovalRepository,
    QuoteItemRepository,
    QuoteRepository,
    QuoteVersionRepository,
)
from app.services.inventory_service import generate_identifier, normalize_payload
from app.services.order_service import BaseSalesService, decimal_or_zero, prepare_sales_line


def recalculate_quote_totals(quote: Quote) -> None:
    subtotal = sum(decimal_or_zero(item.quantity) * decimal_or_zero(item.unit_price) for item in quote.items)
    discount = sum(decimal_or_zero(item.discount_amount) for item in quote.items)
    tax = sum(decimal_or_zero(item.tax_amount) for item in quote.items)
    quote.subtotal = subtotal
    quote.discount_total = discount
    quote.tax_total = tax
    quote.grand_total = max(subtotal - discount + tax + decimal_or_zero(quote.shipping_cost), decimal_or_zero(0))


class QuotationService(BaseSalesService):
    repository = QuoteRepository
    entity_name = "Quote"
    duplicate_fields = ("quote_number",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "customer_id", "quote_number", "status", "grand_total")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db, item
        if not payload.get("quote_number"):
            payload["quote_number"] = generate_identifier("QTE")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "organization_id")
            cls.ensure_required(payload, "customer_id")
        cls.ensure_exists(db, Organization, payload.get("organization_id", getattr(item, "organization_id", None)), "organization_id")
        cls.ensure_exists(db, Company, payload.get("company_id", getattr(item, "company_id", None)), "company_id")
        cls.ensure_exists(db, Customer, payload.get("customer_id", getattr(item, "customer_id", None)), "customer_id")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Quote:
        payload = normalize_payload(cls.repository.to_dict(data))
        item_payloads = [normalize_payload(dict(item)) for item in payload.pop("items", [])]
        cls.prepare_payload(db, payload)
        cls.validate_payload(db, payload)
        cls.ensure_unique(db, payload)
        quote = Quote(**payload, created_by=user_id)
        db.add(quote)
        db.flush()
        for item_payload in item_payloads:
            prepare_sales_line(db, item_payload, require_warehouse=False)
            item = QuoteItem(quote_id=quote.id, created_by=user_id, **item_payload)
            db.add(item)
        db.flush()
        recalculate_quote_totals(quote)
        cls.create_version(db, quote, user_id)
        db.commit()
        db.refresh(quote)
        return quote

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Quote:
        quote = cls.get(db, item_id)
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))
        cls.prepare_payload(db, payload, item=quote)
        cls.validate_payload(db, payload, item=quote)
        cls.ensure_unique(db, payload, exclude_id=item_id)
        for key, value in payload.items():
            setattr(quote, key, value)
        quote.updated_by = user_id
        recalculate_quote_totals(quote)
        if "status" in payload and payload["status"] == "Approved":
            db.add(
                QuoteApproval(
                    quote_id=quote.id,
                    status="Approved",
                    approved_by=user_id,
                    approved_at=datetime.now(timezone.utc),
                    created_by=user_id,
                )
            )
        cls.create_version(db, quote, user_id)
        db.commit()
        db.refresh(quote)
        return quote

    @classmethod
    def create_version(cls, db: Session, quote: Quote, user_id: int | None = None) -> QuoteVersion:
        version_number = len(quote.versions or []) + 1
        snapshot = {
            "quote_number": quote.quote_number,
            "status": quote.status,
            "subtotal": str(quote.subtotal),
            "discount_total": str(quote.discount_total),
            "tax_total": str(quote.tax_total),
            "shipping_cost": str(quote.shipping_cost),
            "grand_total": str(quote.grand_total),
            "items": [
                {
                    "product_id": item.product_id,
                    "variant_id": item.variant_id,
                    "sku": item.sku,
                    "name": item.name,
                    "quantity": item.quantity,
                    "unit_price": str(item.unit_price),
                    "line_total": str(item.line_total),
                }
                for item in quote.items
            ],
        }
        version = QuoteVersion(quote_id=quote.id, version_number=version_number, snapshot=snapshot, created_by=user_id)
        db.add(version)
        return version


class QuoteItemService(BaseSalesService):
    repository = QuoteItemRepository
    entity_name = "Quote item"
    export_fields = ("id", "uuid", "quote_id", "product_id", "sku", "quantity", "line_total")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "quote_id")
            cls.ensure_required(payload, "product_id")
        cls.ensure_exists(db, Quote, payload.get("quote_id", getattr(item, "quote_id", None)), "quote_id")
        prepare_sales_line(db, payload, require_warehouse=False)

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> QuoteItem:
        item = super().create(db, data, user_id)
        if item.quote:
            recalculate_quote_totals(item.quote)
            QuotationService.create_version(db, item.quote, user_id)
            db.commit()
            db.refresh(item)
        return item

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> QuoteItem:
        item = super().update(db, item_id, data, user_id)
        if item.quote:
            recalculate_quote_totals(item.quote)
            QuotationService.create_version(db, item.quote, user_id)
            db.commit()
            db.refresh(item)
        return item


class QuoteVersionService(BaseSalesService):
    repository = QuoteVersionRepository
    entity_name = "Quote version"
    export_fields = ("id", "uuid", "quote_id", "version_number", "created_at")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "quote_id")
            cls.ensure_required(payload, "version_number")
        cls.ensure_exists(db, Quote, payload.get("quote_id", getattr(item, "quote_id", None)), "quote_id")


class QuoteApprovalService(BaseSalesService):
    repository = QuoteApprovalRepository
    entity_name = "Quote approval"
    export_fields = ("id", "uuid", "quote_id", "status", "approved_by", "approved_at")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "quote_id")
        cls.ensure_exists(db, Quote, payload.get("quote_id", getattr(item, "quote_id", None)), "quote_id")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> QuoteApproval:
        payload = normalize_payload(cls.repository.to_dict(data))
        if payload.get("status") == "Approved" and not payload.get("approved_at"):
            payload["approved_at"] = datetime.now(timezone.utc)
        if payload.get("status") == "Approved" and not payload.get("approved_by"):
            payload["approved_by"] = user_id
        cls.validate_payload(db, payload)
        approval = cls.repository.create(db, payload, user_id)
        quote = db.query(Quote).filter(Quote.id == approval.quote_id).first()
        if quote and approval.status == "Approved":
            quote.status = "Approved"
            quote.updated_by = user_id
            db.commit()
            db.refresh(approval)
        return approval


QuoteService = QuotationService
