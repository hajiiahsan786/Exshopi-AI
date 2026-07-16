from typing import Any

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.sales import Invoice, InvoiceItem, InvoicePayment, SalesOrder
from app.repositories.invoice_repository import InvoiceItemRepository, InvoicePaymentRepository, InvoiceRepository
from app.services.inventory_service import generate_identifier, normalize_payload
from app.services.order_service import BaseSalesService, decimal_or_zero, prepare_sales_line, update_order_payment_rollup


def recalculate_invoice_totals(invoice: Invoice) -> None:
    subtotal = sum(decimal_or_zero(item.quantity) * decimal_or_zero(item.unit_price) for item in invoice.items)
    discount = sum(decimal_or_zero(item.discount_amount) for item in invoice.items)
    tax = sum(decimal_or_zero(item.tax_amount) for item in invoice.items)
    paid = decimal_or_zero(invoice.paid_amount)
    invoice.subtotal = subtotal
    invoice.discount_total = discount
    invoice.tax_total = tax
    invoice.grand_total = max(subtotal - discount + tax + decimal_or_zero(invoice.shipping_cost), decimal_or_zero(0))
    invoice.outstanding_balance = max(invoice.grand_total - paid - decimal_or_zero(invoice.refund_total), decimal_or_zero(0))
    if paid >= invoice.grand_total and invoice.grand_total > 0:
        invoice.payment_status = "Paid"
        invoice.status = "Paid"
    elif paid > 0:
        invoice.payment_status = "Partially Paid"


def update_invoice_payment_rollup(db: Session, invoice_id: int | None, user_id: int | None = None) -> None:
    if invoice_id is None:
        return
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        return
    paid = (
        db.query(func.coalesce(func.sum(InvoicePayment.amount), 0))
        .filter(InvoicePayment.invoice_id == invoice_id, InvoicePayment.deleted_at.is_(None))
        .scalar()
    )
    invoice.paid_amount = decimal_or_zero(paid)
    recalculate_invoice_totals(invoice)
    invoice.updated_by = user_id
    update_order_payment_rollup(db, invoice.order_id, user_id)


class InvoiceService(BaseSalesService):
    repository = InvoiceRepository
    entity_name = "Invoice"
    duplicate_fields = ("invoice_number",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "customer_id", "order_id", "invoice_number", "payment_status", "grand_total")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db, item
        if not payload.get("invoice_number"):
            payload["invoice_number"] = generate_identifier("INV")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "organization_id")
            cls.ensure_required(payload, "customer_id")
        cls.validate_org_scope(db, payload, item)
        cls.ensure_exists(db, SalesOrder, payload.get("order_id", getattr(item, "order_id", None)), "order_id")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Invoice:
        payload = normalize_payload(cls.repository.to_dict(data))
        item_payloads = [normalize_payload(dict(item)) for item in payload.pop("items", [])]
        cls.prepare_payload(db, payload)
        cls.validate_payload(db, payload)
        cls.ensure_unique(db, payload)
        invoice = Invoice(**payload, created_by=user_id)
        db.add(invoice)
        db.flush()
        for item_payload in item_payloads:
            prepare_sales_line(db, item_payload, require_warehouse=False)
            db.add(InvoiceItem(invoice_id=invoice.id, created_by=user_id, **item_payload))
        db.flush()
        recalculate_invoice_totals(invoice)
        db.commit()
        db.refresh(invoice)
        return invoice

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Invoice:
        invoice = super().update(db, item_id, data, user_id)
        recalculate_invoice_totals(invoice)
        update_order_payment_rollup(db, invoice.order_id, user_id)
        db.commit()
        db.refresh(invoice)
        return invoice


class InvoiceItemService(BaseSalesService):
    repository = InvoiceItemRepository
    entity_name = "Invoice item"
    export_fields = ("id", "uuid", "invoice_id", "product_id", "sku", "quantity", "line_total")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "invoice_id")
            cls.ensure_required(payload, "product_id")
        cls.ensure_exists(db, Invoice, payload.get("invoice_id", getattr(item, "invoice_id", None)), "invoice_id")
        prepare_sales_line(db, payload, require_warehouse=False)

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> InvoiceItem:
        item = super().create(db, data, user_id)
        if item.invoice:
            recalculate_invoice_totals(item.invoice)
            update_order_payment_rollup(db, item.invoice.order_id, user_id)
            db.commit()
            db.refresh(item)
        return item


class InvoicePaymentService(BaseSalesService):
    repository = InvoicePaymentRepository
    entity_name = "Invoice payment"
    export_fields = ("id", "uuid", "invoice_id", "payment_id", "amount", "applied_at")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "invoice_id")
            cls.ensure_required(payload, "payment_id")
            cls.ensure_required(payload, "amount")
        cls.ensure_exists(db, Invoice, payload.get("invoice_id", getattr(item, "invoice_id", None)), "invoice_id")
        if decimal_or_zero(payload.get("amount", getattr(item, "amount", 0))) <= 0:
            raise HTTPException(status_code=400, detail={"success": False, "message": "amount must be positive"})

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> InvoicePayment:
        link = super().create(db, data, user_id)
        update_invoice_payment_rollup(db, link.invoice_id, user_id)
        db.commit()
        db.refresh(link)
        return link
