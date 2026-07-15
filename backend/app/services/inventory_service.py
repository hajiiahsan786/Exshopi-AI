import csv
import io
import re
import zipfile
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, List
from uuid import uuid4
from xml.sax.saxutils import escape

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.inventory import (
    Brand,
    Category,
    Inventory,
    Product,
    ProductAttribute,
    ProductVariant,
    Supplier,
    Unit,
    Warehouse,
)
from app.models.user import User
from app.repositories.inventory_repository import (
    AttributeValueRepository,
    BrandRepository,
    CategoryRepository,
    InventoryItemRepository,
    InventoryRepository,
    ProductAttributeRepository,
    ProductImageRepository,
    ProductRepository,
    ProductTagRepository,
    ProductVariantRepository,
    StockAdjustmentRepository,
    StockMovementRepository,
    StockTransferRepository,
    SupplierRepository,
    UnitRepository,
    WarehouseRepository,
)
from app.schemas.crm_common import PaginatedResponse


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "item"


def generate_identifier(prefix: str, seed: str | None = None, max_seed_length: int = 32) -> str:
    seed_part = f"-{slugify(seed).upper()[:max_seed_length]}" if seed else ""
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"{prefix}{seed_part}-{timestamp}-{uuid4().hex[:8].upper()}"


def normalize_payload(payload: dict[str, Any]) -> dict[str, Any]:
    return {key: (None if value == "" else value) for key, value in payload.items()}


def serialize_export_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, Decimal):
        return str(value)
    return str(value)


def column_name(index: int) -> str:
    name = ""
    while index:
        index, remainder = divmod(index - 1, 26)
        name = chr(65 + remainder) + name
    return name


def build_xlsx(rows: List[dict[str, Any]], fields: tuple[str, ...]) -> bytes:
    sheet_rows = [list(fields)]
    sheet_rows.extend([[serialize_export_value(row.get(field)) for field in fields] for row in rows])
    cells = []
    for row_index, row in enumerate(sheet_rows, start=1):
        row_cells = []
        for column_index, value in enumerate(row, start=1):
            coordinate = f"{column_name(column_index)}{row_index}"
            row_cells.append(f'<c r="{coordinate}" t="inlineStr"><is><t>{escape(str(value))}</t></is></c>')
        cells.append(f'<row r="{row_index}">{"".join(row_cells)}</row>')

    sheet_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f"<sheetData>{''.join(cells)}</sheetData>"
        "</worksheet>"
    )
    output = io.BytesIO()
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as workbook:
        workbook.writestr(
            "[Content_Types].xml",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/worksheets/sheet1.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            "</Types>",
        )
        workbook.writestr(
            "_rels/.rels",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
            'Target="xl/workbook.xml"/>'
            "</Relationships>",
        )
        workbook.writestr(
            "xl/workbook.xml",
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            '<sheets><sheet name="Inventory Export" sheetId="1" r:id="rId1"/></sheets>'
            "</workbook>",
        )
        workbook.writestr(
            "xl/_rels/workbook.xml.rels",
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            'Target="worksheets/sheet1.xml"/>'
            "</Relationships>",
        )
        workbook.writestr("xl/worksheets/sheet1.xml", sheet_xml)
    return output.getvalue()


class BaseInventoryService:
    repository: type[InventoryRepository]
    entity_name = "Inventory entity"
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
    def bulk_delete(cls, db: Session, ids: List[int], user_id: int | None = None) -> dict[str, Any]:
        items = cls.repository.bulk_get(db, ids)
        for item in items:
            cls.repository.soft_delete(db, item, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_restore(cls, db: Session, ids: List[int], user_id: int | None = None) -> dict[str, Any]:
        items = cls.repository.bulk_get(db, ids, include_deleted=True)
        for item in items:
            cls.repository.restore(db, item, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_update(cls, db: Session, ids: List[int], values: dict[str, Any], user_id: int | None = None) -> dict[str, Any]:
        items = cls.repository.bulk_get(db, ids)
        allowed_values = {key: value for key, value in values.items() if hasattr(cls.repository.model, key)}
        for item in items:
            cls.update(db, item.id, allowed_values, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_status(cls, db: Session, ids: List[int], new_status: str, user_id: int | None = None) -> dict[str, Any]:
        return cls.bulk_update(db, ids, {"status": new_status}, user_id)

    @classmethod
    def export_rows(cls, db: Session, export_format: str = "json") -> Any:
        export_format = export_format.lower()
        items, _ = cls.repository.list(db, page=1, page_size=10000, include_deleted=True)
        rows = []
        for item in items:
            rows.append({field: getattr(item, field, None) for field in cls.export_fields})
        if export_format == "json":
            return rows
        if export_format == "xlsx":
            return build_xlsx(rows, cls.export_fields)
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=list(cls.export_fields))
        writer.writeheader()
        writer.writerows(rows)
        return output.getvalue()

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        return None

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        return None

    @classmethod
    def ensure_unique(cls, db: Session, payload: dict[str, Any], exclude_id: int | None = None) -> None:
        for field_name in cls.duplicate_fields:
            value = payload.get(field_name)
            if not value:
                continue
            existing = cls.repository.get_by_field(db, field_name, value, exclude_id=exclude_id)
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
                detail={
                    "success": False,
                    "message": f"{field_name} is required",
                    "errors": {field_name: "required"},
                },
            )

    @classmethod
    def ensure_composite_unique(
        cls,
        db: Session,
        filters: dict[str, Any],
        message: str,
        exclude_id: int | None = None,
    ) -> None:
        query = cls.repository.base_query(db, include_deleted=True)
        for field_name, value in filters.items():
            field = getattr(cls.repository.model, field_name)
            query = query.filter(field.is_(None) if value is None else field == value)
        if exclude_id is not None:
            query = query.filter(cls.repository.model.id != exclude_id)
        existing = query.first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"success": False, "message": message, "errors": filters},
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


class CategoryService(BaseInventoryService):
    repository = CategoryRepository
    entity_name = "Category"
    duplicate_fields = ("slug",)
    export_fields = ("id", "uuid", "parent_id", "name", "slug", "status", "sort_order")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db
        if not payload.get("slug"):
            name = payload.get("name") or getattr(item, "name", None) or "category"
            payload["slug"] = slugify(name)

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        parent_id = payload.get("parent_id")
        if parent_id is not None:
            if item and parent_id == item.id:
                raise HTTPException(status_code=400, detail={"success": False, "message": "Category cannot parent itself"})
            cls.ensure_exists(db, Category, parent_id, "parent_id")
            ancestor = db.query(Category).filter(Category.id == parent_id).first()
            while ancestor:
                if item and ancestor.parent_id == item.id:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={"success": False, "message": "Category parent would create a cycle"},
                    )
                ancestor = db.query(Category).filter(Category.id == ancestor.parent_id).first() if ancestor.parent_id else None


class BrandService(BaseInventoryService):
    repository = BrandRepository
    entity_name = "Brand"
    duplicate_fields = ("name",)
    export_fields = ("id", "uuid", "name", "website", "country", "status")


class SupplierService(BaseInventoryService):
    repository = SupplierRepository
    entity_name = "Supplier"
    duplicate_fields = ("email", "phone", "tax_number")
    export_fields = ("id", "uuid", "company", "contact_person", "email", "phone", "country", "status")


class WarehouseService(BaseInventoryService):
    repository = WarehouseRepository
    entity_name = "Warehouse"
    duplicate_fields = ("code", "email")
    export_fields = ("id", "uuid", "name", "code", "location", "manager", "capacity", "status")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        cls.ensure_exists(db, User, payload.get("manager"), "manager")


class UnitService(BaseInventoryService):
    repository = UnitRepository
    entity_name = "Unit"
    duplicate_fields = ("name", "code")
    export_fields = ("id", "uuid", "name", "code", "status")


class ProductTagService(BaseInventoryService):
    repository = ProductTagRepository
    entity_name = "Product tag"
    duplicate_fields = ("name", "slug")
    export_fields = ("id", "uuid", "name", "slug", "status")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db
        if not payload.get("slug"):
            name = payload.get("name") or getattr(item, "name", None) or "tag"
            payload["slug"] = slugify(name)


class ProductService(BaseInventoryService):
    repository = ProductRepository
    entity_name = "Product"
    duplicate_fields = ("sku", "barcode", "slug")
    export_fields = (
        "id",
        "uuid",
        "sku",
        "barcode",
        "name",
        "slug",
        "brand_id",
        "category_id",
        "supplier_id",
        "warehouse_id",
        "selling_price",
        "quantity",
        "available_quantity",
        "status",
        "published",
    )

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db
        name = payload.get("name") or getattr(item, "name", None) or "product"
        if not payload.get("slug"):
            payload["slug"] = slugify(name)
        if not payload.get("sku"):
            payload["sku"] = generate_identifier("SKU", name)
        if not payload.get("barcode"):
            payload["barcode"] = generate_identifier("BC")
        quantity = payload.get("quantity", getattr(item, "quantity", 0) if item else 0)
        reserved = payload.get("reserved_quantity", getattr(item, "reserved_quantity", 0) if item else 0)
        if "available_quantity" not in payload:
            payload["available_quantity"] = max(quantity - reserved, 0)

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        cls.ensure_exists(db, Brand, payload.get("brand_id"), "brand_id")
        cls.ensure_exists(db, Category, payload.get("category_id"), "category_id")
        cls.ensure_exists(db, Supplier, payload.get("supplier_id"), "supplier_id")
        cls.ensure_exists(db, Warehouse, payload.get("warehouse_id"), "warehouse_id")
        cls.ensure_exists(db, Unit, payload.get("unit_id"), "unit_id")
        cost = payload.get("cost_price", getattr(item, "cost_price", 0) if item else 0)
        selling = payload.get("selling_price", getattr(item, "selling_price", 0) if item else 0)
        discount = payload.get("discount_price", getattr(item, "discount_price", None) if item else None)
        quantity = payload.get("quantity", getattr(item, "quantity", 0) if item else 0)
        reserved = payload.get("reserved_quantity", getattr(item, "reserved_quantity", 0) if item else 0)
        if cost < 0 or selling < 0:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Prices must be positive"})
        if discount is not None and discount > selling:
            raise HTTPException(status_code=400, detail={"success": False, "message": "discount_price cannot exceed selling_price"})
        if reserved > quantity:
            raise HTTPException(status_code=400, detail={"success": False, "message": "reserved_quantity cannot exceed quantity"})

    @classmethod
    async def import_csv(cls, db: Session, file: UploadFile, user_id: int | None = None) -> dict[str, Any]:
        raw = await file.read()
        reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
        created = []
        errors = []
        for row_number, row in enumerate(reader, start=2):
            try:
                payload = {
                    "name": row.get("name") or row.get("Product Name"),
                    "sku": row.get("sku") or None,
                    "barcode": row.get("barcode") or None,
                    "slug": row.get("slug") or None,
                    "cost_price": Decimal(row.get("cost_price") or "0"),
                    "selling_price": Decimal(row.get("selling_price") or "0"),
                    "quantity": int(row.get("quantity") or 0),
                    "status": row.get("status") or "active",
                    "published": (row.get("published") or "").lower() in {"1", "true", "yes"},
                }
                if not payload["name"]:
                    raise ValueError("name is required")
                created.append(cls.create(db, payload, user_id).id)
            except (HTTPException, ValueError) as exc:
                detail = exc.detail if isinstance(exc, HTTPException) else str(exc)
                errors.append({"row": row_number, "error": detail})
        return {"created": len(created), "ids": created, "errors": errors}


class ProductVariantService(BaseInventoryService):
    repository = ProductVariantRepository
    entity_name = "Product variant"
    duplicate_fields = ("sku", "barcode", "serial_number", "imei", "mac_address")
    export_fields = ("id", "uuid", "product_id", "sku", "barcode", "quantity", "available_quantity", "status")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        product_id = payload.get("product_id") or getattr(item, "product_id", None)
        product = db.query(Product).filter(Product.id == product_id).first() if product_id else None
        base_sku = product.sku[:40] if product else "VAR"
        if not payload.get("sku"):
            payload["sku"] = generate_identifier(f"{base_sku}-V")
        if not payload.get("barcode"):
            payload["barcode"] = generate_identifier("VB")
        quantity = payload.get("quantity", getattr(item, "quantity", 0) if item else 0)
        reserved = payload.get("reserved_quantity", getattr(item, "reserved_quantity", 0) if item else 0)
        if "available_quantity" not in payload:
            payload["available_quantity"] = max(quantity - reserved, 0)

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "product_id")
        cls.ensure_exists(db, Product, payload.get("product_id"), "product_id")
        quantity = payload.get("quantity", getattr(item, "quantity", 0) if item else 0)
        reserved = payload.get("reserved_quantity", getattr(item, "reserved_quantity", 0) if item else 0)
        if reserved > quantity:
            raise HTTPException(status_code=400, detail={"success": False, "message": "reserved_quantity cannot exceed quantity"})


class ProductAttributeService(BaseInventoryService):
    repository = ProductAttributeRepository
    entity_name = "Product attribute"
    duplicate_fields = ()

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "product_id")
            cls.ensure_required(payload, "name")
        cls.ensure_exists(db, Product, payload.get("product_id"), "product_id")
        product_id = payload.get("product_id", getattr(item, "product_id", None))
        name = payload.get("name", getattr(item, "name", None))
        if product_id is not None and name:
            cls.ensure_composite_unique(
                db,
                {"product_id": product_id, "name": name},
                "Duplicate product attribute",
                exclude_id=getattr(item, "id", None),
            )


class AttributeValueService(BaseInventoryService):
    repository = AttributeValueRepository
    entity_name = "Attribute value"

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "attribute_id")
            cls.ensure_required(payload, "value")
        cls.ensure_exists(db, ProductAttribute, payload.get("attribute_id"), "attribute_id")
        attribute_id = payload.get("attribute_id", getattr(item, "attribute_id", None))
        value = payload.get("value", getattr(item, "value", None))
        if attribute_id is not None and value:
            cls.ensure_composite_unique(
                db,
                {"attribute_id": attribute_id, "value": value},
                "Duplicate attribute value",
                exclude_id=getattr(item, "id", None),
            )


class ProductImageService(BaseInventoryService):
    repository = ProductImageRepository
    entity_name = "Product image"

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "product_id")
            cls.ensure_required(payload, "image_url")
        cls.ensure_exists(db, Product, payload.get("product_id"), "product_id")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Any:
        payload = normalize_payload(cls.repository.to_dict(data))
        cls.validate_payload(db, payload)
        if payload.get("is_primary"):
            db.query(cls.repository.model).filter(cls.repository.model.product_id == payload["product_id"]).update({"is_primary": False})
        return cls.repository.create(db, payload, user_id)

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Any:
        item = cls.get(db, item_id)
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))
        cls.validate_payload(db, payload, item=item)
        if payload.get("is_primary"):
            product_id = payload.get("product_id", item.product_id)
            db.query(cls.repository.model).filter(
                cls.repository.model.product_id == product_id,
                cls.repository.model.id != item_id,
            ).update({"is_primary": False})
        return cls.repository.update(db, item, payload, user_id)


class InventoryItemService(BaseInventoryService):
    repository = InventoryItemRepository
    entity_name = "Inventory"
    export_fields = ("id", "uuid", "product_id", "variant_id", "warehouse_id", "current_stock", "available_stock", "status")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db
        current = payload.get("current_stock", getattr(item, "current_stock", 0) if item else 0)
        reserved = payload.get("reserved_stock", getattr(item, "reserved_stock", 0) if item else 0)
        incoming = payload.get("incoming_stock", getattr(item, "incoming_stock", 0) if item else 0)
        outgoing = payload.get("outgoing_stock", getattr(item, "outgoing_stock", 0) if item else 0)
        payload["available_stock"] = max(current - reserved + incoming - outgoing, 0)

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "product_id")
            cls.ensure_required(payload, "warehouse_id")

        product_id = payload.get("product_id", getattr(item, "product_id", None))
        variant_id = payload.get("variant_id", getattr(item, "variant_id", None))
        warehouse_id = payload.get("warehouse_id", getattr(item, "warehouse_id", None))

        cls.ensure_exists(db, Product, product_id, "product_id")
        cls.ensure_exists(db, ProductVariant, variant_id, "variant_id")
        cls.ensure_exists(db, Warehouse, warehouse_id, "warehouse_id")

        if variant_id is not None and product_id is not None:
            variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
            if variant and variant.product_id != product_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"success": False, "message": "variant_id does not belong to product_id"},
                )

        current = payload.get("current_stock", getattr(item, "current_stock", 0) if item else 0)
        reserved = payload.get("reserved_stock", getattr(item, "reserved_stock", 0) if item else 0)
        incoming = payload.get("incoming_stock", getattr(item, "incoming_stock", 0) if item else 0)
        outgoing = payload.get("outgoing_stock", getattr(item, "outgoing_stock", 0) if item else 0)
        if min(current, reserved, incoming, outgoing) < 0:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Stock values must be positive"})
        if reserved > current:
            raise HTTPException(status_code=400, detail={"success": False, "message": "reserved_stock cannot exceed current_stock"})

        if product_id is not None and warehouse_id is not None:
            cls.ensure_composite_unique(
                db,
                {"product_id": product_id, "variant_id": variant_id, "warehouse_id": warehouse_id},
                "Duplicate inventory row",
                exclude_id=getattr(item, "id", None),
            )

    @staticmethod
    def _stock_totals(db: Session, product_id: int, variant_id: int | None = None) -> tuple[int, int, int]:
        query = db.query(
            func.coalesce(func.sum(Inventory.current_stock), 0),
            func.coalesce(func.sum(Inventory.reserved_stock), 0),
            func.coalesce(func.sum(Inventory.available_stock), 0),
        ).filter(Inventory.product_id == product_id, Inventory.deleted_at.is_(None))
        if variant_id is not None:
            query = query.filter(Inventory.variant_id == variant_id)
        current, reserved, available = query.one()
        return int(current or 0), int(reserved or 0), int(available or 0)

    @classmethod
    def sync_product_stock(
        cls,
        db: Session,
        product_id: int,
        variant_id: int | None = None,
        user_id: int | None = None,
    ) -> None:
        product = db.query(Product).filter(Product.id == product_id).first()
        if product:
            quantity, reserved, available = cls._stock_totals(db, product_id)
            product.quantity = quantity
            product.reserved_quantity = reserved
            product.available_quantity = available
            product.updated_by = user_id

        if variant_id is not None:
            variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
            if variant:
                quantity, reserved, available = cls._stock_totals(db, product_id, variant_id)
                variant.quantity = quantity
                variant.reserved_quantity = reserved
                variant.available_quantity = available
                variant.updated_by = user_id

    @staticmethod
    def _movement(
        *,
        product_id: int,
        variant_id: int | None,
        warehouse_id: int,
        movement_type: str,
        quantity: int,
        quantity_before: int,
        quantity_after: int,
        user_id: int | None,
        reference_type: str | None = None,
        reference_id: int | None = None,
        reason: str | None = None,
        notes: str | None = None,
    ) -> Any:
        return StockMovementRepository.model(
            product_id=product_id,
            variant_id=variant_id,
            warehouse_id=warehouse_id,
            movement_type=movement_type,
            quantity=quantity,
            quantity_before=quantity_before,
            quantity_after=quantity_after,
            reference_type=reference_type,
            reference_id=reference_id,
            reason=reason,
            notes=notes,
            moved_at=datetime.now(timezone.utc),
            created_by=user_id,
        )

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Inventory:
        item = super().create(db, data, user_id)
        if item.current_stock:
            movement = cls._movement(
                product_id=item.product_id,
                variant_id=item.variant_id,
                warehouse_id=item.warehouse_id,
                movement_type="Manual",
                quantity=item.current_stock,
                quantity_before=0,
                quantity_after=item.current_stock,
                user_id=user_id,
                reference_type="inventory",
                reference_id=item.id,
                reason="Initial inventory stock",
            )
            db.add(movement)
        cls.sync_product_stock(db, item.product_id, item.variant_id, user_id)
        db.commit()
        db.refresh(item)
        return item

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Inventory:
        item = cls.get(db, item_id)
        old_product_id = item.product_id
        old_variant_id = item.variant_id
        old_stock = item.current_stock
        updated = super().update(db, item_id, data, user_id)
        if updated.current_stock != old_stock:
            movement = cls._movement(
                product_id=updated.product_id,
                variant_id=updated.variant_id,
                warehouse_id=updated.warehouse_id,
                movement_type="Manual",
                quantity=updated.current_stock - old_stock,
                quantity_before=old_stock,
                quantity_after=updated.current_stock,
                user_id=user_id,
                reference_type="inventory",
                reference_id=updated.id,
                reason="Manual inventory update",
            )
            db.add(movement)
        cls.sync_product_stock(db, old_product_id, old_variant_id, user_id)
        cls.sync_product_stock(db, updated.product_id, updated.variant_id, user_id)
        db.commit()
        db.refresh(updated)
        return updated

    @classmethod
    def delete(cls, db: Session, item_id: int, user_id: int | None = None) -> Inventory:
        item = cls.get(db, item_id)
        product_id = item.product_id
        variant_id = item.variant_id
        deleted = cls.repository.soft_delete(db, item, user_id)
        cls.sync_product_stock(db, product_id, variant_id, user_id)
        db.commit()
        return deleted

    @classmethod
    def restore(cls, db: Session, item_id: int, user_id: int | None = None) -> Inventory:
        restored = cls.repository.restore(db, cls.get(db, item_id, include_deleted=True), user_id)
        cls.sync_product_stock(db, restored.product_id, restored.variant_id, user_id)
        db.commit()
        return restored

    @classmethod
    def _apply_stock_delta(
        cls,
        db: Session,
        *,
        product_id: int,
        variant_id: int | None,
        warehouse_id: int,
        delta: int,
        movement_type: str,
        user_id: int | None,
        reference_type: str | None = None,
        reference_id: int | None = None,
        reason: str | None = None,
        notes: str | None = None,
    ) -> tuple[Inventory, Any]:
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
            inventory = Inventory(product_id=product_id, variant_id=variant_id, warehouse_id=warehouse_id, current_stock=0)
            db.add(inventory)
            db.flush()
        before = inventory.current_stock or 0
        after = before + delta
        if after < 0:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Negative stock is not allowed"})
        inventory.current_stock = after
        inventory.available_stock = max(
            after - (inventory.reserved_stock or 0) + (inventory.incoming_stock or 0) - (inventory.outgoing_stock or 0),
            0,
        )
        inventory.updated_by = user_id
        movement = cls._movement(
            product_id=product_id,
            variant_id=variant_id,
            warehouse_id=warehouse_id,
            movement_type=movement_type,
            quantity=delta,
            quantity_before=before,
            quantity_after=after,
            user_id=user_id,
            reference_type=reference_type,
            reference_id=reference_id,
            reason=reason,
            notes=notes,
        )
        db.add(movement)
        cls.sync_product_stock(db, product_id, variant_id, user_id)
        db.commit()
        db.refresh(inventory)
        db.refresh(movement)
        return inventory, movement

    @classmethod
    def update_stock(
        cls,
        db: Session,
        *,
        product_id: int,
        variant_id: int | None,
        warehouse_id: int,
        delta: int,
        movement_type: str,
        user_id: int | None,
        reference_type: str | None = None,
        reference_id: int | None = None,
        reason: str | None = None,
    ) -> Inventory:
        inventory, _ = cls._apply_stock_delta(
            db,
            product_id=product_id,
            variant_id=variant_id,
            warehouse_id=warehouse_id,
            delta=delta,
            movement_type=movement_type,
            user_id=user_id,
            reference_type=reference_type,
            reference_id=reference_id,
            reason=reason,
        )
        return inventory


class StockMovementService(BaseInventoryService):
    repository = StockMovementRepository
    entity_name = "Stock movement"
    export_fields = ("id", "uuid", "product_id", "warehouse_id", "movement_type", "quantity", "quantity_after", "moved_at")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Any:
        payload = normalize_payload(cls.repository.to_dict(data))
        cls.ensure_required(payload, "product_id")
        cls.ensure_required(payload, "warehouse_id")
        cls.ensure_required(payload, "movement_type")
        cls.ensure_required(payload, "quantity")
        cls.ensure_exists(db, Product, payload.get("product_id"), "product_id")
        cls.ensure_exists(db, ProductVariant, payload.get("variant_id"), "variant_id")
        cls.ensure_exists(db, Warehouse, payload.get("warehouse_id"), "warehouse_id")
        if payload.get("variant_id") is not None:
            variant = db.query(ProductVariant).filter(ProductVariant.id == payload["variant_id"]).first()
            if variant and variant.product_id != payload["product_id"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"success": False, "message": "variant_id does not belong to product_id"},
                )
        movement_type = payload["movement_type"]
        quantity = payload["quantity"]
        delta = abs(quantity) if movement_type in {"Purchase", "Return"} else -abs(quantity)
        if movement_type == "Manual":
            delta = quantity
        if movement_type == "Adjustment":
            delta = quantity
        _, movement = InventoryItemService._apply_stock_delta(
            db,
            product_id=payload["product_id"],
            variant_id=payload.get("variant_id"),
            warehouse_id=payload["warehouse_id"],
            delta=delta,
            movement_type=movement_type,
            user_id=user_id,
            reference_type=payload.get("reference_type"),
            reference_id=payload.get("reference_id"),
            reason=payload.get("reason"),
            notes=payload.get("notes"),
        )
        return movement


class StockAdjustmentService(BaseInventoryService):
    repository = StockAdjustmentRepository
    entity_name = "Stock adjustment"

    @classmethod
    def apply_adjustment(cls, db: Session, adjustment: Any, user_id: int | None = None) -> None:
        if adjustment.status == "approved":
            InventoryItemService.update_stock(
                db,
                product_id=adjustment.product_id,
                variant_id=adjustment.variant_id,
                warehouse_id=adjustment.warehouse_id,
                delta=adjustment.quantity_delta,
                movement_type="Adjustment",
                user_id=user_id,
                reference_type="stock_adjustment",
                reference_id=adjustment.id,
                reason=adjustment.reason,
            )

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Any:
        adjustment = super().create(db, data, user_id)
        cls.apply_adjustment(db, adjustment, user_id)
        return adjustment

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Any:
        adjustment = cls.get(db, item_id)
        previous_status = adjustment.status
        updated = super().update(db, item_id, data, user_id)
        if previous_status != "approved" and updated.status == "approved":
            cls.apply_adjustment(db, updated, user_id)
        return updated

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "product_id")
            cls.ensure_required(payload, "warehouse_id")
            cls.ensure_required(payload, "quantity_delta")
            cls.ensure_required(payload, "reason")
        product_id = payload.get("product_id", getattr(item, "product_id", None))
        variant_id = payload.get("variant_id", getattr(item, "variant_id", None))
        warehouse_id = payload.get("warehouse_id", getattr(item, "warehouse_id", None))
        cls.ensure_exists(db, Product, product_id, "product_id")
        cls.ensure_exists(db, ProductVariant, variant_id, "variant_id")
        cls.ensure_exists(db, Warehouse, warehouse_id, "warehouse_id")
        if variant_id is not None and product_id is not None:
            variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
            if variant and variant.product_id != product_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"success": False, "message": "variant_id does not belong to product_id"},
                )


class StockTransferService(BaseInventoryService):
    repository = StockTransferRepository
    entity_name = "Stock transfer"
    duplicate_fields = ("transfer_number",)

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db
        if item is None and not payload.get("transfer_number"):
            payload["transfer_number"] = generate_identifier("TRF")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        if item is None:
            cls.ensure_required(payload, "product_id")
            cls.ensure_required(payload, "from_warehouse_id")
            cls.ensure_required(payload, "to_warehouse_id")
            cls.ensure_required(payload, "quantity")
        product_id = payload.get("product_id", getattr(item, "product_id", None))
        variant_id = payload.get("variant_id", getattr(item, "variant_id", None))
        from_warehouse_id = payload.get("from_warehouse_id", getattr(item, "from_warehouse_id", None))
        to_warehouse_id = payload.get("to_warehouse_id", getattr(item, "to_warehouse_id", None))
        cls.ensure_exists(db, Product, product_id, "product_id")
        cls.ensure_exists(db, ProductVariant, variant_id, "variant_id")
        cls.ensure_exists(db, Warehouse, from_warehouse_id, "from_warehouse_id")
        cls.ensure_exists(db, Warehouse, to_warehouse_id, "to_warehouse_id")
        if variant_id is not None and product_id is not None:
            variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
            if variant and variant.product_id != product_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"success": False, "message": "variant_id does not belong to product_id"},
                )
        if from_warehouse_id and from_warehouse_id == to_warehouse_id:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Warehouses must be different"})

    @classmethod
    def approve_transfer(cls, db: Session, transfer: Any, user_id: int | None = None) -> Any:
        transfer.approved_by = user_id
        transfer.approved_at = datetime.now(timezone.utc)
        transfer.history = [
            *(transfer.history or []),
            {"status": "approved", "at": transfer.approved_at.isoformat(), "by": user_id},
        ]
        InventoryItemService.update_stock(
            db,
            product_id=transfer.product_id,
            variant_id=transfer.variant_id,
            warehouse_id=transfer.from_warehouse_id,
            delta=-transfer.quantity,
            movement_type="Transfer",
            user_id=user_id,
            reference_type="stock_transfer",
            reference_id=transfer.id,
            reason="Transfer out",
        )
        InventoryItemService.update_stock(
            db,
            product_id=transfer.product_id,
            variant_id=transfer.variant_id,
            warehouse_id=transfer.to_warehouse_id,
            delta=transfer.quantity,
            movement_type="Transfer",
            user_id=user_id,
            reference_type="stock_transfer",
            reference_id=transfer.id,
            reason="Transfer in",
        )
        db.add(transfer)
        db.commit()
        db.refresh(transfer)
        return transfer

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Any:
        transfer = super().create(db, data, user_id)
        if transfer.status == "approved":
            return cls.approve_transfer(db, transfer, user_id)
        return transfer

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Any:
        transfer = cls.get(db, item_id)
        previous_status = transfer.status
        updated = super().update(db, item_id, data, user_id)
        if previous_status != "approved" and updated.status == "approved":
            return cls.approve_transfer(db, updated, user_id)
        return updated


InventoryService = InventoryItemService
