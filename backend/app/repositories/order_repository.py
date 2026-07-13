from decimal import Decimal
from typing import Any, Generic, TypeVar

from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Query, Session

from app.models.sales import (
    OrderAttachment,
    OrderHistory,
    OrderItem,
    OrderNote,
    OrderTimeline,
    SalesOrder,
)
from app.repositories.crm_repository import CRMRepository

ModelT = TypeVar("ModelT")


class SalesRepository(CRMRepository[ModelT], Generic[ModelT]):
    sortable_fields = CRMRepository.sortable_fields | {
        "order_number",
        "quote_number",
        "invoice_number",
        "payment_number",
        "shipment_number",
        "tracking_number",
        "organization_id",
        "company_id",
        "customer_id",
        "order_id",
        "quote_id",
        "invoice_id",
        "product_id",
        "warehouse_id",
        "order_date",
        "quote_date",
        "invoice_date",
        "due_date",
        "paid_at",
        "shipped_at",
        "delivered_at",
        "subtotal",
        "tax_total",
        "discount_total",
        "shipping_cost",
        "grand_total",
        "paid_amount",
        "outstanding_balance",
        "status",
        "payment_status",
        "shipment_status",
    }

    @staticmethod
    def _has_value(value: Any) -> bool:
        return value is not None and value != ""

    @classmethod
    def _range_filter(cls, query: Query, field_name: str, minimum: Decimal | int | None, maximum: Decimal | int | None) -> Query:
        if hasattr(cls.model, field_name):
            field = getattr(cls.model, field_name)
            if minimum is not None:
                query = query.filter(field >= minimum)
            if maximum is not None:
                query = query.filter(field <= maximum)
        return query

    @classmethod
    def _date_filter(cls, query: Query, filters: dict[str, Any], field_names: tuple[str, ...]) -> Query:
        date_from = filters.get("date_from") or filters.get("created_from")
        date_to = filters.get("date_to") or filters.get("created_to")
        for field_name in field_names:
            if hasattr(cls.model, field_name):
                field = getattr(cls.model, field_name)
                if date_from is not None:
                    query = query.filter(field >= date_from)
                if date_to is not None:
                    query = query.filter(field <= date_to)
                break
        return query

    @classmethod
    def _apply_filters(cls, query: Query, filters: dict[str, Any] | None) -> Query:
        if not filters:
            return query

        amount_min = filters.get("amount_min")
        amount_max = filters.get("amount_max")
        total_min = filters.get("total_min")
        total_max = filters.get("total_max")
        query = cls._range_filter(query, "amount", amount_min, amount_max)
        query = cls._range_filter(query, "grand_total", total_min, total_max)
        query = cls._date_filter(query, filters, ("order_date", "quote_date", "invoice_date", "paid_at", "shipped_at", "created_at"))

        ignored = {"amount_min", "amount_max", "total_min", "total_max", "date_from", "date_to", "created_from", "created_to"}
        for field_name, value in filters.items():
            if field_name in ignored or not cls._has_value(value):
                continue
            if hasattr(cls.model, field_name):
                query = query.filter(getattr(cls.model, field_name) == value)
        return query

    @classmethod
    def list(
        cls,
        db: Session,
        *,
        search: str | None = None,
        status: str | None = None,
        tags: str | None = None,
        filters: dict[str, Any] | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        include_deleted: bool = False,
    ) -> tuple[list[ModelT], int]:
        del tags
        query = cls.base_query(db, include_deleted)
        query = cls._apply_filters(query, filters)

        if status and hasattr(cls.model, "status"):
            query = query.filter(cls.model.status == status)

        if search:
            pattern = f"%{search}%"
            clauses = []
            for field_name in cls.search_fields:
                if hasattr(cls.model, field_name):
                    clauses.append(getattr(cls.model, field_name).ilike(pattern))
            if clauses:
                query = query.filter(or_(*clauses))

        total = query.with_entities(func.count(cls.model.id)).scalar() or 0
        order_field_name = sort_by if sort_by in cls.sortable_fields else "created_at"
        order_field = getattr(cls.model, order_field_name, cls.model.id)
        query = query.order_by(asc(order_field) if sort_order == "asc" else desc(order_field))
        query = query.offset((page - 1) * page_size).limit(page_size)
        return query.all(), total

    @classmethod
    def bulk_get(cls, db: Session, ids: list[int], include_deleted: bool = False) -> list[ModelT]:
        return cls.base_query(db, include_deleted).filter(cls.model.id.in_(ids)).all()


class SalesOrderRepository(SalesRepository[SalesOrder]):
    model = SalesOrder
    search_fields = ("order_number", "status", "payment_status", "shipment_status", "currency", "notes")


class OrderItemRepository(SalesRepository[OrderItem]):
    model = OrderItem
    search_fields = ("sku", "name", "stock_status", "notes")


class OrderNoteRepository(SalesRepository[OrderNote]):
    model = OrderNote
    search_fields = ("note_type", "body")


class OrderTimelineRepository(SalesRepository[OrderTimeline]):
    model = OrderTimeline
    search_fields = ("event_type", "title", "description")


class OrderHistoryRepository(SalesRepository[OrderHistory]):
    model = OrderHistory
    search_fields = ("field_name", "old_value", "new_value")


class OrderAttachmentRepository(SalesRepository[OrderAttachment]):
    model = OrderAttachment
    search_fields = ("file_name", "file_url", "content_type", "description")
