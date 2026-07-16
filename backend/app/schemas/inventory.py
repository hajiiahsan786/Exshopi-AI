from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import Field, field_validator, model_validator

from app.schemas.crm_common import APIResponse, AuditResponseMixin, CRMBaseModel, PaginatedResponse, validate_choice


STATUS_VALUES = {"active", "inactive", "archived", "draft"}
VISIBILITY_VALUES = {"public", "private", "hidden"}
MOVEMENT_TYPES = {"Purchase", "Sale", "Adjustment", "Transfer", "Return", "Damaged", "Lost", "Manual"}
TRANSFER_STATUS_VALUES = {"draft", "pending", "approved", "rejected", "completed", "cancelled"}
ADJUSTMENT_STATUS_VALUES = {"draft", "approved", "rejected"}


def validate_url(value: str | None, field_name: str) -> str | None:
    if value and not value.startswith(("http://", "https://")):
        raise ValueError(f"{field_name} must be a valid HTTP or HTTPS URL")
    return value


class InventoryQuery(CRMBaseModel):
    search: str | None = None
    status: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort_by: str = "created_at"
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
    include_deleted: bool = False


class CategoryBase(CRMBaseModel):
    parent_id: int | None = None
    name: str = Field(min_length=1, max_length=150)
    slug: str | None = Field(default=None, min_length=1, max_length=180)
    description: str | None = None
    status: str = "active"
    sort_order: int = 0

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CRMBaseModel):
    parent_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=150)
    slug: str | None = Field(default=None, min_length=1, max_length=180)
    description: str | None = None
    status: str | None = None
    sort_order: int | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")


class CategoryResponse(CategoryBase, AuditResponseMixin):
    id: int
    slug: str


class BrandBase(CRMBaseModel):
    name: str = Field(min_length=1, max_length=150)
    logo: str | None = Field(default=None, max_length=500)
    description: str | None = None
    website: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=100)
    status: str = "active"

    @field_validator("logo")
    @classmethod
    def validate_logo(cls, value: str | None) -> str | None:
        return validate_url(value, "logo")

    @field_validator("website")
    @classmethod
    def validate_website(cls, value: str | None) -> str | None:
        return validate_url(value, "website")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class BrandCreate(BrandBase):
    pass


class BrandUpdate(CRMBaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    logo: str | None = Field(default=None, max_length=500)
    description: str | None = None
    website: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=100)
    status: str | None = None

    @field_validator("logo")
    @classmethod
    def validate_logo(cls, value: str | None) -> str | None:
        return validate_url(value, "logo")

    @field_validator("website")
    @classmethod
    def validate_website(cls, value: str | None) -> str | None:
        return validate_url(value, "website")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")


class BrandResponse(BrandBase, AuditResponseMixin):
    id: int


class SupplierBase(CRMBaseModel):
    company: str = Field(min_length=1, max_length=180)
    contact_person: str | None = Field(default=None, max_length=150)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    address: str | None = None
    country: str | None = Field(default=None, max_length=100)
    website: str | None = Field(default=None, max_length=255)
    payment_terms: str | None = Field(default=None, max_length=255)
    tax_number: str | None = Field(default=None, max_length=100)
    status: str = "active"

    @field_validator("website")
    @classmethod
    def validate_website(cls, value: str | None) -> str | None:
        return validate_url(value, "website")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(SupplierBase):
    company: str | None = Field(default=None, min_length=1, max_length=180)
    status: str | None = None


class SupplierResponse(SupplierBase, AuditResponseMixin):
    id: int


class WarehouseBase(CRMBaseModel):
    name: str = Field(min_length=1, max_length=150)
    code: str = Field(min_length=1, max_length=50)
    location: str | None = Field(default=None, max_length=255)
    manager: int | None = None
    phone: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=255)
    capacity: Decimal | None = Field(default=None, ge=0)
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(WarehouseBase):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    code: str | None = Field(default=None, min_length=1, max_length=50)
    status: str | None = None


class WarehouseResponse(WarehouseBase, AuditResponseMixin):
    id: int


class UnitBase(CRMBaseModel):
    name: str = Field(min_length=1, max_length=100)
    code: str = Field(min_length=1, max_length=30)
    description: str | None = None
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class UnitCreate(UnitBase):
    pass


class UnitUpdate(UnitBase):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    code: str | None = Field(default=None, min_length=1, max_length=30)
    status: str | None = None


class UnitResponse(UnitBase, AuditResponseMixin):
    id: int


class ProductTagBase(CRMBaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str | None = Field(default=None, min_length=1, max_length=130)
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class ProductTagCreate(ProductTagBase):
    pass


class ProductTagUpdate(ProductTagBase):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    slug: str | None = Field(default=None, min_length=1, max_length=130)
    status: str | None = None


class ProductTagResponse(ProductTagBase, AuditResponseMixin):
    id: int
    slug: str


class ProductBase(CRMBaseModel):
    sku: str | None = Field(default=None, max_length=80)
    barcode: str | None = Field(default=None, max_length=120)
    name: str = Field(min_length=1, max_length=220)
    short_description: str | None = Field(default=None, max_length=500)
    full_description: str | None = None
    seo_title: str | None = Field(default=None, max_length=255)
    seo_description: str | None = Field(default=None, max_length=500)
    slug: str | None = Field(default=None, max_length=240)
    brand_id: int | None = None
    category_id: int | None = None
    supplier_id: int | None = None
    warehouse_id: int | None = None
    unit_id: int | None = None
    cost_price: Decimal = Field(default=0, ge=0)
    selling_price: Decimal = Field(default=0, ge=0)
    discount_price: Decimal | None = Field(default=None, ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=10)
    quantity: int = Field(default=0, ge=0)
    reserved_quantity: int = Field(default=0, ge=0)
    available_quantity: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=0, ge=0)
    weight: Decimal | None = Field(default=None, ge=0)
    length: Decimal | None = Field(default=None, ge=0)
    width: Decimal | None = Field(default=None, ge=0)
    height: Decimal | None = Field(default=None, ge=0)
    country_of_origin: str | None = Field(default=None, max_length=100)
    warranty: str | None = Field(default=None, max_length=255)
    status: str = "active"
    visibility: str = "public"
    featured: bool = False
    published: bool = False
    tags: list[str] = Field(default_factory=list)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value

    @field_validator("visibility")
    @classmethod
    def validate_visibility(cls, value: str) -> str:
        return validate_choice(value, VISIBILITY_VALUES, "visibility") or value

    @model_validator(mode="after")
    def validate_prices_and_stock(self) -> "ProductBase":
        if self.discount_price is not None and self.discount_price > self.selling_price:
            raise ValueError("discount_price cannot exceed selling_price")
        if self.reserved_quantity > self.quantity:
            raise ValueError("reserved_quantity cannot exceed quantity")
        return self


class ProductCreate(ProductBase):
    pass


class ProductUpdate(CRMBaseModel):
    sku: str | None = Field(default=None, max_length=80)
    barcode: str | None = Field(default=None, max_length=120)
    name: str | None = Field(default=None, min_length=1, max_length=220)
    short_description: str | None = Field(default=None, max_length=500)
    full_description: str | None = None
    seo_title: str | None = Field(default=None, max_length=255)
    seo_description: str | None = Field(default=None, max_length=500)
    slug: str | None = Field(default=None, max_length=240)
    brand_id: int | None = None
    category_id: int | None = None
    supplier_id: int | None = None
    warehouse_id: int | None = None
    unit_id: int | None = None
    cost_price: Decimal | None = Field(default=None, ge=0)
    selling_price: Decimal | None = Field(default=None, ge=0)
    discount_price: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=10)
    quantity: int | None = Field(default=None, ge=0)
    reserved_quantity: int | None = Field(default=None, ge=0)
    available_quantity: int | None = Field(default=None, ge=0)
    reorder_level: int | None = Field(default=None, ge=0)
    weight: Decimal | None = Field(default=None, ge=0)
    length: Decimal | None = Field(default=None, ge=0)
    width: Decimal | None = Field(default=None, ge=0)
    height: Decimal | None = Field(default=None, ge=0)
    country_of_origin: str | None = Field(default=None, max_length=100)
    warranty: str | None = Field(default=None, max_length=255)
    status: str | None = None
    visibility: str | None = None
    featured: bool | None = None
    published: bool | None = None
    tags: list[str] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")

    @field_validator("visibility")
    @classmethod
    def validate_visibility(cls, value: str | None) -> str | None:
        return validate_choice(value, VISIBILITY_VALUES, "visibility")


class ProductResponse(ProductBase, AuditResponseMixin):
    id: int
    sku: str
    barcode: str
    slug: str
    is_low_stock: bool = False
    is_out_of_stock: bool = False


class ProductVariantBase(CRMBaseModel):
    product_id: int
    sku: str | None = Field(default=None, max_length=80)
    barcode: str | None = Field(default=None, max_length=120)
    color: str | None = Field(default=None, max_length=80)
    size: str | None = Field(default=None, max_length=80)
    ram: str | None = Field(default=None, max_length=80)
    storage: str | None = Field(default=None, max_length=80)
    processor: str | None = Field(default=None, max_length=150)
    condition: str | None = Field(default=None, max_length=80)
    region: str | None = Field(default=None, max_length=80)
    serial_number: str | None = Field(default=None, max_length=120)
    imei: str | None = Field(default=None, max_length=120)
    mac_address: str | None = Field(default=None, max_length=120)
    quantity: int = Field(default=0, ge=0)
    reserved_quantity: int = Field(default=0, ge=0)
    available_quantity: int = Field(default=0, ge=0)
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class ProductVariantCreate(ProductVariantBase):
    pass


class ProductVariantUpdate(ProductVariantBase):
    product_id: int | None = None
    status: str | None = None


class ProductVariantResponse(ProductVariantBase, AuditResponseMixin):
    id: int
    sku: str
    barcode: str


class ProductAttributeBase(CRMBaseModel):
    product_id: int
    name: str = Field(min_length=1, max_length=120)
    sort_order: int = 0
    status: str = "active"


class ProductAttributeCreate(ProductAttributeBase):
    pass


class ProductAttributeUpdate(ProductAttributeBase):
    product_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=120)
    status: str | None = None


class ProductAttributeResponse(ProductAttributeBase, AuditResponseMixin):
    id: int


class AttributeValueBase(CRMBaseModel):
    attribute_id: int
    value: str = Field(min_length=1, max_length=180)
    sort_order: int = 0
    status: str = "active"


class AttributeValueCreate(AttributeValueBase):
    pass


class AttributeValueUpdate(AttributeValueBase):
    attribute_id: int | None = None
    value: str | None = Field(default=None, min_length=1, max_length=180)
    status: str | None = None


class AttributeValueResponse(AttributeValueBase, AuditResponseMixin):
    id: int


class ProductImageBase(CRMBaseModel):
    product_id: int
    image_url: str = Field(min_length=1, max_length=1000)
    thumbnail_url: str | None = Field(default=None, max_length=1000)
    is_primary: bool = False
    is_gallery: bool = True
    sort_order: int = 0
    alt_text: str | None = Field(default=None, max_length=255)
    status: str = "active"

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str) -> str:
        return validate_url(value, "image_url") or value

    @field_validator("thumbnail_url")
    @classmethod
    def validate_thumbnail_url(cls, value: str | None) -> str | None:
        return validate_url(value, "thumbnail_url")


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageUpdate(ProductImageBase):
    product_id: int | None = None
    image_url: str | None = Field(default=None, min_length=1, max_length=1000)
    status: str | None = None


class ProductImageResponse(ProductImageBase, AuditResponseMixin):
    id: int


class InventoryBase(CRMBaseModel):
    product_id: int
    variant_id: int | None = None
    warehouse_id: int
    current_stock: int = Field(default=0, ge=0)
    reserved_stock: int = Field(default=0, ge=0)
    incoming_stock: int = Field(default=0, ge=0)
    outgoing_stock: int = Field(default=0, ge=0)
    available_stock: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=0, ge=0)
    status: str = "active"


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(InventoryBase):
    product_id: int | None = None
    warehouse_id: int | None = None
    status: str | None = None


class InventoryResponse(InventoryBase, AuditResponseMixin):
    id: int
    is_low_stock: bool = False
    is_out_of_stock: bool = False


class StockMovementBase(CRMBaseModel):
    product_id: int
    variant_id: int | None = None
    warehouse_id: int
    movement_type: str
    quantity: int
    quantity_before: int = 0
    quantity_after: int = 0
    reference_type: str | None = Field(default=None, max_length=80)
    reference_id: int | None = None
    reason: str | None = Field(default=None, max_length=255)
    notes: str | None = None
    moved_at: datetime | None = None

    @field_validator("movement_type")
    @classmethod
    def validate_movement_type(cls, value: str) -> str:
        return validate_choice(value, MOVEMENT_TYPES, "movement_type") or value


class StockMovementCreate(StockMovementBase):
    pass


class StockMovementUpdate(StockMovementBase):
    product_id: int | None = None
    warehouse_id: int | None = None
    movement_type: str | None = None


class StockMovementResponse(StockMovementBase, AuditResponseMixin):
    id: int
    moved_at: datetime


class StockAdjustmentBase(CRMBaseModel):
    product_id: int
    variant_id: int | None = None
    warehouse_id: int
    quantity_delta: int
    reason: str = Field(min_length=1, max_length=255)
    status: str = "approved"
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, ADJUSTMENT_STATUS_VALUES, "status") or value


class StockAdjustmentCreate(StockAdjustmentBase):
    pass


class StockAdjustmentUpdate(StockAdjustmentBase):
    product_id: int | None = None
    warehouse_id: int | None = None
    reason: str | None = Field(default=None, min_length=1, max_length=255)
    status: str | None = None


class StockAdjustmentResponse(StockAdjustmentBase, AuditResponseMixin):
    id: int


class StockTransferBase(CRMBaseModel):
    transfer_number: str | None = Field(default=None, max_length=80)
    product_id: int
    variant_id: int | None = None
    from_warehouse_id: int
    to_warehouse_id: int
    quantity: int = Field(gt=0)
    status: str = "draft"
    approved_by: int | None = None
    approved_at: datetime | None = None
    history: list[dict[str, Any]] = Field(default_factory=list)
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, TRANSFER_STATUS_VALUES, "status") or value

    @model_validator(mode="after")
    def validate_warehouses(self) -> "StockTransferBase":
        if self.from_warehouse_id == self.to_warehouse_id:
            raise ValueError("from_warehouse_id and to_warehouse_id must be different")
        return self


class StockTransferCreate(StockTransferBase):
    pass


class StockTransferUpdate(StockTransferBase):
    transfer_number: str | None = Field(default=None, max_length=80)
    product_id: int | None = None
    from_warehouse_id: int | None = None
    to_warehouse_id: int | None = None
    quantity: int | None = Field(default=None, gt=0)
    status: str | None = None


class StockTransferResponse(StockTransferBase, AuditResponseMixin):
    id: int
    transfer_number: str


class BulkIdsRequest(CRMBaseModel):
    ids: list[int] = Field(min_length=1, max_length=500)


class BulkStatusRequest(BulkIdsRequest):
    status: str


class BulkUpdateRequest(BulkIdsRequest):
    values: dict[str, Any]


class BulkOperationResponse(CRMBaseModel):
    affected: int
    ids: list[int]


CategorySingleResponse = APIResponse[CategoryResponse]
CategoryListResponse = APIResponse[PaginatedResponse[CategoryResponse]]
BrandSingleResponse = APIResponse[BrandResponse]
BrandListResponse = APIResponse[PaginatedResponse[BrandResponse]]
SupplierSingleResponse = APIResponse[SupplierResponse]
SupplierListResponse = APIResponse[PaginatedResponse[SupplierResponse]]
WarehouseSingleResponse = APIResponse[WarehouseResponse]
WarehouseListResponse = APIResponse[PaginatedResponse[WarehouseResponse]]
ProductSingleResponse = APIResponse[ProductResponse]
ProductListResponse = APIResponse[PaginatedResponse[ProductResponse]]
ProductVariantSingleResponse = APIResponse[ProductVariantResponse]
ProductVariantListResponse = APIResponse[PaginatedResponse[ProductVariantResponse]]
ProductAttributeSingleResponse = APIResponse[ProductAttributeResponse]
ProductAttributeListResponse = APIResponse[PaginatedResponse[ProductAttributeResponse]]
AttributeValueSingleResponse = APIResponse[AttributeValueResponse]
AttributeValueListResponse = APIResponse[PaginatedResponse[AttributeValueResponse]]
ProductImageSingleResponse = APIResponse[ProductImageResponse]
ProductImageListResponse = APIResponse[PaginatedResponse[ProductImageResponse]]
InventorySingleResponse = APIResponse[InventoryResponse]
InventoryListResponse = APIResponse[PaginatedResponse[InventoryResponse]]
StockMovementSingleResponse = APIResponse[StockMovementResponse]
StockMovementListResponse = APIResponse[PaginatedResponse[StockMovementResponse]]
StockAdjustmentSingleResponse = APIResponse[StockAdjustmentResponse]
StockAdjustmentListResponse = APIResponse[PaginatedResponse[StockAdjustmentResponse]]
StockTransferSingleResponse = APIResponse[StockTransferResponse]
StockTransferListResponse = APIResponse[PaginatedResponse[StockTransferResponse]]
UnitSingleResponse = APIResponse[UnitResponse]
UnitListResponse = APIResponse[PaginatedResponse[UnitResponse]]
ProductTagSingleResponse = APIResponse[ProductTagResponse]
ProductTagListResponse = APIResponse[PaginatedResponse[ProductTagResponse]]
BulkResponse = APIResponse[BulkOperationResponse]
