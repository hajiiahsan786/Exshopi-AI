from sqlalchemy import Boolean, CheckConstraint, Column, Date, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin

# Supplier Related Models
class SupplierCategory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "supplier_categories"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    suppliers = relationship("Supplier", back_populates="category")


class SupplierContact(UUIDMixin, AuditMixin, Base):
    __tablename__ = "supplier_contacts"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    first_name = Column(String(100), nullable=False, index=True)
    last_name = Column(String(100), nullable=False, index=True)
    email = Column(String(255), index=True)
    phone = Column(String(50), index=True)
    position = Column(String(100))
    is_primary = Column(Boolean, nullable=False, default=False)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    supplier = relationship("Supplier", back_populates="contacts")


class SupplierAddress(UUIDMixin, AuditMixin, Base):
    __tablename__ = "supplier_addresses"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    address_line1 = Column(String(255), nullable=False)
    address_line2 = Column(String(255))
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100))
    postal_code = Column(String(20))
    country = Column(String(100), nullable=False, index=True)
    address_type = Column(String(50), nullable=False, default="billing") # billing, shipping, physical
    is_primary = Column(Boolean, nullable=False, default=False)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    supplier = relationship("Supplier", back_populates="addresses")


class SupplierBankingInfo(UUIDMixin, AuditMixin, Base):
    __tablename__ = "supplier_banking_info"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    bank_name = Column(String(180), nullable=False, index=True)
    account_name = Column(String(180), nullable=False)
    account_number = Column(String(120), nullable=False, index=True)
    routing_number = Column(String(100))
    swift_code = Column(String(50))
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    supplier = relationship("Supplier", back_populates="banking_info")


class SupplierDocument(UUIDMixin, AuditMixin, Base):
    __tablename__ = "supplier_documents"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    document_type = Column(String(100), nullable=False, index=True) # W9, Contract, Certification
    document_url = Column(String(1000), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(Date)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    supplier = relationship("Supplier", back_populates="documents")


class SupplierRating(UUIDMixin, AuditMixin, Base):
    __tablename__ = "supplier_ratings"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    rater_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    quality_score = Column(Numeric(4, 2), default=0.0) # 0 to 5
    delivery_score = Column(Numeric(4, 2), default=0.0)
    cost_score = Column(Numeric(4, 2), default=0.0)
    service_score = Column(Numeric(4, 2), default=0.0)
    overall_score = Column(Numeric(4, 2), default=0.0)
    comments = Column(Text)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    supplier = relationship("Supplier", back_populates="ratings")
    rater = relationship("User", foreign_keys=[rater_id])


class SupplierPerformance(UUIDMixin, AuditMixin, Base):
    __tablename__ = "supplier_performance"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    evaluation_period = Column(String(100), nullable=False) # e.g. "2026-Q1", "Monthly"
    on_time_delivery_rate = Column(Numeric(5, 2), default=100.0) # percentage
    quality_pass_rate = Column(Numeric(5, 2), default=100.0)
    average_lead_time_days = Column(Numeric(6, 2), default=0.0)
    cost_savings_percent = Column(Numeric(5, 2), default=0.0)
    overall_performance_score = Column(Numeric(5, 2), default=100.0)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    supplier = relationship("Supplier", back_populates="performance_records")


# Purchase Requests (PR)
class PurchaseRequest(UUIDMixin, AuditMixin, Base):
    __tablename__ = "purchase_requests"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    priority = Column(String(50), nullable=False, default="medium", index=True) # low, medium, high, urgent
    status = Column(String(50), nullable=False, default="draft", index=True) # draft, pending_approval, approved, rejected, cancelled
    total_amount = Column(Numeric(14, 2), nullable=False, default=0.0)
    notes = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    department = relationship("Department")
    requester = relationship("User", foreign_keys=[requester_id])
    budget = relationship("Budget")
    items = relationship("PurchaseRequestItem", back_populates="purchase_request", cascade="all, delete-orphan")
    approvals = relationship("PurchaseRequestApproval", back_populates="purchase_request", cascade="all, delete-orphan")


class PurchaseRequestItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "purchase_request_items"

    id = Column(Integer, primary_key=True)
    purchase_request_id = Column(Integer, ForeignKey("purchase_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    estimated_unit_price = Column(Numeric(14, 2), nullable=False, default=0.0)
    total_price = Column(Numeric(14, 2), nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="pending")

    purchase_request = relationship("PurchaseRequest", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")


class PurchaseRequestApproval(UUIDMixin, AuditMixin, Base):
    __tablename__ = "purchase_request_approvals"

    id = Column(Integer, primary_key=True)
    purchase_request_id = Column(Integer, ForeignKey("purchase_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(50), nullable=False) # approved, rejected
    comments = Column(Text)
    approved_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), nullable=False, default="completed")

    purchase_request = relationship("PurchaseRequest", back_populates="approvals")
    approver = relationship("User", foreign_keys=[approver_id])


# RFQ (Request For Quotation)
class RFQ(UUIDMixin, AuditMixin, Base):
    __tablename__ = "rfqs"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    rfq_number = Column(String(80), nullable=False, unique=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="draft", index=True) # draft, sent, closed, awarded
    due_date = Column(DateTime(timezone=True), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    creator = relationship("User", foreign_keys=[created_by])
    items = relationship("RFQItem", back_populates="rfq", cascade="all, delete-orphan")
    suppliers = relationship("RFQSupplier", back_populates="rfq", cascade="all, delete-orphan")


class RFQItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "rfq_items"

    id = Column(Integer, primary_key=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="active")

    rfq = relationship("RFQ", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")
    response_items = relationship("RFQResponseItem", back_populates="rfq_item", cascade="all, delete-orphan")


class RFQSupplier(UUIDMixin, AuditMixin, Base):
    __tablename__ = "rfq_suppliers"

    id = Column(Integer, primary_key=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="invited") # invited, responded, won, lost
    total_bid = Column(Numeric(14, 2), default=0.0)
    submitted_at = Column(DateTime(timezone=True))
    notes = Column(Text)

    rfq = relationship("RFQ", back_populates="suppliers")
    supplier = relationship("Supplier")
    responses = relationship("RFQResponseItem", back_populates="rfq_supplier", cascade="all, delete-orphan")


class RFQResponseItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "rfq_response_items"

    id = Column(Integer, primary_key=True)
    rfq_supplier_id = Column(Integer, ForeignKey("rfq_suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    rfq_item_id = Column(Integer, ForeignKey("rfq_items.id", ondelete="CASCADE"), nullable=False, index=True)
    quoted_unit_price = Column(Numeric(14, 2), nullable=False, default=0.0)
    quoted_total_price = Column(Numeric(14, 2), nullable=False, default=0.0)
    delivery_lead_time_days = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="pending")

    rfq_supplier = relationship("RFQSupplier", back_populates="responses")
    rfq_item = relationship("RFQItem", back_populates="response_items")


# Purchase Orders (PO)
class PurchaseOrder(UUIDMixin, AuditMixin, Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False, index=True)
    purchase_request_id = Column(Integer, ForeignKey("purchase_requests.id"), nullable=True, index=True)
    po_number = Column(String(80), nullable=False, unique=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="draft", index=True) # draft, approved, sent, partially_received, completed, cancelled
    total_amount = Column(Numeric(14, 2), nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="USD")
    shipping_address = Column(Text)
    billing_address = Column(Text)
    delivery_date = Column(Date)
    notes = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    rfq = relationship("RFQ")
    supplier = relationship("Supplier")
    purchase_request = relationship("PurchaseRequest")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")
    approvals = relationship("PurchaseOrderApproval", back_populates="purchase_order", cascade="all, delete-orphan")


class PurchaseOrderItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    quantity = Column(Integer, nullable=False, default=1)
    received_quantity = Column(Integer, nullable=False, default=0)
    returned_quantity = Column(Integer, nullable=False, default=0)
    unit_price = Column(Numeric(14, 2), nullable=False, default=0.0)
    tax_rate = Column(Numeric(5, 2), default=0.0)
    tax_amount = Column(Numeric(14, 2), default=0.0)
    discount_amount = Column(Numeric(14, 2), default=0.0)
    total_amount = Column(Numeric(14, 2), nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="pending")

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")


class PurchaseOrderApproval(UUIDMixin, AuditMixin, Base):
    __tablename__ = "purchase_order_approvals"

    id = Column(Integer, primary_key=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id", ondelete="CASCADE"), nullable=False, index=True)
    approver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String(50), nullable=False) # approved, rejected
    comments = Column(Text)
    approved_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), nullable=False, default="completed")

    purchase_order = relationship("PurchaseOrder", back_populates="approvals")
    approver = relationship("User", foreign_keys=[approver_id])


# Goods Receiving / Goods Receipt Notes (GRN)
class GoodsReceiptNote(UUIDMixin, AuditMixin, Base):
    __tablename__ = "goods_receipt_notes"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    grn_number = Column(String(80), nullable=False, unique=True, index=True)
    received_by_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    received_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), nullable=False, default="draft", index=True) # draft, completed
    notes = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    purchase_order = relationship("PurchaseOrder")
    warehouse = relationship("Warehouse")
    received_by = relationship("User", foreign_keys=[received_by_id])
    items = relationship("GoodsReceiptItem", back_populates="goods_receipt_note", cascade="all, delete-orphan")


class GoodsReceiptItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "goods_receipt_items"

    id = Column(Integer, primary_key=True)
    goods_receipt_note_id = Column(Integer, ForeignKey("goods_receipt_notes.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    quantity_ordered = Column(Integer, nullable=False)
    quantity_received = Column(Integer, nullable=False)
    quantity_damaged = Column(Integer, nullable=False, default=0)
    batch_number = Column(String(100))
    serial_number = Column(String(100))
    quality_status = Column(String(50), nullable=False, default="passed") # passed, failed, partial
    inspection_notes = Column(Text)
    status = Column(String(50), nullable=False, default="active")

    goods_receipt_note = relationship("GoodsReceiptNote", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")


# Purchase Returns
class PurchaseReturn(UUIDMixin, AuditMixin, Base):
    __tablename__ = "purchase_returns"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True, index=True)
    goods_receipt_note_id = Column(Integer, ForeignKey("goods_receipt_notes.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    return_number = Column(String(80), nullable=False, unique=True, index=True)
    returned_by_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    returned_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(50), nullable=False, default="draft", index=True) # draft, completed
    total_refund_amount = Column(Numeric(14, 2), nullable=False, default=0.0)
    notes = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    purchase_order = relationship("PurchaseOrder")
    goods_receipt_note = relationship("GoodsReceiptNote")
    supplier = relationship("Supplier")
    warehouse = relationship("Warehouse")
    returned_by = relationship("User", foreign_keys=[returned_by_id])
    items = relationship("PurchaseReturnItem", back_populates="purchase_return", cascade="all, delete-orphan")


class PurchaseReturnItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "purchase_return_items"

    id = Column(Integer, primary_key=True)
    purchase_return_id = Column(Integer, ForeignKey("purchase_returns.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    quantity_returned = Column(Integer, nullable=False, default=1)
    refund_unit_price = Column(Numeric(14, 2), nullable=False, default=0.0)
    reason = Column(String(255))
    condition_type = Column(String(50), nullable=False, default="unused") # damaged, wrong_item, defective, unused
    status = Column(String(50), nullable=False, default="active")

    purchase_return = relationship("PurchaseReturn", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")


# Supplier Payments / Bills Tracker
class SupplierPayment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "supplier_payments"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    vendor_bill_id = Column(Integer, ForeignKey("vendor_bills.id"), nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False, index=True)
    payment_number = Column(String(80), nullable=False, unique=True, index=True)
    payment_method = Column(String(50), nullable=False, default="Manual", index=True)
    status = Column(String(50), nullable=False, default="pending", index=True) # pending, completed, failed
    amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    transaction_reference = Column(String(180), index=True)
    paid_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    vendor_bill = relationship("VendorBill")
    supplier = relationship("Supplier")
