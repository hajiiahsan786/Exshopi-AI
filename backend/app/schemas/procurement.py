from datetime import date, datetime
from decimal import Decimal
from typing import Any, List, Dict
from pydantic import Field, field_validator, model_validator
from app.schemas.crm_common import APIResponse, AuditResponseMixin, CRMBaseModel, PaginatedResponse, validate_choice

STATUS_VALUES = {"active", "inactive", "archived", "draft"}
PRIORITY_VALUES = {"low", "medium", "high", "urgent"}
PR_STATUS_VALUES = {"draft", "pending_approval", "approved", "rejected", "cancelled"}
RFQ_STATUS_VALUES = {"draft", "sent", "closed", "awarded"}
RFQ_SUPPLIER_STATUS_VALUES = {"invited", "responded", "won", "lost"}
PO_STATUS_VALUES = {"draft", "approved", "sent", "partially_received", "completed", "cancelled"}
GRN_STATUS_VALUES = {"draft", "completed"}
RETURN_STATUS_VALUES = {"draft", "completed"}
PAYMENT_STATUS_VALUES = {"pending", "completed", "failed"}
CONDITION_TYPES = {"damaged", "wrong_item", "defective", "unused"}
QUALITY_STATUS_VALUES = {"passed", "failed", "partial"}


# SupplierCategory
class SupplierCategoryBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    name: str = Field(min_length=1, max_length=150)
    description: str | None = None
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class SupplierCategoryCreate(SupplierCategoryBase):
    pass


class SupplierCategoryUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")


class SupplierCategoryResponse(SupplierCategoryBase, AuditResponseMixin):
    id: int


# SupplierContact
class SupplierContactBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    supplier_id: int
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    position: str | None = Field(default=None, max_length=100)
    is_primary: bool = False
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class SupplierContactCreate(SupplierContactBase):
    pass


class SupplierContactUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    supplier_id: int | None = None
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    position: str | None = Field(default=None, max_length=100)
    is_primary: bool | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")


class SupplierContactResponse(SupplierContactBase, AuditResponseMixin):
    id: int


# SupplierAddress
class SupplierAddressBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    supplier_id: int
    address_line1: str = Field(min_length=1, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)
    country: str = Field(min_length=1, max_length=100)
    address_type: str = "billing"
    is_primary: bool = False
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class SupplierAddressCreate(SupplierAddressBase):
    pass


class SupplierAddressUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    supplier_id: int | None = None
    address_line1: str | None = Field(default=None, min_length=1, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    state: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, min_length=1, max_length=100)
    address_type: str | None = None
    is_primary: bool | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")


class SupplierAddressResponse(SupplierAddressBase, AuditResponseMixin):
    id: int


# SupplierBankingInfo
class SupplierBankingInfoBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    supplier_id: int
    bank_name: str = Field(min_length=1, max_length=180)
    account_name: str = Field(min_length=1, max_length=180)
    account_number: str = Field(min_length=1, max_length=120)
    routing_number: str | None = Field(default=None, max_length=100)
    swift_code: str | None = Field(default=None, max_length=50)
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class SupplierBankingInfoCreate(SupplierBankingInfoBase):
    pass


class SupplierBankingInfoUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    supplier_id: int | None = None
    bank_name: str | None = Field(default=None, min_length=1, max_length=180)
    account_name: str | None = Field(default=None, min_length=1, max_length=180)
    account_number: str | None = Field(default=None, min_length=1, max_length=120)
    routing_number: str | None = Field(default=None, max_length=100)
    swift_code: str | None = Field(default=None, max_length=50)
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")


class SupplierBankingInfoResponse(SupplierBankingInfoBase, AuditResponseMixin):
    id: int


# SupplierDocument
class SupplierDocumentBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    supplier_id: int
    name: str = Field(min_length=1, max_length=200)
    document_type: str = Field(min_length=1, max_length=100)
    document_url: str = Field(min_length=1, max_length=1000)
    expires_at: date | None = None
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class SupplierDocumentCreate(SupplierDocumentBase):
    pass


class SupplierDocumentUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    supplier_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=200)
    document_type: str | None = Field(default=None, min_length=1, max_length=100)
    document_url: str | None = Field(default=None, min_length=1, max_length=1000)
    expires_at: date | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")


class SupplierDocumentResponse(SupplierDocumentBase, AuditResponseMixin):
    id: int
    uploaded_at: datetime


# SupplierRating
class SupplierRatingBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    supplier_id: int
    rater_id: int | None = None
    quality_score: Decimal = Field(default=0.0, ge=0.0, le=5.0)
    delivery_score: Decimal = Field(default=0.0, ge=0.0, le=5.0)
    cost_score: Decimal = Field(default=0.0, ge=0.0, le=5.0)
    service_score: Decimal = Field(default=0.0, ge=0.0, le=5.0)
    overall_score: Decimal = Field(default=0.0, ge=0.0, le=5.0)
    comments: str | None = None
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class SupplierRatingCreate(SupplierRatingBase):
    pass


class SupplierRatingUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    supplier_id: int | None = None
    rater_id: int | None = None
    quality_score: Decimal | None = Field(default=None, ge=0.0, le=5.0)
    delivery_score: Decimal | None = Field(default=None, ge=0.0, le=5.0)
    cost_score: Decimal | None = Field(default=None, ge=0.0, le=5.0)
    service_score: Decimal | None = Field(default=None, ge=0.0, le=5.0)
    overall_score: Decimal | None = Field(default=None, ge=0.0, le=5.0)
    comments: str | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")


class SupplierRatingResponse(SupplierRatingBase, AuditResponseMixin):
    id: int


# SupplierPerformance
class SupplierPerformanceBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    supplier_id: int
    evaluation_period: str = Field(min_length=1, max_length=100)
    on_time_delivery_rate: Decimal = Field(default=100.0, ge=0.0, le=100.0)
    quality_pass_rate: Decimal = Field(default=100.0, ge=0.0, le=100.0)
    average_lead_time_days: Decimal = Field(default=0.0, ge=0.0)
    cost_savings_percent: Decimal = Field(default=0.0, ge=0.0, le=100.0)
    overall_performance_score: Decimal = Field(default=100.0, ge=0.0, le=100.0)
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, STATUS_VALUES, "status") or value


class SupplierPerformanceCreate(SupplierPerformanceBase):
    pass


class SupplierPerformanceUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    supplier_id: int | None = None
    evaluation_period: str | None = Field(default=None, min_length=1, max_length=100)
    on_time_delivery_rate: Decimal | None = Field(default=None, ge=0.0, le=100.0)
    quality_pass_rate: Decimal | None = Field(default=None, ge=0.0, le=100.0)
    average_lead_time_days: Decimal | None = Field(default=None, ge=0.0)
    cost_savings_percent: Decimal | None = Field(default=None, ge=0.0, le=100.0)
    overall_performance_score: Decimal | None = Field(default=None, ge=0.0, le=100.0)
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, STATUS_VALUES, "status")


class SupplierPerformanceResponse(SupplierPerformanceBase, AuditResponseMixin):
    id: int


# Purchase Request Item
class PurchaseRequestItemBase(CRMBaseModel):
    product_id: int
    variant_id: int | None = None
    quantity: int = Field(default=1, gt=0)
    estimated_unit_price: Decimal = Field(default=0.0, ge=0.0)
    total_price: Decimal = Field(default=0.0, ge=0.0)
    status: str = "pending"


class PurchaseRequestItemCreate(PurchaseRequestItemBase):
    pass


class PurchaseRequestItemUpdate(CRMBaseModel):
    product_id: int | None = None
    variant_id: int | None = None
    quantity: int | None = Field(default=None, gt=0)
    estimated_unit_price: Decimal | None = Field(default=None, ge=0.0)
    total_price: Decimal | None = Field(default=None, ge=0.0)
    status: str | None = None


class PurchaseRequestItemResponse(PurchaseRequestItemBase, AuditResponseMixin):
    id: int
    purchase_request_id: int


# Purchase Request Approval
class PurchaseRequestApprovalBase(CRMBaseModel):
    approver_id: int
    action: str = "approved" # approved, rejected
    comments: str | None = None
    status: str = "completed"


class PurchaseRequestApprovalCreate(PurchaseRequestApprovalBase):
    pass


class PurchaseRequestApprovalUpdate(CRMBaseModel):
    approver_id: int | None = None
    action: str | None = None
    comments: str | None = None
    status: str | None = None


class PurchaseRequestApprovalResponse(PurchaseRequestApprovalBase, AuditResponseMixin):
    id: int
    purchase_request_id: int
    approved_at: datetime


# Purchase Request
class PurchaseRequestBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    department_id: int
    requester_id: int
    budget_id: int | None = None
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    priority: str = "medium"
    status: str = "draft"
    total_amount: Decimal = Field(default=0.0, ge=0.0)
    notes: str | None = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str) -> str:
        return validate_choice(value, PRIORITY_VALUES, "priority") or value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, PR_STATUS_VALUES, "status") or value


class PurchaseRequestCreate(PurchaseRequestBase):
    items: list[PurchaseRequestItemCreate] = Field(default_factory=list)


class PurchaseRequestUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    department_id: int | None = None
    requester_id: int | None = None
    budget_id: int | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    priority: str | None = None
    status: str | None = None
    total_amount: Decimal | None = Field(default=None, ge=0.0)
    notes: str | None = None
    items: list[PurchaseRequestItemCreate] | None = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value: str | None) -> str | None:
        return validate_choice(value, PRIORITY_VALUES, "priority")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, PR_STATUS_VALUES, "status")


class PurchaseRequestResponse(PurchaseRequestBase, AuditResponseMixin):
    id: int
    items: list[PurchaseRequestItemResponse] = []
    approvals: list[PurchaseRequestApprovalResponse] = []


# RFQItem
class RFQItemBase(CRMBaseModel):
    product_id: int
    variant_id: int | None = None
    quantity: int = Field(default=1, gt=0)
    description: str | None = None
    status: str = "active"


class RFQItemCreate(RFQItemBase):
    pass


class RFQItemUpdate(CRMBaseModel):
    product_id: int | None = None
    variant_id: int | None = None
    quantity: int | None = Field(default=None, gt=0)
    description: str | None = None
    status: str | None = None


class RFQItemResponse(RFQItemBase, AuditResponseMixin):
    id: int
    rfq_id: int


# RFQResponseItem
class RFQResponseItemBase(CRMBaseModel):
    rfq_item_id: int
    quoted_unit_price: Decimal = Field(default=0.0, ge=0.0)
    quoted_total_price: Decimal = Field(default=0.0, ge=0.0)
    delivery_lead_time_days: int = Field(default=0, ge=0)
    status: str = "pending"


class RFQResponseItemCreate(RFQResponseItemBase):
    pass


class RFQResponseItemUpdate(CRMBaseModel):
    rfq_item_id: int | None = None
    quoted_unit_price: Decimal | None = Field(default=None, ge=0.0)
    quoted_total_price: Decimal | None = Field(default=None, ge=0.0)
    delivery_lead_time_days: int | None = Field(default=None, ge=0)
    status: str | None = None


class RFQResponseItemResponse(RFQResponseItemBase, AuditResponseMixin):
    id: int
    rfq_supplier_id: int


# RFQSupplier
class RFQSupplierBase(CRMBaseModel):
    supplier_id: int
    status: str = "invited"
    total_bid: Decimal = Field(default=0.0, ge=0.0)
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, RFQ_SUPPLIER_STATUS_VALUES, "status") or value


class RFQSupplierCreate(RFQSupplierBase):
    responses: list[RFQResponseItemCreate] = Field(default_factory=list)


class RFQSupplierUpdate(CRMBaseModel):
    supplier_id: int | None = None
    status: str | None = None
    total_bid: Decimal | None = Field(default=None, ge=0.0)
    notes: str | None = None
    responses: list[RFQResponseItemCreate] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, RFQ_SUPPLIER_STATUS_VALUES, "status")


class RFQSupplierResponse(RFQSupplierBase, AuditResponseMixin):
    id: int
    rfq_id: int
    submitted_at: datetime | None = None
    responses: list[RFQResponseItemResponse] = []


# RFQ
class RFQBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    rfq_number: str | None = Field(default=None, max_length=80)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    status: str = "draft"
    due_date: datetime

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, RFQ_STATUS_VALUES, "status") or value


class RFQCreate(RFQBase):
    items: list[RFQItemCreate] = Field(default_factory=list)
    supplier_ids: list[int] = Field(default_factory=list)


class RFQUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    rfq_number: str | None = Field(default=None, max_length=80)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = None
    due_date: datetime | None = None
    items: list[RFQItemCreate] | None = None
    supplier_ids: list[int] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, RFQ_STATUS_VALUES, "status")


class RFQResponse(RFQBase, AuditResponseMixin):
    id: int
    rfq_number: str
    items: list[RFQItemResponse] = []
    suppliers: list[RFQSupplierResponse] = []


# Purchase Order Item
class PurchaseOrderItemBase(CRMBaseModel):
    product_id: int
    variant_id: int | None = None
    quantity: int = Field(default=1, gt=0)
    received_quantity: int = Field(default=0, ge=0)
    returned_quantity: int = Field(default=0, ge=0)
    unit_price: Decimal = Field(default=0.0, ge=0.0)
    tax_rate: Decimal = Field(default=0.0, ge=0.0)
    tax_amount: Decimal = Field(default=0.0, ge=0.0)
    discount_amount: Decimal = Field(default=0.0, ge=0.0)
    total_amount: Decimal = Field(default=0.0, ge=0.0)
    status: str = "pending"


class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass


class PurchaseOrderItemUpdate(CRMBaseModel):
    product_id: int | None = None
    variant_id: int | None = None
    quantity: int | None = Field(default=None, gt=0)
    received_quantity: int | None = Field(default=None, ge=0)
    returned_quantity: int | None = Field(default=None, ge=0)
    unit_price: Decimal | None = Field(default=None, ge=0.0)
    tax_rate: Decimal | None = Field(default=None, ge=0.0)
    tax_amount: Decimal | None = Field(default=None, ge=0.0)
    discount_amount: Decimal | None = Field(default=None, ge=0.0)
    total_amount: Decimal | None = Field(default=None, ge=0.0)
    status: str | None = None


class PurchaseOrderItemResponse(PurchaseOrderItemBase, AuditResponseMixin):
    id: int
    purchase_order_id: int


# Purchase Order Approval
class PurchaseOrderApprovalBase(CRMBaseModel):
    approver_id: int
    action: str = "approved" # approved, rejected
    comments: str | None = None
    status: str = "completed"


class PurchaseOrderApprovalCreate(PurchaseOrderApprovalBase):
    pass


class PurchaseOrderApprovalUpdate(CRMBaseModel):
    approver_id: int | None = None
    action: str | None = None
    comments: str | None = None
    status: str | None = None


class PurchaseOrderApprovalResponse(PurchaseOrderApprovalBase, AuditResponseMixin):
    id: int
    purchase_order_id: int
    approved_at: datetime


# Purchase Order
class PurchaseOrderBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    rfq_id: int | None = None
    supplier_id: int
    purchase_request_id: int | None = None
    po_number: str | None = Field(default=None, max_length=80)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    status: str = "draft"
    total_amount: Decimal = Field(default=0.0, ge=0.0)
    currency: str = "USD"
    shipping_address: str | None = None
    billing_address: str | None = None
    delivery_date: date | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, PO_STATUS_VALUES, "status") or value


class PurchaseOrderCreate(PurchaseOrderBase):
    items: list[PurchaseOrderItemCreate] = Field(default_factory=list)


class PurchaseOrderUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    rfq_id: int | None = None
    supplier_id: int | None = None
    purchase_request_id: int | None = None
    po_number: str | None = Field(default=None, max_length=80)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    status: str | None = None
    total_amount: Decimal | None = Field(default=None, ge=0.0)
    currency: str | None = None
    shipping_address: str | None = None
    billing_address: str | None = None
    delivery_date: date | None = None
    notes: str | None = None
    items: list[PurchaseOrderItemCreate] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, PO_STATUS_VALUES, "status")


class PurchaseOrderResponse(PurchaseOrderBase, AuditResponseMixin):
    id: int
    items: list[PurchaseOrderItemResponse] = []
    approvals: list[PurchaseOrderApprovalResponse] = []


# Goods Receipt Item
class GoodsReceiptItemBase(CRMBaseModel):
    product_id: int
    variant_id: int | None = None
    quantity_ordered: int
    quantity_received: int = Field(default=0, ge=0)
    quantity_damaged: int = Field(default=0, ge=0)
    batch_number: str | None = Field(default=None, max_length=100)
    serial_number: str | None = Field(default=None, max_length=100)
    quality_status: str = "passed"
    inspection_notes: str | None = None
    status: str = "active"

    @field_validator("quality_status")
    @classmethod
    def validate_quality_status(cls, value: str) -> str:
        return validate_choice(value, QUALITY_STATUS_VALUES, "quality_status") or value


class GoodsReceiptItemCreate(GoodsReceiptItemBase):
    pass


class GoodsReceiptItemUpdate(CRMBaseModel):
    product_id: int | None = None
    variant_id: int | None = None
    quantity_ordered: int | None = None
    quantity_received: int | None = Field(default=None, ge=0)
    quantity_damaged: int | None = Field(default=None, ge=0)
    batch_number: str | None = Field(default=None, max_length=100)
    serial_number: str | None = Field(default=None, max_length=100)
    quality_status: str | None = None
    inspection_notes: str | None = None
    status: str | None = None

    @field_validator("quality_status")
    @classmethod
    def validate_quality_status(cls, value: str | None) -> str | None:
        return validate_choice(value, QUALITY_STATUS_VALUES, "quality_status")


class GoodsReceiptItemResponse(GoodsReceiptItemBase, AuditResponseMixin):
    id: int
    goods_receipt_note_id: int


# Goods Receipt (GRN)
class GoodsReceiptBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    purchase_order_id: int
    warehouse_id: int
    grn_number: str | None = Field(default=None, max_length=80)
    received_by_id: int
    status: str = "draft"
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, GRN_STATUS_VALUES, "status") or value


class GoodsReceiptCreate(GoodsReceiptBase):
    items: list[GoodsReceiptItemCreate] = Field(default_factory=list)


class GoodsReceiptUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    purchase_order_id: int | None = None
    warehouse_id: int | None = None
    grn_number: str | None = Field(default=None, max_length=80)
    received_by_id: int | None = None
    status: str | None = None
    notes: str | None = None
    items: list[GoodsReceiptItemCreate] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, GRN_STATUS_VALUES, "status")


class GoodsReceiptResponse(GoodsReceiptBase, AuditResponseMixin):
    id: int
    received_at: datetime
    items: list[GoodsReceiptItemResponse] = []


# Purchase Return Item
class PurchaseReturnItemBase(CRMBaseModel):
    product_id: int
    variant_id: int | None = None
    quantity_returned: int = Field(default=1, gt=0)
    refund_unit_price: Decimal = Field(default=0.0, ge=0.0)
    reason: str | None = Field(default=None, max_length=255)
    condition_type: str = "unused"
    status: str = "active"

    @field_validator("condition_type")
    @classmethod
    def validate_condition_type(cls, value: str) -> str:
        return validate_choice(value, CONDITION_TYPES, "condition_type") or value


class PurchaseReturnItemCreate(PurchaseReturnItemBase):
    pass


class PurchaseReturnItemUpdate(CRMBaseModel):
    product_id: int | None = None
    variant_id: int | None = None
    quantity_returned: int | None = Field(default=None, gt=0)
    refund_unit_price: Decimal | None = Field(default=None, ge=0.0)
    reason: str | None = Field(default=None, max_length=255)
    condition_type: str | None = None
    status: str | None = None

    @field_validator("condition_type")
    @classmethod
    def validate_condition_type(cls, value: str | None) -> str | None:
        return validate_choice(value, CONDITION_TYPES, "condition_type")


class PurchaseReturnItemResponse(PurchaseReturnItemBase, AuditResponseMixin):
    id: int
    purchase_return_id: int


# Purchase Return
class PurchaseReturnBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    purchase_order_id: int | None = None
    goods_receipt_note_id: int | None = None
    supplier_id: int
    warehouse_id: int
    return_number: str | None = Field(default=None, max_length=80)
    returned_by_id: int
    status: str = "draft"
    total_refund_amount: Decimal = Field(default=0.0, ge=0.0)
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, RETURN_STATUS_VALUES, "status") or value


class PurchaseReturnCreate(PurchaseReturnBase):
    items: list[PurchaseReturnItemCreate] = Field(default_factory=list)


class PurchaseReturnUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    purchase_order_id: int | None = None
    goods_receipt_note_id: int | None = None
    supplier_id: int | None = None
    warehouse_id: int | None = None
    return_number: str | None = Field(default=None, max_length=80)
    returned_by_id: int | None = None
    status: str | None = None
    total_refund_amount: Decimal | None = Field(default=None, ge=0.0)
    notes: str | None = None
    items: list[PurchaseReturnItemCreate] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, RETURN_STATUS_VALUES, "status")


class PurchaseReturnResponse(PurchaseReturnBase, AuditResponseMixin):
    id: int
    returned_at: datetime
    items: list[PurchaseReturnItemResponse] = []


# Supplier Payment
class SupplierPaymentBase(CRMBaseModel):
    organization_id: int
    company_id: int | None = None
    vendor_bill_id: int
    supplier_id: int
    payment_number: str | None = Field(default=None, max_length=80)
    payment_method: str = "Manual"
    status: str = "pending"
    amount: Decimal = Field(ge=0.0)
    currency: str = "USD"
    transaction_reference: str | None = Field(default=None, max_length=180)
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, PAYMENT_STATUS_VALUES, "status") or value


class SupplierPaymentCreate(SupplierPaymentBase):
    pass


class SupplierPaymentUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    vendor_bill_id: int | None = None
    supplier_id: int | None = None
    payment_number: str | None = Field(default=None, max_length=80)
    payment_method: str | None = None
    status: str | None = None
    amount: Decimal | None = Field(default=None, ge=0.0)
    currency: str | None = None
    transaction_reference: str | None = Field(default=None, max_length=180)
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, PAYMENT_STATUS_VALUES, "status")


class SupplierPaymentResponse(SupplierPaymentBase, AuditResponseMixin):
    id: int
    paid_at: datetime


# API Response Wrapper Types
SupplierCategorySingleResponse = APIResponse[SupplierCategoryResponse]
SupplierCategoryListResponse = APIResponse[PaginatedResponse[SupplierCategoryResponse]]

SupplierContactSingleResponse = APIResponse[SupplierContactResponse]
SupplierContactListResponse = APIResponse[PaginatedResponse[SupplierContactResponse]]

SupplierAddressSingleResponse = APIResponse[SupplierAddressResponse]
SupplierAddressListResponse = APIResponse[PaginatedResponse[SupplierAddressResponse]]

SupplierBankingInfoSingleResponse = APIResponse[SupplierBankingInfoResponse]
SupplierBankingInfoListResponse = APIResponse[PaginatedResponse[SupplierBankingInfoResponse]]

SupplierDocumentSingleResponse = APIResponse[SupplierDocumentResponse]
SupplierDocumentListResponse = APIResponse[PaginatedResponse[SupplierDocumentResponse]]

SupplierRatingSingleResponse = APIResponse[SupplierRatingResponse]
SupplierRatingListResponse = APIResponse[PaginatedResponse[SupplierRatingResponse]]

SupplierPerformanceSingleResponse = APIResponse[SupplierPerformanceResponse]
SupplierPerformanceListResponse = APIResponse[PaginatedResponse[SupplierPerformanceResponse]]

PurchaseRequestSingleResponse = APIResponse[PurchaseRequestResponse]
PurchaseRequestListResponse = APIResponse[PaginatedResponse[PurchaseRequestResponse]]

PurchaseRequestItemSingleResponse = APIResponse[PurchaseRequestItemResponse]
PurchaseRequestItemListResponse = APIResponse[PaginatedResponse[PurchaseRequestItemResponse]]

PurchaseRequestApprovalSingleResponse = APIResponse[PurchaseRequestApprovalResponse]
PurchaseRequestApprovalListResponse = APIResponse[PaginatedResponse[PurchaseRequestApprovalResponse]]

RFQSingleResponse = APIResponse[RFQResponse]
RFQListResponse = APIResponse[PaginatedResponse[RFQResponse]]

RFQItemSingleResponse = APIResponse[RFQItemResponse]
RFQItemListResponse = APIResponse[PaginatedResponse[RFQItemResponse]]

RFQSupplierSingleResponse = APIResponse[RFQSupplierResponse]
RFQSupplierListResponse = APIResponse[PaginatedResponse[RFQSupplierResponse]]

RFQResponseItemSingleResponse = APIResponse[RFQResponseItemResponse]
RFQResponseItemListResponse = APIResponse[PaginatedResponse[RFQResponseItemResponse]]

PurchaseOrderSingleResponse = APIResponse[PurchaseOrderResponse]
PurchaseOrderListResponse = APIResponse[PaginatedResponse[PurchaseOrderResponse]]

PurchaseOrderItemSingleResponse = APIResponse[PurchaseOrderItemResponse]
PurchaseOrderItemListResponse = APIResponse[PaginatedResponse[PurchaseOrderItemResponse]]

PurchaseOrderApprovalSingleResponse = APIResponse[PurchaseOrderApprovalResponse]
PurchaseOrderApprovalListResponse = APIResponse[PaginatedResponse[PurchaseOrderApprovalResponse]]

GoodsReceiptSingleResponse = APIResponse[GoodsReceiptResponse]
GoodsReceiptListResponse = APIResponse[PaginatedResponse[GoodsReceiptResponse]]

GoodsReceiptItemSingleResponse = APIResponse[GoodsReceiptItemResponse]
GoodsReceiptItemListResponse = APIResponse[PaginatedResponse[GoodsReceiptItemResponse]]

PurchaseReturnSingleResponse = APIResponse[PurchaseReturnResponse]
PurchaseReturnListResponse = APIResponse[PaginatedResponse[PurchaseReturnResponse]]

PurchaseReturnItemSingleResponse = APIResponse[PurchaseReturnItemResponse]
PurchaseReturnItemListResponse = APIResponse[PaginatedResponse[PurchaseReturnItemResponse]]

SupplierPaymentSingleResponse = APIResponse[SupplierPaymentResponse]
SupplierPaymentListResponse = APIResponse[PaginatedResponse[SupplierPaymentResponse]]
