from __future__ import annotations
import csv
import io
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.customer import Customer
from app.models.inventory import Inventory, Product, ProductVariant, StockMovement, Warehouse
from app.models.organization import Organization
from app.models.sales import (
    Invoice,
    InvoiceItem,
    OrderHistory,
    OrderItem,
    OrderTimeline,
    Payment,
    SalesOrder,
    Shipment,
)
from app.repositories.order_repository import (
    OrderAttachmentRepository,
    OrderHistoryRepository,
    OrderItemRepository,
    OrderNoteRepository,
    OrderTimelineRepository,
    SalesOrderRepository,
    SalesRepository,
)
from app.schemas.crm_common import PaginatedResponse
from app.services.inventory_service import build_xlsx, generate_identifier, normalize_payload, serialize_export_value


COMMITTED_ORDER_STATUSES = {"Confirmed", "Processing", "Packed", "Ready", "Shipped", "Delivered", "Completed"}
CLOSED_ORDER_STATUSES = {"Cancelled", "Refunded", "Returned"}
PAID_PAYMENT_STATUSES = {"Paid"}


class BaseSalesService:
    repository: type[SalesRepository]
    entity_name = "Sales entity"
    duplicate_fields: tuple[str, ...] = ()
    export_fields: tuple[str, ...] = ("id", "uuid", "status", "created_at", "updated_at")

    @classmethod
    def list(cls, db: Session, **params: Any) -> PaginatedResponse:
        items, total = cls.repository.list(db, **params)
        page = params.get("page", 1)
        page_size = params.get("page_size", 20)
        pages = (total + page_size - 1) // page_size if total else 0
        return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)

    @classmethod
    def get(cls, db: Session, item_id: int, include_deleted: bool = False) -> Any:
        item = cls.repository.get_by_id(db, item_id, include_deleted=include_deleted)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False, "message": f"{cls.entity_name} not found", "errors": {"id": item_id}},
            )
        return item

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Any:
        payload = normalize_payload(cls.repository.to_dict(data))
        cls.prepare_payload(db, payload)
        cls.validate_payload(db, payload)
        cls.ensure_unique(db, payload)
        return cls.repository.create(db, payload, user_id)

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Any:
        item = cls.get(db, item_id)
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))
        cls.prepare_payload(db, payload, item=item)
        cls.validate_payload(db, payload, item=item)
        cls.ensure_unique(db, payload, exclude_id=item_id)
        return cls.repository.update(db, item, payload, user_id)

    @classmethod
    def delete(cls, db: Session, item_id: int, user_id: int | None = None) -> Any:
        return cls.repository.soft_delete(db, cls.get(db, item_id), user_id)

    @classmethod
    def restore(cls, db: Session, item_id: int, user_id: int | None = None) -> Any:
        return cls.repository.restore(db, cls.get(db, item_id, include_deleted=True), user_id)

    @classmethod
    def permanent_delete(cls, db: Session, item_id: int) -> dict[str, int]:
        item = cls.get(db, item_id, include_deleted=True)
        cls.repository.hard_delete(db, item)
        return {"deleted": item_id}

    @classmethod
    def bulk_delete(cls, db: Session, ids: list[int], user_id: int | None = None) -> dict[str, Any]:
        items = cls.repository.bulk_get(db, ids)
        for item in items:
            cls.repository.soft_delete(db, item, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_restore(cls, db: Session, ids: list[int], user_id: int | None = None) -> dict[str, Any]:
        items = cls.repository.bulk_get(db, ids, include_deleted=True)
        for item in items:
            cls.repository.restore(db, item, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_update(cls, db: Session, ids: list[int], values: dict[str, Any], user_id: int | None = None) -> dict[str, Any]:
        items = cls.repository.bulk_get(db, ids)
        allowed_values = {key: value for key, value in values.items() if hasattr(cls.repository.model, key)}
        for item in items:
            cls.update(db, item.id, allowed_values, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_status(cls, db: Session, ids: list[int], new_status: str, user_id: int | None = None) -> dict[str, Any]:
        return cls.bulk_update(db, ids, {"status": new_status}, user_id)

    @classmethod
    async def import_csv(cls, db: Session, file: UploadFile, create_schema: type[Any], user_id: int | None = None) -> dict[str, Any]:
        raw = await file.read()
        reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
        created: list[int] = []
        errors: list[dict[str, Any]] = []
        for row_number, row in enumerate(reader, start=2):
            try:
                data = create_schema(**{key: (None if value == "" else value) for key, value in row.items()})
                created.append(cls.create(db, data, user_id).id)
            except Exception as exc:  # noqa: BLE001 - import should collect all row-level errors.
                errors.append({"row": row_number, "error": getattr(exc, "detail", str(exc))})
        return {"created": len(created), "ids": created, "errors": errors}

    @classmethod
    def export_rows(cls, db: Session, export_format: str = "json") -> Any:
        export_format = export_format.lower()
        items, _ = cls.repository.list(db, page=1, page_size=10000, include_deleted=True)
        rows = [{field: getattr(item, field, None) for field in cls.export_fields} for item in items]
        if export_format == "json":
            return rows
        if export_format == "xlsx":
            return build_xlsx(rows, cls.export_fields)
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=list(cls.export_fields))
        writer.writeheader()
        for row in rows:
            writer.writerow({field: serialize_export_value(row.get(field)) for field in cls.export_fields})
        return output.getvalue()

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db, payload, item

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db, payload, item

    @classmethod
    def ensure_unique(cls, db: Session, payload: dict[str, Any], exclude_id: int | None = None) -> None:
        for field_name in cls.duplicate_fields:
            value = payload.get(field_name)
            if not value:
                continue
            existing = cls.repository.get_by_field(db, field_name, value, exclude_id=exclude_id, include_deleted=True)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={"success": False, "message": f"Duplicate {field_name}", "errors": {field_name: value}},
                )

    @staticmethod
    def ensure_required(payload: dict[str, Any], field_name: str) -> None:
        if payload.get(field_name) is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": f"{field_name} is required", "errors": {field_name: "required"}},
            )

    @staticmethod
    def ensure_exists(db: Session, model: type[Any], item_id: int | None, label: str) -> None:
        if item_id is None:
            return
        exists = db.query(model.id).filter(model.id == item_id).first()
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": f"Invalid {label}", "errors": {label: item_id}},
            )

    @classmethod
    def validate_org_scope(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        organization_id = payload.get("organization_id", getattr(item, "organization_id", None))
        company_id = payload.get("company_id", getattr(item, "company_id", None))
        customer_id = payload.get("customer_id", getattr(item, "customer_id", None))
        cls.ensure_exists(db, Organization, organization_id, "organization_id")
        cls.ensure_exists(db, Company, company_id, "company_id")
        cls.ensure_exists(db, Customer, customer_id, "customer_id")
        if customer_id and organization_id:
            customer = db.query(Customer).filter(Customer.id == customer_id).first()
            if customer and customer.organization_id != organization_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"success": False, "message": "customer_id does not belong to organization_id"},
                )


def decimal_or_zero(value: Any) -> Decimal:
    if value is None:
        return Decimal("0")
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def calculate_line_total(payload: dict[str, Any]) -> Decimal:
    quantity = decimal_or_zero(payload.get("quantity"))
    unit_price = decimal_or_zero(payload.get("unit_price"))
    discount = decimal_or_zero(payload.get("discount_amount"))
    tax = decimal_or_zero(payload.get("tax_amount"))
    total = quantity * unit_price - discount + tax
    if total < 0:
        raise HTTPException(status_code=400, detail={"success": False, "message": "Line total cannot be negative"})
    return total.quantize(Decimal("0.01"))


def prepare_sales_line(db: Session, payload: dict[str, Any], *, require_warehouse: bool = False) -> dict[str, Any]:
    product_id = payload.get("product_id")
    variant_id = payload.get("variant_id")
    warehouse_id = payload.get("warehouse_id")
    if product_id is None:
        raise HTTPException(status_code=400, detail={"success": False, "message": "product_id is required"})
    if require_warehouse and warehouse_id is None:
        raise HTTPException(status_code=400, detail={"success": False, "message": "warehouse_id is required"})

    product = db.query(Product).filter(Product.id == product_id, Product.deleted_at.is_(None)).first()
    if not product:
        raise HTTPException(status_code=400, detail={"success": False, "message": "Invalid product_id"})

    variant = None
    if variant_id is not None:
        variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id, ProductVariant.deleted_at.is_(None)).first()
        if not variant:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Invalid variant_id"})
        if variant.product_id != product_id:
            raise HTTPException(status_code=400, detail={"success": False, "message": "variant_id does not belong to product_id"})

    if warehouse_id is not None:
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id, Warehouse.deleted_at.is_(None)).first()
        if not warehouse:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Invalid warehouse_id"})

    payload["sku"] = payload.get("sku") or (variant.sku if variant else product.sku)
    payload["name"] = payload.get("name") or product.name
    payload["line_total"] = calculate_line_total(payload)
    return payload


def recalculate_order_totals(order: SalesOrder) -> None:
    subtotal = Decimal("0")
    discount_total = Decimal("0")
    tax_total = Decimal("0")
    for item in order.items:
        subtotal += decimal_or_zero(item.quantity) * decimal_or_zero(item.unit_price)
        discount_total += decimal_or_zero(item.discount_amount)
        tax_total += decimal_or_zero(item.tax_amount)
        item.line_total = calculate_line_total(
            {
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "discount_amount": item.discount_amount,
                "tax_amount": item.tax_amount,
            }
        )
    order.subtotal = subtotal.quantize(Decimal("0.01"))
    order.discount_total = discount_total.quantize(Decimal("0.01"))
    order.tax_total = tax_total.quantize(Decimal("0.01"))
    order.grand_total = (order.subtotal - order.discount_total + order.tax_total + decimal_or_zero(order.shipping_cost)).quantize(
        Decimal("0.01")
    )
    order.outstanding_balance = max(
        order.grand_total - decimal_or_zero(order.paid_amount) - decimal_or_zero(order.refund_total),
        Decimal("0"),
    ).quantize(Decimal("0.01"))
    if order.paid_amount >= order.grand_total and order.grand_total > 0:
        order.payment_status = "Paid"
    elif order.paid_amount > 0:
        order.payment_status = "Partially Paid"
    elif order.payment_status not in {"Failed", "Refunded", "Authorized"}:
        order.payment_status = "Pending"


def update_order_payment_rollup(db: Session, order_id: int | None, user_id: int | None = None) -> None:
    if order_id is None:
        return
    order = db.query(SalesOrder).filter(SalesOrder.id == order_id).first()
    if not order:
        return
    paid = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
        Payment.order_id == order_id,
        Payment.status.in_(PAID_PAYMENT_STATUSES),
        Payment.deleted_at.is_(None),
    ).scalar()
    if decimal_or_zero(paid) == 0:
        paid = (
            db.query(func.coalesce(func.sum(Invoice.paid_amount), 0))
            .filter(Invoice.order_id == order_id, Invoice.deleted_at.is_(None))
            .scalar()
        )
    order.paid_amount = decimal_or_zero(paid)
    recalculate_order_totals(order)
    order.updated_by = user_id


class OrderInventoryManager:
    @staticmethod
    def find_inventory(
        db: Session,
        *,
        product_id: int,
        variant_id: int | None,
        warehouse_id: int,
    ) -> Inventory:
        inventory = (
            db.query(Inventory)
            .filter(
                Inventory.product_id == product_id,
                Inventory.variant_id.is_(None) if variant_id is None else Inventory.variant_id == variant_id,
                Inventory.warehouse_id == warehouse_id,
                Inventory.deleted_at.is_(None),
            )
            .first()
        )
        if not inventory:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Inventory row not found"})
        return inventory

    @staticmethod
    def recalculate_inventory(inventory: Inventory) -> None:
        inventory.available_stock = max(
            (inventory.current_stock or 0)
            - (inventory.reserved_stock or 0)
            + (inventory.incoming_stock or 0)
            - (inventory.outgoing_stock or 0),
            0,
        )

    @staticmethod
    def movement(
        *,
        item: OrderItem,
        movement_type: str,
        quantity: int,
        before: int,
        after: int,
        user_id: int | None,
        reason: str,
    ) -> StockMovement:
        return StockMovement(
            product_id=item.product_id,
            variant_id=item.variant_id,
            warehouse_id=item.warehouse_id,
            movement_type=movement_type,
            quantity=quantity,
            quantity_before=before,
            quantity_after=after,
            reference_type="sales_order",
            reference_id=item.order_id,
            reason=reason,
            notes=f"Order item {item.id}" if item.id else None,
            moved_at=datetime.now(timezone.utc),
            created_by=user_id,
        )

    @classmethod
    def reserve_item(cls, db: Session, item: OrderItem, user_id: int | None = None) -> None:
        if item.stock_status not in {"pending", "released", "restored"}:
            return
        inventory = cls.find_inventory(
            db,
            product_id=item.product_id,
            variant_id=item.variant_id,
            warehouse_id=item.warehouse_id,
        )
        cls.recalculate_inventory(inventory)
        if inventory.available_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={
                    "success": False,
                    "message": "Insufficient stock",
                    "errors": {
                        "product_id": item.product_id,
                        "variant_id": item.variant_id,
                        "warehouse_id": item.warehouse_id,
                        "available_stock": inventory.available_stock,
                        "requested": item.quantity,
                    },
                },
            )
        before = inventory.current_stock
        inventory.reserved_stock += item.quantity
        cls.recalculate_inventory(inventory)
        item.stock_status = "reserved"
        db.add(cls.movement(item=item, movement_type="Sale", quantity=item.quantity, before=before, after=before, user_id=user_id, reason="Reserved stock"))

    @classmethod
    def commit_item(cls, db: Session, item: OrderItem, user_id: int | None = None) -> None:
        if item.stock_status == "committed":
            return
        inventory = cls.find_inventory(
            db,
            product_id=item.product_id,
            variant_id=item.variant_id,
            warehouse_id=item.warehouse_id,
        )
        before = inventory.current_stock
        after = before - item.quantity
        if after < 0:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Negative stock is not allowed"})
        if inventory.reserved_stock >= item.quantity:
            inventory.reserved_stock -= item.quantity
        inventory.current_stock = after
        cls.recalculate_inventory(inventory)
        item.stock_status = "committed"
        db.add(
            cls.movement(
                item=item,
                movement_type="Sale",
                quantity=-item.quantity,
                before=before,
                after=after,
                user_id=user_id,
                reason="Committed stock for sales order",
            )
        )

    @classmethod
    def release_item(cls, db: Session, item: OrderItem, user_id: int | None = None) -> None:
        if item.stock_status != "reserved":
            return
        inventory = cls.find_inventory(
            db,
            product_id=item.product_id,
            variant_id=item.variant_id,
            warehouse_id=item.warehouse_id,
        )
        before = inventory.current_stock
        inventory.reserved_stock = max(inventory.reserved_stock - item.quantity, 0)
        cls.recalculate_inventory(inventory)
        item.stock_status = "released"
        db.add(
            cls.movement(
                item=item,
                movement_type="Sale",
                quantity=-item.quantity,
                before=before,
                after=before,
                user_id=user_id,
                reason="Released reserved sales order stock",
            )
        )

    @classmethod
    def restore_item(cls, db: Session, item: OrderItem, user_id: int | None = None) -> None:
        if item.stock_status not in {"committed"}:
            return
        inventory = cls.find_inventory(
            db,
            product_id=item.product_id,
            variant_id=item.variant_id,
            warehouse_id=item.warehouse_id,
        )
        before = inventory.current_stock
        inventory.current_stock += item.quantity
        cls.recalculate_inventory(inventory)
        item.stock_status = "restored"
        db.add(
            cls.movement(
                item=item,
                movement_type="Return",
                quantity=item.quantity,
                before=before,
                after=inventory.current_stock,
                user_id=user_id,
                reason="Restored stock from sales order",
            )
        )

    @staticmethod
    def sync_product_stock(db: Session, product_id: int, variant_id: int | None = None, user_id: int | None = None) -> None:
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            current, reserved, available = (
                db.query(
                    func.coalesce(func.sum(Inventory.current_stock), 0),
                    func.coalesce(func.sum(Inventory.reserved_stock), 0),
                    func.coalesce(func.sum(Inventory.available_stock), 0),
                )
                .filter(Inventory.product_id == product_id, Inventory.deleted_at.is_(None))
                .one()
            )
            product.quantity = int(current or 0)
            product.reserved_quantity = int(reserved or 0)
            product.available_quantity = int(available or 0)
            product.updated_by = user_id
        if variant_id is not None:
            variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
            if variant:
                current, reserved, available = (
                    db.query(
                        func.coalesce(func.sum(Inventory.current_stock), 0),
                        func.coalesce(func.sum(Inventory.reserved_stock), 0),
                        func.coalesce(func.sum(Inventory.available_stock), 0),
                    )
                    .filter(Inventory.product_id == product_id, Inventory.variant_id == variant_id, Inventory.deleted_at.is_(None))
                    .one()
                )
                variant.quantity = int(current or 0)
                variant.reserved_quantity = int(reserved or 0)
                variant.available_quantity = int(available or 0)
                variant.updated_by = user_id


class SalesOrderService(BaseSalesService):
    repository = SalesOrderRepository
    entity_name = "Sales order"
    duplicate_fields = ("order_number",)
    export_fields = (
        "id",
        "uuid",
        "organization_id",
        "company_id",
        "customer_id",
        "order_number",
        "status",
        "payment_status",
        "shipment_status",
        "grand_total",
        "paid_amount",
        "outstanding_balance",
        "order_date",
    )

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db, item
        if not payload.get("order_number"):
            payload["order_number"] = generate_identifier("SO")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "organization_id")
            cls.ensure_required(payload, "customer_id")
        cls.validate_org_scope(db, payload, item)

    @staticmethod
    def add_timeline(
        db: Session,
        *,
        order_id: int,
        event_type: str,
        title: str,
        user_id: int | None,
        description: str | None = None,
        payload: dict[str, Any] | None = None,
    ) -> None:
        db.add(
            OrderTimeline(
                order_id=order_id,
                event_type=event_type,
                title=title,
                description=description,
                payload=payload or {},
                occurred_at=datetime.now(timezone.utc),
                created_by=user_id,
            )
        )

    @staticmethod
    def add_history(
        db: Session,
        *,
        order_id: int,
        field_name: str,
        old_value: Any,
        new_value: Any,
        user_id: int | None,
    ) -> None:
        db.add(
            OrderHistory(
                order_id=order_id,
                field_name=field_name,
                old_value=None if old_value is None else str(old_value),
                new_value=None if new_value is None else str(new_value),
                changed_at=datetime.now(timezone.utc),
                changed_by=user_id,
                created_by=user_id,
            )
        )

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> SalesOrder:
        payload = normalize_payload(cls.repository.to_dict(data))
        item_payloads = [normalize_payload(dict(item)) for item in payload.pop("items", [])]
        cls.prepare_payload(db, payload)
        cls.validate_payload(db, payload)
        cls.ensure_unique(db, payload)

        order = SalesOrder(**payload)
        order.created_by = user_id
        db.add(order)
        db.flush()

        for item_payload in item_payloads:
            prepare_sales_line(db, item_payload, require_warehouse=True)
            item = OrderItem(order_id=order.id, stock_status="pending", created_by=user_id, **item_payload)
            db.add(item)
            db.flush()
            OrderInventoryManager.reserve_item(db, item, user_id)
            OrderInventoryManager.sync_product_stock(db, item.product_id, item.variant_id, user_id)

        recalculate_order_totals(order)
        cls._apply_order_lifecycle(db, order, None, order.status, user_id)
        cls._ensure_invoice(db, order, user_id)
        cls._ensure_shipment(db, order, user_id)
        cls.add_timeline(db, order_id=order.id, event_type="order.created", title="Order created", user_id=user_id)
        cls.add_history(db, order_id=order.id, field_name="status", old_value=None, new_value=order.status, user_id=user_id)
        db.commit()
        db.refresh(order)
        return order

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> SalesOrder:
        order = cls.get(db, item_id)
        old_values = {
            "status": order.status,
            "payment_status": order.payment_status,
            "shipment_status": order.shipment_status,
            "shipping_cost": order.shipping_cost,
        }
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))
        cls.prepare_payload(db, payload, item=order)
        cls.validate_payload(db, payload, item=order)
        cls.ensure_unique(db, payload, exclude_id=item_id)

        for key, value in payload.items():
            setattr(order, key, value)
        order.updated_by = user_id

        if "status" in payload:
            cls._apply_order_lifecycle(db, order, old_values["status"], order.status, user_id)
        if order.status == "Shipped":
            order.shipment_status = "Dispatched"
        if order.status == "Delivered":
            order.shipment_status = "Delivered"

        recalculate_order_totals(order)
        cls._sync_generated_invoice(db, order, user_id)
        cls._sync_generated_shipment(db, order, user_id)
        for field_name, old_value in old_values.items():
            new_value = getattr(order, field_name)
            if str(old_value) != str(new_value):
                cls.add_history(db, order_id=order.id, field_name=field_name, old_value=old_value, new_value=new_value, user_id=user_id)
        if "status" in payload and old_values["status"] != order.status:
            cls.add_timeline(
                db,
                order_id=order.id,
                event_type="order.status_changed",
                title=f"Order {order.status}",
                user_id=user_id,
                payload={"old_status": old_values["status"], "new_status": order.status},
            )
        db.commit()
        db.refresh(order)
        return order

    @classmethod
    def delete(cls, db: Session, item_id: int, user_id: int | None = None) -> SalesOrder:
        order = cls.get(db, item_id)
        cls._apply_order_lifecycle(db, order, order.status, "Cancelled", user_id)
        order.status = "Cancelled"
        order.deleted_at = datetime.now(timezone.utc)
        order.deleted_by = user_id
        cls.add_timeline(db, order_id=order.id, event_type="order.deleted", title="Order cancelled and deleted", user_id=user_id)
        db.commit()
        db.refresh(order)
        return order

    @classmethod
    def _apply_order_lifecycle(
        cls,
        db: Session,
        order: SalesOrder,
        old_status: str | None,
        new_status: str,
        user_id: int | None,
    ) -> None:
        if new_status in COMMITTED_ORDER_STATUSES and old_status not in COMMITTED_ORDER_STATUSES:
            for item in order.items:
                OrderInventoryManager.commit_item(db, item, user_id)
                OrderInventoryManager.sync_product_stock(db, item.product_id, item.variant_id, user_id)
            return
        if new_status in CLOSED_ORDER_STATUSES and old_status not in CLOSED_ORDER_STATUSES:
            for item in order.items:
                if item.stock_status == "reserved":
                    OrderInventoryManager.release_item(db, item, user_id)
                elif item.stock_status == "committed":
                    OrderInventoryManager.restore_item(db, item, user_id)
                OrderInventoryManager.sync_product_stock(db, item.product_id, item.variant_id, user_id)

    @classmethod
    def _ensure_invoice(cls, db: Session, order: SalesOrder, user_id: int | None = None) -> Invoice:
        invoice = db.query(Invoice).filter(Invoice.order_id == order.id, Invoice.deleted_at.is_(None)).first()
        if invoice:
            return invoice
        invoice = Invoice(
            organization_id=order.organization_id,
            company_id=order.company_id,
            customer_id=order.customer_id,
            order_id=order.id,
            invoice_number=generate_identifier("INV"),
            status="Draft",
            payment_status=order.payment_status,
            currency=order.currency,
            subtotal=order.subtotal,
            discount_total=order.discount_total,
            tax_total=order.tax_total,
            shipping_cost=order.shipping_cost,
            refund_total=order.refund_total,
            grand_total=order.grand_total,
            paid_amount=order.paid_amount,
            outstanding_balance=order.outstanding_balance,
            created_by=user_id,
        )
        db.add(invoice)
        db.flush()
        for item in order.items:
            db.add(
                InvoiceItem(
                    invoice_id=invoice.id,
                    order_item_id=item.id,
                    product_id=item.product_id,
                    variant_id=item.variant_id,
                    sku=item.sku,
                    name=item.name,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    discount_amount=item.discount_amount,
                    tax_amount=item.tax_amount,
                    line_total=item.line_total,
                    created_by=user_id,
                )
            )
        return invoice

    @classmethod
    def _sync_generated_invoice(cls, db: Session, order: SalesOrder, user_id: int | None = None) -> None:
        invoice = cls._ensure_invoice(db, order, user_id)
        invoice.subtotal = order.subtotal
        invoice.discount_total = order.discount_total
        invoice.tax_total = order.tax_total
        invoice.shipping_cost = order.shipping_cost
        invoice.refund_total = order.refund_total
        invoice.grand_total = order.grand_total
        invoice.paid_amount = order.paid_amount
        invoice.outstanding_balance = order.outstanding_balance
        invoice.payment_status = order.payment_status
        invoice.updated_by = user_id

    @classmethod
    def _ensure_shipment(cls, db: Session, order: SalesOrder, user_id: int | None = None) -> Shipment:
        shipment = db.query(Shipment).filter(Shipment.order_id == order.id, Shipment.deleted_at.is_(None)).first()
        if shipment:
            return shipment
        shipment = Shipment(
            organization_id=order.organization_id,
            company_id=order.company_id,
            order_id=order.id,
            shipment_number=generate_identifier("SHP"),
            status=order.shipment_status,
            shipping_cost=order.shipping_cost,
            created_by=user_id,
        )
        db.add(shipment)
        return shipment

    @classmethod
    def _sync_generated_shipment(cls, db: Session, order: SalesOrder, user_id: int | None = None) -> None:
        shipment = cls._ensure_shipment(db, order, user_id)
        shipment.status = order.shipment_status
        shipment.shipping_cost = order.shipping_cost
        shipment.updated_by = user_id


class OrderItemService(BaseSalesService):
    repository = OrderItemRepository
    entity_name = "Order item"
    export_fields = ("id", "uuid", "order_id", "product_id", "warehouse_id", "sku", "quantity", "line_total", "stock_status")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "order_id")
            cls.ensure_required(payload, "product_id")
            cls.ensure_required(payload, "warehouse_id")
        cls.ensure_exists(db, SalesOrder, payload.get("order_id", getattr(item, "order_id", None)), "order_id")
        prepare_sales_line(db, payload, require_warehouse=True)

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> OrderItem:
        payload = normalize_payload(cls.repository.to_dict(data))
        cls.validate_payload(db, payload)
        order = db.query(SalesOrder).filter(SalesOrder.id == payload["order_id"]).first()
        item = OrderItem(**payload, created_by=user_id)
        db.add(item)
        db.flush()
        if order and order.status not in CLOSED_ORDER_STATUSES:
            OrderInventoryManager.reserve_item(db, item, user_id)
            if order.status in COMMITTED_ORDER_STATUSES:
                OrderInventoryManager.commit_item(db, item, user_id)
            OrderInventoryManager.sync_product_stock(db, item.product_id, item.variant_id, user_id)
            recalculate_order_totals(order)
            SalesOrderService._sync_generated_invoice(db, order, user_id)
        db.commit()
        db.refresh(item)
        return item

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> OrderItem:
        item = cls.get(db, item_id)
        if item.stock_status in {"reserved", "committed"}:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Release or restore stock before editing this item"})
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))
        cls.validate_payload(db, payload, item=item)
        for key, value in payload.items():
            setattr(item, key, value)
        item.updated_by = user_id
        if item.order:
            recalculate_order_totals(item.order)
            SalesOrderService._sync_generated_invoice(db, item.order, user_id)
        db.commit()
        db.refresh(item)
        return item


class OrderNoteService(BaseSalesService):
    repository = OrderNoteRepository
    entity_name = "Order note"
    export_fields = ("id", "uuid", "order_id", "note_type", "is_internal", "created_at")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "order_id")
            cls.ensure_required(payload, "body")
        cls.ensure_exists(db, SalesOrder, payload.get("order_id", getattr(item, "order_id", None)), "order_id")


class OrderTimelineService(BaseSalesService):
    repository = OrderTimelineRepository
    entity_name = "Order timeline"
    export_fields = ("id", "uuid", "order_id", "event_type", "title", "occurred_at")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "order_id")
            cls.ensure_required(payload, "event_type")
            cls.ensure_required(payload, "title")
        cls.ensure_exists(db, SalesOrder, payload.get("order_id", getattr(item, "order_id", None)), "order_id")


class OrderHistoryService(BaseSalesService):
    repository = OrderHistoryRepository
    entity_name = "Order history"
    export_fields = ("id", "uuid", "order_id", "field_name", "old_value", "new_value", "changed_at")


class OrderAttachmentService(BaseSalesService):
    repository = OrderAttachmentRepository
    entity_name = "Order attachment"
    export_fields = ("id", "uuid", "order_id", "file_name", "file_url", "content_type", "size_bytes")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "order_id")
            cls.ensure_required(payload, "file_name")
            cls.ensure_required(payload, "file_url")
        cls.ensure_exists(db, SalesOrder, payload.get("order_id", getattr(item, "order_id", None)), "order_id")
