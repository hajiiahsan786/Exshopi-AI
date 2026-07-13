from typing import Any

from sqlalchemy.orm import Session

from app.models.sales import SalesOrder, Shipment, ShippingMethod
from app.repositories.shipment_repository import ShipmentRepository, ShippingMethodRepository
from app.services.inventory_service import generate_identifier
from app.services.order_service import BaseSalesService


class ShippingMethodService(BaseSalesService):
    repository = ShippingMethodRepository
    entity_name = "Shipping method"
    export_fields = ("id", "uuid", "organization_id", "company_id", "name", "courier", "base_rate", "status")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "organization_id")
            cls.ensure_required(payload, "name")
        cls.validate_org_scope(db, payload, item)


class ShipmentService(BaseSalesService):
    repository = ShipmentRepository
    entity_name = "Shipment"
    duplicate_fields = ("shipment_number", "tracking_number")
    export_fields = ("id", "uuid", "organization_id", "company_id", "order_id", "shipment_number", "tracking_number", "courier", "status")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db, item
        if not payload.get("shipment_number"):
            payload["shipment_number"] = generate_identifier("SHP")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "organization_id")
            cls.ensure_required(payload, "order_id")
        cls.validate_org_scope(db, payload, item)
        cls.ensure_exists(db, SalesOrder, payload.get("order_id", getattr(item, "order_id", None)), "order_id")
        cls.ensure_exists(db, ShippingMethod, payload.get("shipping_method_id", getattr(item, "shipping_method_id", None)), "shipping_method_id")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Shipment:
        shipment = super().create(db, data, user_id)
        cls.sync_order_shipment_status(db, shipment, user_id)
        db.commit()
        db.refresh(shipment)
        return shipment

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Shipment:
        shipment = super().update(db, item_id, data, user_id)
        cls.sync_order_shipment_status(db, shipment, user_id)
        db.commit()
        db.refresh(shipment)
        return shipment

    @staticmethod
    def sync_order_shipment_status(db: Session, shipment: Shipment, user_id: int | None = None) -> None:
        order = db.query(SalesOrder).filter(SalesOrder.id == shipment.order_id).first()
        if not order:
            return
        order.shipment_status = shipment.status
        if shipment.status == "Delivered" and order.status not in {"Completed", "Cancelled", "Refunded", "Returned"}:
            order.status = "Delivered"
        elif shipment.status in {"Dispatched", "In Transit"} and order.status not in {"Delivered", "Completed"}:
            order.status = "Shipped"
        order.updated_by = user_id
