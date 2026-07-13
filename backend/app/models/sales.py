from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, ForeignKey, Integer, JSON
from sqlalchemy import Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class SalesOrder(UUIDMixin, AuditMixin, Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=True, index=True)
    order_number = Column(String(80), nullable=False, unique=True)
    order_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    required_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="Pending", index=True)
    payment_status = Column(String(50), nullable=False, default="Pending", index=True)
    shipment_status = Column(String(50), nullable=False, default="Pending", index=True)
    currency = Column(String(10), nullable=False, default="USD")
    subtotal = Column(Numeric(14, 2), nullable=False, default=0)
    discount_total = Column(Numeric(14, 2), nullable=False, default=0)
    tax_total = Column(Numeric(14, 2), nullable=False, default=0)
    shipping_cost = Column(Numeric(14, 2), nullable=False, default=0)
    refund_total = Column(Numeric(14, 2), nullable=False, default=0)
    grand_total = Column(Numeric(14, 2), nullable=False, default=0)
    paid_amount = Column(Numeric(14, 2), nullable=False, default=0)
    outstanding_balance = Column(Numeric(14, 2), nullable=False, default=0)
    billing_address = Column(Text)
    shipping_address = Column(Text)
    notes = Column(Text)
    tags = Column(JSON, nullable=False, default=list)
    extra_data = Column(JSON, nullable=False, default=dict)

    organization = relationship("Organization")
    company = relationship("Company")
    customer = relationship("Customer")
    quote = relationship("Quote", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    notes_entries = relationship("OrderNote", back_populates="order", cascade="all, delete-orphan")
    timeline = relationship("OrderTimeline", back_populates="order", cascade="all, delete-orphan")
    history = relationship("OrderHistory", back_populates="order", cascade="all, delete-orphan")
    attachments = relationship("OrderAttachment", back_populates="order", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="order")
    payments = relationship("Payment", back_populates="order")
    shipments = relationship("Shipment", back_populates="order")

    __table_args__ = (
        CheckConstraint("subtotal >= 0", name="ck_sales_orders_subtotal_positive"),
        CheckConstraint("discount_total >= 0", name="ck_sales_orders_discount_positive"),
        CheckConstraint("tax_total >= 0", name="ck_sales_orders_tax_positive"),
        CheckConstraint("shipping_cost >= 0", name="ck_sales_orders_shipping_positive"),
        CheckConstraint("refund_total >= 0", name="ck_sales_orders_refund_positive"),
        CheckConstraint("grand_total >= 0", name="ck_sales_orders_grand_total_positive"),
        CheckConstraint("paid_amount >= 0", name="ck_sales_orders_paid_positive"),
        CheckConstraint("outstanding_balance >= 0", name="ck_sales_orders_balance_positive"),
    )


class OrderItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    sku = Column(String(80), nullable=True, index=True)
    name = Column(String(220), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(14, 2), nullable=False)
    discount_amount = Column(Numeric(14, 2), nullable=False, default=0)
    tax_amount = Column(Numeric(14, 2), nullable=False, default=0)
    line_total = Column(Numeric(14, 2), nullable=False, default=0)
    stock_status = Column(String(50), nullable=False, default="pending", index=True)
    notes = Column(Text)

    order = relationship("SalesOrder", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")
    warehouse = relationship("Warehouse")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_order_items_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="ck_order_items_unit_price_positive"),
        CheckConstraint("discount_amount >= 0", name="ck_order_items_discount_positive"),
        CheckConstraint("tax_amount >= 0", name="ck_order_items_tax_positive"),
        CheckConstraint("line_total >= 0", name="ck_order_items_line_total_positive"),
    )


class OrderNote(UUIDMixin, AuditMixin, Base):
    __tablename__ = "order_notes"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    note_type = Column(String(50), nullable=False, default="internal", index=True)
    body = Column(Text, nullable=False)
    is_internal = Column(Boolean, nullable=False, default=True, index=True)

    order = relationship("SalesOrder", back_populates="notes_entries")


class OrderTimeline(UUIDMixin, AuditMixin, Base):
    __tablename__ = "order_timeline"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    event_type = Column(String(80), nullable=False, index=True)
    title = Column(String(180), nullable=False)
    description = Column(Text)
    payload = Column(JSON, nullable=False, default=dict)
    occurred_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    order = relationship("SalesOrder", back_populates="timeline")


class OrderHistory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "order_history"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False, index=True)
    old_value = Column(Text)
    new_value = Column(Text)
    changed_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    order = relationship("SalesOrder", back_populates="history")
    changer = relationship("User", foreign_keys=[changed_by])


class OrderAttachment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "order_attachments"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(1000), nullable=False)
    content_type = Column(String(120))
    size_bytes = Column(Integer, nullable=False, default=0)
    description = Column(Text)

    order = relationship("SalesOrder", back_populates="attachments")

    __table_args__ = (CheckConstraint("size_bytes >= 0", name="ck_order_attachments_size_positive"),)


class Quote(UUIDMixin, AuditMixin, Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    quote_number = Column(String(80), nullable=False, unique=True)
    quote_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    valid_until = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="Draft", index=True)
    currency = Column(String(10), nullable=False, default="USD")
    subtotal = Column(Numeric(14, 2), nullable=False, default=0)
    discount_total = Column(Numeric(14, 2), nullable=False, default=0)
    tax_total = Column(Numeric(14, 2), nullable=False, default=0)
    shipping_cost = Column(Numeric(14, 2), nullable=False, default=0)
    grand_total = Column(Numeric(14, 2), nullable=False, default=0)
    notes = Column(Text)
    terms = Column(Text)
    extra_data = Column(JSON, nullable=False, default=dict)

    organization = relationship("Organization")
    company = relationship("Company")
    customer = relationship("Customer")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")
    versions = relationship("QuoteVersion", back_populates="quote", cascade="all, delete-orphan")
    approvals = relationship("QuoteApproval", back_populates="quote", cascade="all, delete-orphan")
    orders = relationship("SalesOrder", back_populates="quote")

    __table_args__ = (
        CheckConstraint("subtotal >= 0", name="ck_quotes_subtotal_positive"),
        CheckConstraint("discount_total >= 0", name="ck_quotes_discount_positive"),
        CheckConstraint("tax_total >= 0", name="ck_quotes_tax_positive"),
        CheckConstraint("shipping_cost >= 0", name="ck_quotes_shipping_positive"),
        CheckConstraint("grand_total >= 0", name="ck_quotes_grand_total_positive"),
    )


class QuoteItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "quote_items"

    id = Column(Integer, primary_key=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True, index=True)
    sku = Column(String(80), nullable=True, index=True)
    name = Column(String(220), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(14, 2), nullable=False)
    discount_amount = Column(Numeric(14, 2), nullable=False, default=0)
    tax_amount = Column(Numeric(14, 2), nullable=False, default=0)
    line_total = Column(Numeric(14, 2), nullable=False, default=0)

    quote = relationship("Quote", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")
    warehouse = relationship("Warehouse")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_quote_items_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="ck_quote_items_unit_price_positive"),
        CheckConstraint("discount_amount >= 0", name="ck_quote_items_discount_positive"),
        CheckConstraint("tax_amount >= 0", name="ck_quote_items_tax_positive"),
        CheckConstraint("line_total >= 0", name="ck_quote_items_line_total_positive"),
    )


class QuoteVersion(UUIDMixin, AuditMixin, Base):
    __tablename__ = "quote_versions"

    id = Column(Integer, primary_key=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    snapshot = Column(JSON, nullable=False, default=dict)

    quote = relationship("Quote", back_populates="versions")

    __table_args__ = (
        UniqueConstraint("quote_id", "version_number", name="uq_quote_versions_quote_version"),
        CheckConstraint("version_number > 0", name="ck_quote_versions_version_positive"),
    )


class QuoteApproval(UUIDMixin, AuditMixin, Base):
    __tablename__ = "quote_approvals"

    id = Column(Integer, primary_key=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="Pending", index=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    approved_at = Column(DateTime(timezone=True), nullable=True, index=True)
    notes = Column(Text)

    quote = relationship("Quote", back_populates="approvals")
    approver = relationship("User", foreign_keys=[approved_by])


class Invoice(UUIDMixin, AuditMixin, Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=True, index=True)
    invoice_number = Column(String(80), nullable=False, unique=True)
    invoice_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="Draft", index=True)
    payment_status = Column(String(50), nullable=False, default="Pending", index=True)
    currency = Column(String(10), nullable=False, default="USD")
    subtotal = Column(Numeric(14, 2), nullable=False, default=0)
    discount_total = Column(Numeric(14, 2), nullable=False, default=0)
    tax_total = Column(Numeric(14, 2), nullable=False, default=0)
    shipping_cost = Column(Numeric(14, 2), nullable=False, default=0)
    refund_total = Column(Numeric(14, 2), nullable=False, default=0)
    grand_total = Column(Numeric(14, 2), nullable=False, default=0)
    paid_amount = Column(Numeric(14, 2), nullable=False, default=0)
    outstanding_balance = Column(Numeric(14, 2), nullable=False, default=0)
    notes = Column(Text)
    extra_data = Column(JSON, nullable=False, default=dict)

    organization = relationship("Organization")
    company = relationship("Company")
    customer = relationship("Customer")
    order = relationship("SalesOrder", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    payments = relationship("InvoicePayment", back_populates="invoice", cascade="all, delete-orphan")
    direct_payments = relationship("Payment", back_populates="invoice")

    __table_args__ = (
        CheckConstraint("subtotal >= 0", name="ck_invoices_subtotal_positive"),
        CheckConstraint("discount_total >= 0", name="ck_invoices_discount_positive"),
        CheckConstraint("tax_total >= 0", name="ck_invoices_tax_positive"),
        CheckConstraint("shipping_cost >= 0", name="ck_invoices_shipping_positive"),
        CheckConstraint("refund_total >= 0", name="ck_invoices_refund_positive"),
        CheckConstraint("grand_total >= 0", name="ck_invoices_grand_total_positive"),
        CheckConstraint("paid_amount >= 0", name="ck_invoices_paid_positive"),
        CheckConstraint("outstanding_balance >= 0", name="ck_invoices_balance_positive"),
    )


class InvoiceItem(UUIDMixin, AuditMixin, Base):
    __tablename__ = "invoice_items"

    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False, index=True)
    order_item_id = Column(Integer, ForeignKey("order_items.id"), nullable=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    sku = Column(String(80), nullable=True, index=True)
    name = Column(String(220), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(14, 2), nullable=False)
    discount_amount = Column(Numeric(14, 2), nullable=False, default=0)
    tax_amount = Column(Numeric(14, 2), nullable=False, default=0)
    line_total = Column(Numeric(14, 2), nullable=False, default=0)

    invoice = relationship("Invoice", back_populates="items")
    order_item = relationship("OrderItem")
    product = relationship("Product")
    variant = relationship("ProductVariant")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_invoice_items_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="ck_invoice_items_unit_price_positive"),
        CheckConstraint("discount_amount >= 0", name="ck_invoice_items_discount_positive"),
        CheckConstraint("tax_amount >= 0", name="ck_invoice_items_tax_positive"),
        CheckConstraint("line_total >= 0", name="ck_invoice_items_line_total_positive"),
    )


class InvoicePayment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "invoice_payments"

    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False, index=True)
    amount = Column(Numeric(14, 2), nullable=False)
    applied_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    invoice = relationship("Invoice", back_populates="payments")
    payment = relationship("Payment", back_populates="invoice_links")

    __table_args__ = (
        UniqueConstraint("invoice_id", "payment_id", name="uq_invoice_payments_invoice_payment"),
        CheckConstraint("amount > 0", name="ck_invoice_payments_amount_positive"),
    )


class Payment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True, index=True)
    payment_number = Column(String(80), nullable=False, unique=True)
    payment_method = Column(String(50), nullable=False, default="Manual", index=True)
    status = Column(String(50), nullable=False, default="Pending", index=True)
    amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    transaction_reference = Column(String(180), nullable=True, index=True)
    provider = Column(String(80), nullable=True, index=True)
    paid_at = Column(DateTime(timezone=True), nullable=True, index=True)
    notes = Column(Text)
    extra_data = Column(JSON, nullable=False, default=dict)

    organization = relationship("Organization")
    company = relationship("Company")
    customer = relationship("Customer")
    order = relationship("SalesOrder", back_populates="payments")
    invoice = relationship("Invoice", back_populates="direct_payments")
    invoice_links = relationship("InvoicePayment", back_populates="payment", cascade="all, delete-orphan")

    __table_args__ = (CheckConstraint("amount >= 0", name="ck_payments_amount_positive"),)


class Discount(UUIDMixin, AuditMixin, Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    code = Column(String(80), nullable=True, unique=True)
    discount_type = Column(String(50), nullable=False, index=True)
    value = Column(Numeric(14, 2), nullable=False)
    starts_at = Column(DateTime(timezone=True), nullable=True, index=True)
    ends_at = Column(DateTime(timezone=True), nullable=True, index=True)
    usage_limit = Column(Integer, nullable=True)
    used_count = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active", index=True)
    description = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")

    __table_args__ = (
        CheckConstraint("value >= 0", name="ck_discounts_value_positive"),
        CheckConstraint("usage_limit IS NULL OR usage_limit >= 0", name="ck_discounts_usage_limit_positive"),
        CheckConstraint("used_count >= 0", name="ck_discounts_used_count_positive"),
    )


class Tax(UUIDMixin, AuditMixin, Base):
    __tablename__ = "taxes"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    tax_type = Column(String(50), nullable=False, index=True)
    country = Column(String(100), nullable=True, index=True)
    region = Column(String(100), nullable=True)
    rate = Column(Numeric(6, 3), nullable=False)
    status = Column(String(50), nullable=False, default="active", index=True)
    description = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")

    __table_args__ = (
        UniqueConstraint("organization_id", "company_id", "name", "country", name="uq_taxes_scope_name_country"),
        CheckConstraint("rate >= 0", name="ck_taxes_rate_positive"),
    )


class ShippingMethod(UUIDMixin, AuditMixin, Base):
    __tablename__ = "shipping_methods"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    courier = Column(String(120), nullable=True, index=True)
    service_level = Column(String(120), nullable=True)
    base_rate = Column(Numeric(14, 2), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active", index=True)
    description = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    shipments = relationship("Shipment", back_populates="shipping_method")

    __table_args__ = (CheckConstraint("base_rate >= 0", name="ck_shipping_methods_base_rate_positive"),)


class Shipment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    shipping_method_id = Column(Integer, ForeignKey("shipping_methods.id"), nullable=True, index=True)
    shipment_number = Column(String(80), nullable=False, unique=True)
    tracking_number = Column(String(180), nullable=True, unique=True)
    courier = Column(String(120), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="Pending", index=True)
    shipping_cost = Column(Numeric(14, 2), nullable=False, default=0)
    shipped_at = Column(DateTime(timezone=True), nullable=True, index=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True, index=True)
    notes = Column(Text)
    extra_data = Column(JSON, nullable=False, default=dict)

    organization = relationship("Organization")
    company = relationship("Company")
    order = relationship("SalesOrder", back_populates="shipments")
    shipping_method = relationship("ShippingMethod", back_populates="shipments")

    __table_args__ = (CheckConstraint("shipping_cost >= 0", name="ck_shipments_shipping_cost_positive"),)
