from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models.sales import InvoicePayment, Payment
from app.repositories.payment_repository import PaymentRepository
from app.services.inventory_service import generate_identifier, normalize_payload
from app.services.invoice_service import update_invoice_payment_rollup
from app.services.order_service import BaseSalesService, decimal_or_zero, update_order_payment_rollup


class PaymentService(BaseSalesService):
    repository = PaymentRepository
    entity_name = "Payment"
    duplicate_fields = ("payment_number",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "customer_id", "order_id", "invoice_id", "payment_number", "payment_method", "status", "amount")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db, item
        if not payload.get("payment_number"):
            payload["payment_number"] = generate_identifier("PAY")
        if payload.get("status") == "Paid" and not payload.get("paid_at"):
            payload["paid_at"] = datetime.now(timezone.utc)

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "organization_id")
            cls.ensure_required(payload, "customer_id")
            cls.ensure_required(payload, "amount")
        cls.validate_org_scope(db, payload, item)

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Payment:
        payload = normalize_payload(cls.repository.to_dict(data))
        cls.prepare_payload(db, payload)
        cls.validate_payload(db, payload)
        cls.ensure_unique(db, payload)
        payment = Payment(**payload, created_by=user_id)
        db.add(payment)
        db.flush()
        if payment.invoice_id and payment.status == "Paid" and decimal_or_zero(payment.amount) > 0:
            db.add(
                InvoicePayment(
                    invoice_id=payment.invoice_id,
                    payment_id=payment.id,
                    amount=payment.amount,
                    created_by=user_id,
                )
            )
        db.flush()
        update_invoice_payment_rollup(db, payment.invoice_id, user_id)
        update_order_payment_rollup(db, payment.order_id, user_id)
        db.commit()
        db.refresh(payment)
        return payment

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Payment:
        payment = super().update(db, item_id, data, user_id)
        if payment.invoice_id and payment.status == "Paid":
            existing = (
                db.query(InvoicePayment)
                .filter(InvoicePayment.invoice_id == payment.invoice_id, InvoicePayment.payment_id == payment.id)
                .first()
            )
            if existing:
                existing.amount = payment.amount
                existing.updated_by = user_id
            else:
                db.add(
                    InvoicePayment(
                        invoice_id=payment.invoice_id,
                        payment_id=payment.id,
                        amount=payment.amount,
                        created_by=user_id,
                    )
                )
        update_invoice_payment_rollup(db, payment.invoice_id, user_id)
        update_order_payment_rollup(db, payment.order_id, user_id)
        db.commit()
        db.refresh(payment)
        return payment
