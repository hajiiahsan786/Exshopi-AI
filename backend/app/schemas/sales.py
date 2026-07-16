from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import Field, field_validator, model_validator

from app.schemas.crm_common import APIResponse, AuditResponseMixin, CRMBaseModel, PaginatedResponse, validate_choice


ORDER_STATUS_VALUES = {
    "Pending",
    "Confirmed",
    "Processing",
    "Packed",
    "Ready",
    "Shipped",
    "Delivered",
    "Completed",
    "Cancelled",
    "Refunded",
    "Returned",
}
PAYMENT_STATUS_VALUES = {"Pending", "Authorized", "Paid", "Failed", "Refunded", "Partially Paid"}
SHIPMENT_STATUS_VALUES = {"Pending", "Packed", "Dispatched", "In Transit", "Delivered", "Returned", "Lost"}
QUOTE_STATUS_VALUES = {"Draft", "Sent", "Approved", "Rejected", "Expired", "Converted", "Cancelled"}
INVOICE_STATUS_VALUES = {"Draft", "Issued", "Paid", "Partially Paid", "Void", "Refunded", "Overdue"}
PAYMENT_METHOD_VALUES = {"Cash", "Card", "Bank", "Stripe", "PayPal", "Manual"}
DISCOUNT_TYPE_VALUES = {"Fixed", "Percentage", "Coupon", "Campaign"}
TAX_TYPE_VALUES = {"VAT", "GST", "Country Tax"}
GENERIC_STATUS_VALUES = {"active", "inactive", "archived"}
STOCK_STATUS_VALUES = {"pending", "reserved", "committed", "released", "restored"}


class SalesQuery(CRMBaseModel):
    search: str | None = None
    status: str | None = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort_by: str = "created_at"
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")
    include_deleted: bool = False


class SalesTotalsMixin(CRMBaseModel):
    currency: str = Field(default="USD", min_length=3, max_length=10)
    subtotal: Decimal = Field(default=0, ge=0)
    discount_total: Decimal = Field(default=0, ge=0)
    tax_total: Decimal = Field(default=0, ge=0)
    shipping_cost: Decimal = Field(default=0, ge=0)
    grand_total: Decimal = Field(default=0, ge=0)


class PaymentRollupMixin(CRMBaseModel):
    refund_total: Decimal = Field(default=0, ge=0)
    paid_amount: Decimal = Field(default=0, ge=0)
    outstanding_balance: Decimal = Field(default=0, ge=0)


class SalesLineBase(CRMBaseModel):
    product_id: int
    variant_id: int | None = None
    warehouse_id: int | None = None
    sku: str | None = Field(default=None, max_length=80)
    name: str | None = Field(default=None, max_length=220)
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    discount_amount: Decimal = Field(default=0, ge=0)
    tax_amount: Decimal = Field(default=0, ge=0)
    line_total: Decimal = Field(default=0, ge=0)

    @model_validator(mode="after")
    def validate_line_math(self) -> "SalesLineBase":
        if self.discount_amount > self.quantity * self.unit_price:
            raise ValueError("discount_amount cannot exceed line subtotal")
        return self


class OrderLineCreate(SalesLineBase):
    warehouse_id: int
    notes: str | None = None


class OrderItemCreate(OrderLineCreate):
    order_id: int
    stock_status: str = "pending"

    @field_validator("stock_status")
    @classmethod
    def validate_stock_status(cls, value: str) -> str:
        return validate_choice(value, STOCK_STATUS_VALUES, "stock_status") or value


class OrderItemUpdate(CRMBaseModel):
    order_id: int | None = None
    product_id: int | None = None
    variant_id: int | None = None
    warehouse_id: int | None = None
    sku: str | None = Field(default=None, max_length=80)
    name: str | None = Field(default=None, max_length=220)
    quantity: int | None = Field(default=None, gt=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    discount_amount: Decimal | None = Field(default=None, ge=0)
    tax_amount: Decimal | None = Field(default=None, ge=0)
    line_total: Decimal | None = Field(default=None, ge=0)
    stock_status: str | None = None
    notes: str | None = None

    @field_validator("stock_status")
    @classmethod
    def validate_stock_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STOCK_STATUS_VALUES, "stock_status")


class OrderItemResponse(OrderItemCreate, AuditResponseMixin):
    id: int
    name: str
    line_total: Decimal


class SalesOrderBase(SalesTotalsMixin, PaymentRollupMixin):
    organization_id: int
    company_id: int | None = None
    customer_id: int
    quote_id: int | None = None
    order_number: str | None = Field(default=None, max_length=80)
    order_date: datetime | None = None
    required_date: datetime | None = None
    status: str = "Pending"
    payment_status: str = "Pending"
    shipment_status: str = "Pending"
    billing_address: str | None = None
    shipping_address: str | None = None
    notes: str | None = None
    tags: list[str] = Field(default_factory=list)
    extra_data: dict[str, Any] = Field(default_factory=dict)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, ORDER_STATUS_VALUES, "status") or value

    @field_validator("payment_status")
    @classmethod
    def validate_payment_status(cls, value: str) -> str:
        return validate_choice(value, PAYMENT_STATUS_VALUES, "payment_status") or value

    @field_validator("shipment_status")
    @classmethod
    def validate_shipment_status(cls, value: str) -> str:
        return validate_choice(value, SHIPMENT_STATUS_VALUES, "shipment_status") or value


class SalesOrderCreate(SalesOrderBase):
    items: list[OrderLineCreate] = Field(min_length=1)


class SalesOrderUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    customer_id: int | None = None
    quote_id: int | None = None
    order_number: str | None = Field(default=None, max_length=80)
    order_date: datetime | None = None
    required_date: datetime | None = None
    status: str | None = None
    payment_status: str | None = None
    shipment_status: str | None = None
    currency: str | None = Field(default=None, min_length=3, max_length=10)
    subtotal: Decimal | None = Field(default=None, ge=0)
    discount_total: Decimal | None = Field(default=None, ge=0)
    tax_total: Decimal | None = Field(default=None, ge=0)
    shipping_cost: Decimal | None = Field(default=None, ge=0)
    refund_total: Decimal | None = Field(default=None, ge=0)
    grand_total: Decimal | None = Field(default=None, ge=0)
    paid_amount: Decimal | None = Field(default=None, ge=0)
    outstanding_balance: Decimal | None = Field(default=None, ge=0)
    billing_address: str | None = None
    shipping_address: str | None = None
    notes: str | None = None
    tags: list[str] | None = None
    extra_data: dict[str, Any] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, ORDER_STATUS_VALUES, "status")

    @field_validator("payment_status")
    @classmethod
    def validate_payment_status(cls, value: str | None) -> str | None:
        return validate_choice(value, PAYMENT_STATUS_VALUES, "payment_status")

    @field_validator("shipment_status")
    @classmethod
    def validate_shipment_status(cls, value: str | None) -> str | None:
        return validate_choice(value, SHIPMENT_STATUS_VALUES, "shipment_status")


class SalesOrderResponse(SalesOrderBase, AuditResponseMixin):
    id: int
    order_number: str
    order_date: datetime


class OrderNoteBase(CRMBaseModel):
    order_id: int
    note_type: str = Field(default="internal", max_length=50)
    body: str = Field(min_length=1)
    is_internal: bool = True


class OrderNoteCreate(OrderNoteBase):
    pass


class OrderNoteUpdate(CRMBaseModel):
    order_id: int | None = None
    note_type: str | None = Field(default=None, max_length=50)
    body: str | None = Field(default=None, min_length=1)
    is_internal: bool | None = None


class OrderNoteResponse(OrderNoteBase, AuditResponseMixin):
    id: int


class OrderAttachmentBase(CRMBaseModel):
    order_id: int
    file_name: str = Field(min_length=1, max_length=255)
    file_url: str = Field(min_length=1, max_length=1000)
    content_type: str | None = Field(default=None, max_length=120)
    size_bytes: int = Field(default=0, ge=0)
    description: str | None = None


class OrderAttachmentCreate(OrderAttachmentBase):
    pass


class OrderAttachmentUpdate(CRMBaseModel):
    order_id: int | None = None
    file_name: str | None = Field(default=None, min_length=1, max_length=255)
    file_url: str | None = Field(default=None, min_length=1, max_length=1000)
    content_type: str | None = Field(default=None, max_length=120)
    size_bytes: int | None = Field(default=None, ge=0)
    description: str | None = None


class OrderAttachmentResponse(OrderAttachmentBase, AuditResponseMixin):
    id: int


class OrderTimelineBase(CRMBaseModel):
    order_id: int
    event_type: str = Field(min_length=1, max_length=80)
    title: str = Field(min_length=1, max_length=180)
    description: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    occurred_at: datetime | None = None


class OrderTimelineCreate(OrderTimelineBase):
    pass


class OrderTimelineUpdate(CRMBaseModel):
    order_id: int | None = None
    event_type: str | None = Field(default=None, min_length=1, max_length=80)
    title: str | None = Field(default=None, min_length=1, max_length=180)
    description: str | None = None
    payload: dict[str, Any] | None = None
    occurred_at: datetime | None = None


class OrderTimelineResponse(OrderTimelineBase, AuditResponseMixin):
    id: int
    occurred_at: datetime


class QuoteLineCreate(SalesLineBase):
    pass


class QuoteItemCreate(QuoteLineCreate):
    quote_id: int


class QuoteItemUpdate(CRMBaseModel):
    quote_id: int | None = None
    product_id: int | None = None
    variant_id: int | None = None
    warehouse_id: int | None = None
    sku: str | None = Field(default=None, max_length=80)
    name: str | None = Field(default=None, max_length=220)
    quantity: int | None = Field(default=None, gt=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    discount_amount: Decimal | None = Field(default=None, ge=0)
    tax_amount: Decimal | None = Field(default=None, ge=0)
    line_total: Decimal | None = Field(default=None, ge=0)


class QuoteItemResponse(QuoteItemCreate, AuditResponseMixin):
    id: int
    name: str
    line_total: Decimal


class QuoteBase(SalesTotalsMixin):
    organization_id: int
    company_id: int | None = None
    customer_id: int
    quote_number: str | None = Field(default=None, max_length=80)
    quote_date: datetime | None = None
    valid_until: datetime | None = None
    status: str = "Draft"
    notes: str | None = None
    terms: str | None = None
    extra_data: dict[str, Any] = Field(default_factory=dict)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, QUOTE_STATUS_VALUES, "status") or value


class QuoteCreate(QuoteBase):
    items: list[QuoteLineCreate] = Field(default_factory=list)


class QuoteUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    customer_id: int | None = None
    quote_number: str | None = Field(default=None, max_length=80)
    quote_date: datetime | None = None
    valid_until: datetime | None = None
    status: str | None = None
    currency: str | None = Field(default=None, min_length=3, max_length=10)
    subtotal: Decimal | None = Field(default=None, ge=0)
    discount_total: Decimal | None = Field(default=None, ge=0)
    tax_total: Decimal | None = Field(default=None, ge=0)
    shipping_cost: Decimal | None = Field(default=None, ge=0)
    grand_total: Decimal | None = Field(default=None, ge=0)
    notes: str | None = None
    terms: str | None = None
    extra_data: dict[str, Any] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, QUOTE_STATUS_VALUES, "status")


class QuoteResponse(QuoteBase, AuditResponseMixin):
    id: int
    quote_number: str
    quote_date: datetime


class QuoteVersionCreate(CRMBaseModel):
    quote_id: int
    version_number: int = Field(gt=0)
    snapshot: dict[str, Any] = Field(default_factory=dict)


class QuoteVersionUpdate(CRMBaseModel):
    quote_id: int | None = None
    version_number: int | None = Field(default=None, gt=0)
    snapshot: dict[str, Any] | None = None


class QuoteVersionResponse(QuoteVersionCreate, AuditResponseMixin):
    id: int


class QuoteApprovalCreate(CRMBaseModel):
    quote_id: int
    status: str = "Pending"
    approved_by: int | None = None
    approved_at: datetime | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, {"Pending", "Approved", "Rejected"}, "status") or value


class QuoteApprovalUpdate(CRMBaseModel):
    quote_id: int | None = None
    status: str | None = None
    approved_by: int | None = None
    approved_at: datetime | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, {"Pending", "Approved", "Rejected"}, "status")


class QuoteApprovalResponse(QuoteApprovalCreate, AuditResponseMixin):
    id: int


class InvoiceLineCreate(SalesLineBase):
    order_item_id: int | None = None


class InvoiceItemCreate(InvoiceLineCreate):
    invoice_id: int


class InvoiceItemUpdate(CRMBaseModel):
    invoice_id: int | None = None
    order_item_id: int | None = None
    product_id: int | None = None
    variant_id: int | None = None
    sku: str | None = Field(default=None, max_length=80)
    name: str | None = Field(default=None, max_length=220)
    quantity: int | None = Field(default=None, gt=0)
    unit_price: Decimal | None = Field(default=None, ge=0)
    discount_amount: Decimal | None = Field(default=None, ge=0)
    tax_amount: Decimal | None = Field(default=None, ge=0)
    line_total: Decimal | None = Field(default=None, ge=0)


class InvoiceItemResponse(InvoiceItemCreate, AuditResponseMixin):
    id: int
    name: str
    line_total: Decimal


class InvoiceBase(SalesTotalsMixin, PaymentRollupMixin):
    organization_id: int
    company_id: int | None = None
    customer_id: int
    order_id: int | None = None
    invoice_number: str | None = Field(default=None, max_length=80)
    invoice_date: datetime | None = None
    due_date: datetime | None = None
    status: str = "Draft"
    payment_status: str = "Pending"
    notes: str | None = None
    extra_data: dict[str, Any] = Field(default_factory=dict)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, INVOICE_STATUS_VALUES, "status") or value

    @field_validator("payment_status")
    @classmethod
    def validate_payment_status(cls, value: str) -> str:
        return validate_choice(value, PAYMENT_STATUS_VALUES, "payment_status") or value


class InvoiceCreate(InvoiceBase):
    items: list[InvoiceLineCreate] = Field(default_factory=list)


class InvoiceUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    customer_id: int | None = None
    order_id: int | None = None
    invoice_number: str | None = Field(default=None, max_length=80)
    invoice_date: datetime | None = None
    due_date: datetime | None = None
    status: str | None = None
    payment_status: str | None = None
    currency: str | None = Field(default=None, min_length=3, max_length=10)
    subtotal: Decimal | None = Field(default=None, ge=0)
    discount_total: Decimal | None = Field(default=None, ge=0)
    tax_total: Decimal | None = Field(default=None, ge=0)
    shipping_cost: Decimal | None = Field(default=None, ge=0)
    refund_total: Decimal | None = Field(default=None, ge=0)
    grand_total: Decimal | None = Field(default=None, ge=0)
    paid_amount: Decimal | None = Field(default=None, ge=0)
    outstanding_balance: Decimal | None = Field(default=None, ge=0)
    notes: str | None = None
    extra_data: dict[str, Any] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, INVOICE_STATUS_VALUES, "status")

    @field_validator("payment_status")
    @classmethod
    def validate_payment_status(cls, value: str | None) -> str | None:
        return validate_choice(value, PAYMENT_STATUS_VALUES, "payment_status")


class InvoiceResponse(InvoiceBase, AuditResponseMixin):
    id: int
    invoice_number: str
    invoice_date: datetime


class InvoicePaymentCreate(CRMBaseModel):
    invoice_id: int
    payment_id: int
    amount: Decimal = Field(gt=0)
    applied_at: datetime | None = None


class InvoicePaymentUpdate(CRMBaseModel):
    invoice_id: int | None = None
    payment_id: int | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    applied_at: datetime | None = None


class InvoicePaymentResponse(InvoicePaymentCreate, AuditResponseMixin):
    id: int
    applied_at: datetime


class PaymentBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    customer_id: int
    order_id: int | None = None
    invoice_id: int | None = None
    payment_number: str | None = Field(default=None, max_length=80)
    payment_method: str = "Manual"
    status: str = "Pending"
    amount: Decimal = Field(ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=10)
    transaction_reference: str | None = Field(default=None, max_length=180)
    provider: str | None = Field(default=None, max_length=80)
    paid_at: datetime | None = None
    notes: str | None = None
    extra_data: dict[str, Any] = Field(default_factory=dict)

    @field_validator("payment_method")
    @classmethod
    def validate_method(cls, value: str) -> str:
        return validate_choice(value, PAYMENT_METHOD_VALUES, "payment_method") or value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, PAYMENT_STATUS_VALUES, "status") or value


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    customer_id: int | None = None
    order_id: int | None = None
    invoice_id: int | None = None
    payment_number: str | None = Field(default=None, max_length=80)
    payment_method: str | None = None
    status: str | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=10)
    transaction_reference: str | None = Field(default=None, max_length=180)
    provider: str | None = Field(default=None, max_length=80)
    paid_at: datetime | None = None
    notes: str | None = None
    extra_data: dict[str, Any] | None = None

    @field_validator("payment_method")
    @classmethod
    def validate_method(cls, value: str | None) -> str | None:
        return validate_choice(value, PAYMENT_METHOD_VALUES, "payment_method")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, PAYMENT_STATUS_VALUES, "status")


class PaymentResponse(PaymentBase, AuditResponseMixin):
    id: int
    payment_number: str


class DiscountBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    name: str = Field(min_length=1, max_length=150)
    code: str | None = Field(default=None, max_length=80)
    discount_type: str
    value: Decimal = Field(ge=0)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    usage_limit: int | None = Field(default=None, ge=0)
    used_count: int = Field(default=0, ge=0)
    status: str = "active"
    description: str | None = None

    @field_validator("discount_type")
    @classmethod
    def validate_discount_type(cls, value: str) -> str:
        return validate_choice(value, DISCOUNT_TYPE_VALUES, "discount_type") or value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, GENERIC_STATUS_VALUES, "status") or value


class DiscountCreate(DiscountBase):
    pass


class DiscountUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=150)
    code: str | None = Field(default=None, max_length=80)
    discount_type: str | None = None
    value: Decimal | None = Field(default=None, ge=0)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    usage_limit: int | None = Field(default=None, ge=0)
    used_count: int | None = Field(default=None, ge=0)
    status: str | None = None
    description: str | None = None

    @field_validator("discount_type")
    @classmethod
    def validate_discount_type(cls, value: str | None) -> str | None:
        return validate_choice(value, DISCOUNT_TYPE_VALUES, "discount_type")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, GENERIC_STATUS_VALUES, "status")


class DiscountResponse(DiscountBase, AuditResponseMixin):
    id: int


class TaxBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    name: str = Field(min_length=1, max_length=150)
    tax_type: str
    country: str | None = Field(default=None, max_length=100)
    region: str | None = Field(default=None, max_length=100)
    rate: Decimal = Field(ge=0, le=100)
    status: str = "active"
    description: str | None = None

    @field_validator("tax_type")
    @classmethod
    def validate_tax_type(cls, value: str) -> str:
        return validate_choice(value, TAX_TYPE_VALUES, "tax_type") or value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, GENERIC_STATUS_VALUES, "status") or value


class TaxCreate(TaxBase):
    pass


class TaxUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=150)
    tax_type: str | None = None
    country: str | None = Field(default=None, max_length=100)
    region: str | None = Field(default=None, max_length=100)
    rate: Decimal | None = Field(default=None, ge=0, le=100)
    status: str | None = None
    description: str | None = None

    @field_validator("tax_type")
    @classmethod
    def validate_tax_type(cls, value: str | None) -> str | None:
        return validate_choice(value, TAX_TYPE_VALUES, "tax_type")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, GENERIC_STATUS_VALUES, "status")


class TaxResponse(TaxBase, AuditResponseMixin):
    id: int


class ShippingMethodBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    name: str = Field(min_length=1, max_length=150)
    courier: str | None = Field(default=None, max_length=120)
    service_level: str | None = Field(default=None, max_length=120)
    base_rate: Decimal = Field(default=0, ge=0)
    status: str = "active"
    description: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, GENERIC_STATUS_VALUES, "status") or value


class ShippingMethodCreate(ShippingMethodBase):
    pass


class ShippingMethodUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=150)
    courier: str | None = Field(default=None, max_length=120)
    service_level: str | None = Field(default=None, max_length=120)
    base_rate: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    description: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, GENERIC_STATUS_VALUES, "status")


class ShippingMethodResponse(ShippingMethodBase, AuditResponseMixin):
    id: int


class ShipmentBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    order_id: int
    shipping_method_id: int | None = None
    shipment_number: str | None = Field(default=None, max_length=80)
    tracking_number: str | None = Field(default=None, max_length=180)
    courier: str | None = Field(default=None, max_length=120)
    status: str = "Pending"
    shipping_cost: Decimal = Field(default=0, ge=0)
    shipped_at: datetime | None = None
    delivered_at: datetime | None = None
    notes: str | None = None
    extra_data: dict[str, Any] = Field(default_factory=dict)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, SHIPMENT_STATUS_VALUES, "status") or value


class ShipmentCreate(ShipmentBase):
    pass


class ShipmentUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    order_id: int | None = None
    shipping_method_id: int | None = None
    shipment_number: str | None = Field(default=None, max_length=80)
    tracking_number: str | None = Field(default=None, max_length=180)
    courier: str | None = Field(default=None, max_length=120)
    status: str | None = None
    shipping_cost: Decimal | None = Field(default=None, ge=0)
    shipped_at: datetime | None = None
    delivered_at: datetime | None = None
    notes: str | None = None
    extra_data: dict[str, Any] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, SHIPMENT_STATUS_VALUES, "status")


class ShipmentResponse(ShipmentBase, AuditResponseMixin):
    id: int
    shipment_number: str


SalesOrderSingleResponse = APIResponse[SalesOrderResponse]
SalesOrderListResponse = APIResponse[PaginatedResponse[SalesOrderResponse]]
OrderItemSingleResponse = APIResponse[OrderItemResponse]
OrderItemListResponse = APIResponse[PaginatedResponse[OrderItemResponse]]
OrderNoteSingleResponse = APIResponse[OrderNoteResponse]
OrderNoteListResponse = APIResponse[PaginatedResponse[OrderNoteResponse]]
OrderAttachmentSingleResponse = APIResponse[OrderAttachmentResponse]
OrderAttachmentListResponse = APIResponse[PaginatedResponse[OrderAttachmentResponse]]
OrderTimelineSingleResponse = APIResponse[OrderTimelineResponse]
OrderTimelineListResponse = APIResponse[PaginatedResponse[OrderTimelineResponse]]
QuoteSingleResponse = APIResponse[QuoteResponse]
QuoteListResponse = APIResponse[PaginatedResponse[QuoteResponse]]
QuoteItemSingleResponse = APIResponse[QuoteItemResponse]
QuoteItemListResponse = APIResponse[PaginatedResponse[QuoteItemResponse]]
QuoteVersionSingleResponse = APIResponse[QuoteVersionResponse]
QuoteVersionListResponse = APIResponse[PaginatedResponse[QuoteVersionResponse]]
QuoteApprovalSingleResponse = APIResponse[QuoteApprovalResponse]
QuoteApprovalListResponse = APIResponse[PaginatedResponse[QuoteApprovalResponse]]
InvoiceSingleResponse = APIResponse[InvoiceResponse]
InvoiceListResponse = APIResponse[PaginatedResponse[InvoiceResponse]]
InvoiceItemSingleResponse = APIResponse[InvoiceItemResponse]
InvoiceItemListResponse = APIResponse[PaginatedResponse[InvoiceItemResponse]]
InvoicePaymentSingleResponse = APIResponse[InvoicePaymentResponse]
InvoicePaymentListResponse = APIResponse[PaginatedResponse[InvoicePaymentResponse]]
PaymentSingleResponse = APIResponse[PaymentResponse]
PaymentListResponse = APIResponse[PaginatedResponse[PaymentResponse]]
DiscountSingleResponse = APIResponse[DiscountResponse]
DiscountListResponse = APIResponse[PaginatedResponse[DiscountResponse]]
TaxSingleResponse = APIResponse[TaxResponse]
TaxListResponse = APIResponse[PaginatedResponse[TaxResponse]]
ShippingMethodSingleResponse = APIResponse[ShippingMethodResponse]
ShippingMethodListResponse = APIResponse[PaginatedResponse[ShippingMethodResponse]]
ShipmentSingleResponse = APIResponse[ShipmentResponse]
ShipmentListResponse = APIResponse[PaginatedResponse[ShipmentResponse]]
