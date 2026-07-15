from typing import Any, Generic, TypeVar, List

from sqlalchemy import String, asc, cast, desc, func, or_
from sqlalchemy.orm import Query, Session

from app.models.inventory import (
    AttributeValue,
    Brand,
    Category,
    Inventory,
    Product,
    ProductAttribute,
    ProductImage,
    ProductTag,
    ProductVariant,
    StockAdjustment,
    StockMovement,
    StockTransfer,
    Supplier,
    Unit,
    Warehouse,
)
from app.repositories.crm_repository import CRMRepository

ModelT = TypeVar("ModelT")


class InventoryRepository(CRMRepository[ModelT], Generic[ModelT]):
    sortable_fields = CRMRepository.sortable_fields | {
        "name",
        "sku",
        "barcode",
        "slug",
        "brand_id",
        "category_id",
        "supplier_id",
        "warehouse_id",
        "cost_price",
        "selling_price",
        "quantity",
        "available_quantity",
        "available_stock",
        "current_stock",
        "published",
        "featured",
        "moved_at",
        "approved_at",
    }

    @classmethod
    def _stock_field_name(cls) -> str | None:
        for field_name in ("available_stock", "available_quantity", "current_stock", "quantity"):
            if hasattr(cls.model, field_name):
                return field_name
        return None

    @classmethod
    def _price_field_name(cls) -> str | None:
        for field_name in ("selling_price", "cost_price"):
            if hasattr(cls.model, field_name):
                return field_name
        return None

    @staticmethod
    def _has_value(value: Any) -> bool:
        return value is not None and value != ""

    @classmethod
    def _apply_filters(cls, query: Query, filters: dict[str, Any] | None) -> Query:
        if not filters:
            return query

        price_field_name = cls._price_field_name()
        stock_field_name = cls._stock_field_name()

        for field_name, value in filters.items():
            if not cls._has_value(value):
                continue

            if field_name in {"price_min", "min_price"} and price_field_name:
                query = query.filter(getattr(cls.model, price_field_name) >= value)
                continue
            if field_name in {"price_max", "max_price"} and price_field_name:
                query = query.filter(getattr(cls.model, price_field_name) <= value)
                continue
            if field_name in {"stock_min", "min_stock"} and stock_field_name:
                query = query.filter(getattr(cls.model, stock_field_name) >= value)
                continue
            if field_name in {"stock_max", "max_stock"} and stock_field_name:
                query = query.filter(getattr(cls.model, stock_field_name) <= value)
                continue
            if field_name in {"created_from", "created_date_from"} and hasattr(cls.model, "created_at"):
                query = query.filter(cls.model.created_at >= value)
                continue
            if field_name in {"created_to", "created_date_to"} and hasattr(cls.model, "created_at"):
                query = query.filter(cls.model.created_at <= value)
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
    ) -> tuple[List[ModelT], int]:
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

        if tags and cls.tag_field and hasattr(cls.model, cls.tag_field):
            query = query.filter(cast(getattr(cls.model, cls.tag_field), String).ilike(f"%{tags}%"))

        total = query.with_entities(func.count(cls.model.id)).scalar() or 0
        order_field_name = sort_by if sort_by in cls.sortable_fields else "created_at"
        order_field = getattr(cls.model, order_field_name, cls.model.id)
        query = query.order_by(asc(order_field) if sort_order == "asc" else desc(order_field))
        query = query.offset((page - 1) * page_size).limit(page_size)
        return query.all(), total

    @classmethod
    def bulk_get(cls, db: Session, ids: List[int], include_deleted: bool = False) -> List[ModelT]:
        return cls.base_query(db, include_deleted).filter(cls.model.id.in_(ids)).all()

    @classmethod
    def bulk_update(
        cls,
        db: Session,
        items: List[ModelT],
        values: dict[str, Any],
        user_id: int | None = None,
    ) -> List[ModelT]:
        for item in items:
            for key, value in values.items():
                if hasattr(item, key):
                    setattr(item, key, value)
            if user_id and hasattr(item, "updated_by"):
                item.updated_by = user_id
        db.commit()
        for item in items:
            db.refresh(item)
        return items


class CategoryRepository(InventoryRepository[Category]):
    model = Category
    search_fields = ("name", "slug", "status")


class BrandRepository(InventoryRepository[Brand]):
    model = Brand
    search_fields = ("name", "country", "status")


class SupplierRepository(InventoryRepository[Supplier]):
    model = Supplier
    search_fields = ("company", "contact_person", "email", "phone", "country", "status")


class WarehouseRepository(InventoryRepository[Warehouse]):
    model = Warehouse
    search_fields = ("name", "code", "location", "email", "phone", "status")


class ProductRepository(InventoryRepository[Product]):
    model = Product
    search_fields = ("sku", "barcode", "name", "slug", "status")
    tag_field = "tags"

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
    ) -> tuple[List[Product], int]:
        query = cls.base_query(db, include_deleted)
        query = cls._apply_filters(query, filters)

        if status:
            query = query.filter(Product.status == status)

        if search:
            pattern = f"%{search}%"
            query = (
                query.outerjoin(Product.brand)
                .outerjoin(Product.category)
                .outerjoin(Product.supplier)
                .outerjoin(Product.warehouse)
            )
            query = query.filter(
                or_(
                    Product.sku.ilike(pattern),
                    Product.barcode.ilike(pattern),
                    Product.name.ilike(pattern),
                    Product.slug.ilike(pattern),
                    Product.status.ilike(pattern),
                    Brand.name.ilike(pattern),
                    Category.name.ilike(pattern),
                    Supplier.company.ilike(pattern),
                    Warehouse.name.ilike(pattern),
                    Warehouse.code.ilike(pattern),
                )
            )

        if tags:
            query = query.filter(cast(Product.tags, String).ilike(f"%{tags}%"))

        total = query.with_entities(func.count(func.distinct(Product.id))).scalar() or 0
        order_field_name = sort_by if sort_by in cls.sortable_fields else "created_at"
        order_field = getattr(Product, order_field_name, Product.id)
        query = query.order_by(asc(order_field) if sort_order == "asc" else desc(order_field))
        query = query.offset((page - 1) * page_size).limit(page_size)
        return query.all(), total


class ProductVariantRepository(InventoryRepository[ProductVariant]):
    model = ProductVariant
    search_fields = ("sku", "barcode", "serial_number", "imei", "mac_address", "status")


class ProductAttributeRepository(InventoryRepository[ProductAttribute]):
    model = ProductAttribute
    search_fields = ("name", "status")


class AttributeValueRepository(InventoryRepository[AttributeValue]):
    model = AttributeValue
    search_fields = ("value", "status")


class ProductImageRepository(InventoryRepository[ProductImage]):
    model = ProductImage
    search_fields = ("image_url", "alt_text", "status")


class InventoryItemRepository(InventoryRepository[Inventory]):
    model = Inventory
    search_fields = ("status",)

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
    ) -> tuple[List[Inventory], int]:
        del tags
        query = cls.base_query(db, include_deleted)
        query = cls._apply_filters(query, filters)

        if status:
            query = query.filter(Inventory.status == status)

        if search:
            pattern = f"%{search}%"
            query = query.outerjoin(Inventory.product).outerjoin(Inventory.warehouse)
            query = query.filter(
                or_(
                    Inventory.status.ilike(pattern),
                    Product.sku.ilike(pattern),
                    Product.barcode.ilike(pattern),
                    Product.name.ilike(pattern),
                    Warehouse.name.ilike(pattern),
                    Warehouse.code.ilike(pattern),
                )
            )

        total = query.with_entities(func.count(func.distinct(Inventory.id))).scalar() or 0
        order_field_name = sort_by if sort_by in cls.sortable_fields else "created_at"
        order_field = getattr(Inventory, order_field_name, Inventory.id)
        query = query.order_by(asc(order_field) if sort_order == "asc" else desc(order_field))
        query = query.offset((page - 1) * page_size).limit(page_size)
        return query.all(), total


class StockMovementRepository(InventoryRepository[StockMovement]):
    model = StockMovement
    search_fields = ("movement_type", "reference_type", "reason", "notes")


class StockAdjustmentRepository(InventoryRepository[StockAdjustment]):
    model = StockAdjustment
    search_fields = ("reason", "status", "notes")


class StockTransferRepository(InventoryRepository[StockTransfer]):
    model = StockTransfer
    search_fields = ("transfer_number", "status", "notes")


class UnitRepository(InventoryRepository[Unit]):
    model = Unit
    search_fields = ("name", "code", "status")


class ProductTagRepository(InventoryRepository[ProductTag]):
    model = ProductTag
    search_fields = ("name", "slug", "status")
