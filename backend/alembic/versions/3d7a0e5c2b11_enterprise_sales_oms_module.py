"""Enterprise sales and order management module

Revision ID: 3d7a0e5c2b11
Revises: 2f4a8c9d1b30
Create Date: 2026-07-13 23:05:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "3d7a0e5c2b11"
down_revision: Union[str, Sequence[str], None] = "2f4a8c9d1b30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


SALES_PERMISSIONS = [
    "orders.create",
    "orders.read",
    "orders.update",
    "orders.delete",
    "orders.manage",
    "orders.*",
    "quotes.create",
    "quotes.read",
    "quotes.update",
    "quotes.delete",
    "quotes.manage",
    "quotes.*",
    "invoices.create",
    "invoices.read",
    "invoices.update",
    "invoices.delete",
    "invoices.manage",
    "invoices.*",
    "payments.create",
    "payments.read",
    "payments.update",
    "payments.delete",
    "payments.manage",
    "payments.*",
    "shipments.create",
    "shipments.read",
    "shipments.update",
    "shipments.delete",
    "shipments.manage",
    "shipments.*",
    "sales.create",
    "sales.read",
    "sales.update",
    "sales.delete",
    "sales.manage",
    "sales.*",
]


def uuid_column() -> sa.Column:
    return sa.Column("uuid", sa.String(length=36), nullable=False)


def audit_columns() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.Column("deleted_by", sa.Integer(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def audit_fks(table_name: str) -> list[sa.ForeignKeyConstraint]:
    return [
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], name=f"fk_{table_name}_created_by_users"),
        sa.ForeignKeyConstraint(["updated_by"], ["users.id"], name=f"fk_{table_name}_updated_by_users"),
        sa.ForeignKeyConstraint(["deleted_by"], ["users.id"], name=f"fk_{table_name}_deleted_by_users"),
    ]


def create_audit_indexes(table_name: str) -> None:
    op.create_index(f"ix_{table_name}_created_at", table_name, ["created_at"])
    op.create_index(f"ix_{table_name}_deleted_at", table_name, ["deleted_at"])
    op.create_index(f"ix_{table_name}_uuid", table_name, ["uuid"], unique=True)


def drop_audit_indexes(table_name: str) -> None:
    op.drop_index(f"ix_{table_name}_uuid", table_name=table_name)
    op.drop_index(f"ix_{table_name}_deleted_at", table_name=table_name)
    op.drop_index(f"ix_{table_name}_created_at", table_name=table_name)


def totals_columns(include_payment: bool = False) -> list[sa.Column]:
    columns = [
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("subtotal", sa.Numeric(14, 2), nullable=False),
        sa.Column("discount_total", sa.Numeric(14, 2), nullable=False),
        sa.Column("tax_total", sa.Numeric(14, 2), nullable=False),
        sa.Column("shipping_cost", sa.Numeric(14, 2), nullable=False),
        sa.Column("grand_total", sa.Numeric(14, 2), nullable=False),
    ]
    if include_payment:
        columns.extend(
            [
                sa.Column("refund_total", sa.Numeric(14, 2), nullable=False),
                sa.Column("paid_amount", sa.Numeric(14, 2), nullable=False),
                sa.Column("outstanding_balance", sa.Numeric(14, 2), nullable=False),
            ]
        )
    return columns


def totals_checks(table_name: str, include_payment: bool = False) -> list[sa.CheckConstraint]:
    checks = [
        sa.CheckConstraint("subtotal >= 0", name=f"ck_{table_name}_subtotal_positive"),
        sa.CheckConstraint("discount_total >= 0", name=f"ck_{table_name}_discount_positive"),
        sa.CheckConstraint("tax_total >= 0", name=f"ck_{table_name}_tax_positive"),
        sa.CheckConstraint("shipping_cost >= 0", name=f"ck_{table_name}_shipping_positive"),
        sa.CheckConstraint("grand_total >= 0", name=f"ck_{table_name}_grand_total_positive"),
    ]
    if include_payment:
        checks.extend(
            [
                sa.CheckConstraint("refund_total >= 0", name=f"ck_{table_name}_refund_positive"),
                sa.CheckConstraint("paid_amount >= 0", name=f"ck_{table_name}_paid_positive"),
                sa.CheckConstraint("outstanding_balance >= 0", name=f"ck_{table_name}_balance_positive"),
            ]
        )
    return checks


def line_columns(parent_column: str) -> list[sa.Column]:
    return [
        sa.Column(parent_column, sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("variant_id", sa.Integer(), nullable=True),
        sa.Column("sku", sa.String(length=80), nullable=True),
        sa.Column("name", sa.String(length=220), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(14, 2), nullable=False),
        sa.Column("discount_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("tax_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("line_total", sa.Numeric(14, 2), nullable=False),
    ]


def line_checks(table_name: str) -> list[sa.CheckConstraint]:
    return [
        sa.CheckConstraint("quantity > 0", name=f"ck_{table_name}_quantity_positive"),
        sa.CheckConstraint("unit_price >= 0", name=f"ck_{table_name}_unit_price_positive"),
        sa.CheckConstraint("discount_amount >= 0", name=f"ck_{table_name}_discount_positive"),
        sa.CheckConstraint("tax_amount >= 0", name=f"ck_{table_name}_tax_positive"),
        sa.CheckConstraint("line_total >= 0", name=f"ck_{table_name}_line_total_positive"),
    ]


def scoped_columns(require_customer: bool = True) -> list[sa.Column]:
    columns = [
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=True),
    ]
    if require_customer:
        columns.append(sa.Column("customer_id", sa.Integer(), nullable=False))
    return columns


def scoped_fks(table_name: str, require_customer: bool = True) -> list[sa.ForeignKeyConstraint]:
    fks = [
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], name=f"fk_{table_name}_organization_id"),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], name=f"fk_{table_name}_company_id"),
    ]
    if require_customer:
        fks.append(sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], name=f"fk_{table_name}_customer_id"))
    return fks


def scoped_indexes(table_name: str, require_customer: bool = True) -> None:
    op.create_index(f"ix_{table_name}_organization_id", table_name, ["organization_id"])
    op.create_index(f"ix_{table_name}_company_id", table_name, ["company_id"])
    if require_customer:
        op.create_index(f"ix_{table_name}_customer_id", table_name, ["customer_id"])


def drop_scoped_indexes(table_name: str, require_customer: bool = True) -> None:
    if require_customer:
        op.drop_index(f"ix_{table_name}_customer_id", table_name=table_name)
    op.drop_index(f"ix_{table_name}_company_id", table_name=table_name)
    op.drop_index(f"ix_{table_name}_organization_id", table_name=table_name)


def upgrade() -> None:
    op.create_table(
        "quotes",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *scoped_columns(),
        sa.Column("quote_number", sa.String(length=80), nullable=False),
        sa.Column("quote_date", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        *totals_columns(),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("terms", sa.Text(), nullable=True),
        sa.Column("extra_data", sa.JSON(), nullable=False),
        *audit_columns(),
        *totals_checks("quotes"),
        *scoped_fks("quotes"),
        *audit_fks("quotes"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("quote_number", name="uq_quotes_quote_number"),
        sa.UniqueConstraint("uuid", name="uq_quotes_uuid"),
    )
    scoped_indexes("quotes")
    op.create_index("ix_quotes_id", "quotes", ["id"])
    op.create_index("ix_quotes_quote_number", "quotes", ["quote_number"], unique=True)
    op.create_index("ix_quotes_quote_date", "quotes", ["quote_date"])
    op.create_index("ix_quotes_status", "quotes", ["status"])
    create_audit_indexes("quotes")

    op.create_table(
        "sales_orders",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *scoped_columns(),
        sa.Column("quote_id", sa.Integer(), nullable=True),
        sa.Column("order_number", sa.String(length=80), nullable=False),
        sa.Column("order_date", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("required_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("payment_status", sa.String(length=50), nullable=False),
        sa.Column("shipment_status", sa.String(length=50), nullable=False),
        *totals_columns(include_payment=True),
        sa.Column("billing_address", sa.Text(), nullable=True),
        sa.Column("shipping_address", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("extra_data", sa.JSON(), nullable=False),
        *audit_columns(),
        *totals_checks("sales_orders", include_payment=True),
        *scoped_fks("sales_orders"),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], name="fk_sales_orders_quote_id"),
        *audit_fks("sales_orders"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("order_number", name="uq_sales_orders_order_number"),
        sa.UniqueConstraint("uuid", name="uq_sales_orders_uuid"),
    )
    scoped_indexes("sales_orders")
    op.create_index("ix_sales_orders_id", "sales_orders", ["id"])
    op.create_index("ix_sales_orders_quote_id", "sales_orders", ["quote_id"])
    op.create_index("ix_sales_orders_order_number", "sales_orders", ["order_number"], unique=True)
    op.create_index("ix_sales_orders_order_date", "sales_orders", ["order_date"])
    op.create_index("ix_sales_orders_status", "sales_orders", ["status"])
    op.create_index("ix_sales_orders_payment_status", "sales_orders", ["payment_status"])
    op.create_index("ix_sales_orders_shipment_status", "sales_orders", ["shipment_status"])
    create_audit_indexes("sales_orders")

    op.create_table(
        "quote_items",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *line_columns("quote_id"),
        sa.Column("warehouse_id", sa.Integer(), nullable=True),
        *audit_columns(),
        *line_checks("quote_items"),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], name="fk_quote_items_quote_id"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_quote_items_product_id"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], name="fk_quote_items_variant_id"),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"], name="fk_quote_items_warehouse_id"),
        *audit_fks("quote_items"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_quote_items_uuid"),
    )
    op.create_index("ix_quote_items_id", "quote_items", ["id"])
    op.create_index("ix_quote_items_quote_id", "quote_items", ["quote_id"])
    op.create_index("ix_quote_items_product_id", "quote_items", ["product_id"])
    op.create_index("ix_quote_items_variant_id", "quote_items", ["variant_id"])
    op.create_index("ix_quote_items_warehouse_id", "quote_items", ["warehouse_id"])
    op.create_index("ix_quote_items_sku", "quote_items", ["sku"])
    create_audit_indexes("quote_items")

    op.create_table(
        "quote_versions",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("quote_id", sa.Integer(), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("snapshot", sa.JSON(), nullable=False),
        *audit_columns(),
        sa.CheckConstraint("version_number > 0", name="ck_quote_versions_version_positive"),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], name="fk_quote_versions_quote_id"),
        *audit_fks("quote_versions"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("quote_id", "version_number", name="uq_quote_versions_quote_version"),
        sa.UniqueConstraint("uuid", name="uq_quote_versions_uuid"),
    )
    op.create_index("ix_quote_versions_id", "quote_versions", ["id"])
    op.create_index("ix_quote_versions_quote_id", "quote_versions", ["quote_id"])
    create_audit_indexes("quote_versions")

    op.create_table(
        "quote_approvals",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("quote_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("approved_by", sa.Integer(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *audit_columns(),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], name="fk_quote_approvals_quote_id"),
        sa.ForeignKeyConstraint(["approved_by"], ["users.id"], name="fk_quote_approvals_approved_by"),
        *audit_fks("quote_approvals"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_quote_approvals_uuid"),
    )
    op.create_index("ix_quote_approvals_id", "quote_approvals", ["id"])
    op.create_index("ix_quote_approvals_quote_id", "quote_approvals", ["quote_id"])
    op.create_index("ix_quote_approvals_status", "quote_approvals", ["status"])
    op.create_index("ix_quote_approvals_approved_by", "quote_approvals", ["approved_by"])
    op.create_index("ix_quote_approvals_approved_at", "quote_approvals", ["approved_at"])
    create_audit_indexes("quote_approvals")

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *line_columns("order_id"),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("stock_status", sa.String(length=50), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        *audit_columns(),
        *line_checks("order_items"),
        sa.ForeignKeyConstraint(["order_id"], ["sales_orders.id"], name="fk_order_items_order_id"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_order_items_product_id"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], name="fk_order_items_variant_id"),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"], name="fk_order_items_warehouse_id"),
        *audit_fks("order_items"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_order_items_uuid"),
    )
    op.create_index("ix_order_items_id", "order_items", ["id"])
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"])
    op.create_index("ix_order_items_variant_id", "order_items", ["variant_id"])
    op.create_index("ix_order_items_warehouse_id", "order_items", ["warehouse_id"])
    op.create_index("ix_order_items_sku", "order_items", ["sku"])
    op.create_index("ix_order_items_stock_status", "order_items", ["stock_status"])
    create_audit_indexes("order_items")

    op.create_table(
        "order_notes",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("note_type", sa.String(length=50), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("is_internal", sa.Boolean(), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(["order_id"], ["sales_orders.id"], name="fk_order_notes_order_id"),
        *audit_fks("order_notes"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_order_notes_uuid"),
    )
    op.create_index("ix_order_notes_id", "order_notes", ["id"])
    op.create_index("ix_order_notes_order_id", "order_notes", ["order_id"])
    op.create_index("ix_order_notes_note_type", "order_notes", ["note_type"])
    op.create_index("ix_order_notes_is_internal", "order_notes", ["is_internal"])
    create_audit_indexes("order_notes")

    op.create_table(
        "order_timeline",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("event_type", sa.String(length=80), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(["order_id"], ["sales_orders.id"], name="fk_order_timeline_order_id"),
        *audit_fks("order_timeline"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_order_timeline_uuid"),
    )
    op.create_index("ix_order_timeline_id", "order_timeline", ["id"])
    op.create_index("ix_order_timeline_order_id", "order_timeline", ["order_id"])
    op.create_index("ix_order_timeline_event_type", "order_timeline", ["event_type"])
    op.create_index("ix_order_timeline_occurred_at", "order_timeline", ["occurred_at"])
    create_audit_indexes("order_timeline")

    op.create_table(
        "order_history",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("field_name", sa.String(length=100), nullable=False),
        sa.Column("old_value", sa.Text(), nullable=True),
        sa.Column("new_value", sa.Text(), nullable=True),
        sa.Column("changed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("changed_by", sa.Integer(), nullable=True),
        *audit_columns(),
        sa.ForeignKeyConstraint(["order_id"], ["sales_orders.id"], name="fk_order_history_order_id"),
        sa.ForeignKeyConstraint(["changed_by"], ["users.id"], name="fk_order_history_changed_by"),
        *audit_fks("order_history"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_order_history_uuid"),
    )
    op.create_index("ix_order_history_id", "order_history", ["id"])
    op.create_index("ix_order_history_order_id", "order_history", ["order_id"])
    op.create_index("ix_order_history_field_name", "order_history", ["field_name"])
    op.create_index("ix_order_history_changed_at", "order_history", ["changed_at"])
    op.create_index("ix_order_history_changed_by", "order_history", ["changed_by"])
    create_audit_indexes("order_history")

    op.create_table(
        "order_attachments",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_url", sa.String(length=1000), nullable=False),
        sa.Column("content_type", sa.String(length=120), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        *audit_columns(),
        sa.CheckConstraint("size_bytes >= 0", name="ck_order_attachments_size_positive"),
        sa.ForeignKeyConstraint(["order_id"], ["sales_orders.id"], name="fk_order_attachments_order_id"),
        *audit_fks("order_attachments"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_order_attachments_uuid"),
    )
    op.create_index("ix_order_attachments_id", "order_attachments", ["id"])
    op.create_index("ix_order_attachments_order_id", "order_attachments", ["order_id"])
    create_audit_indexes("order_attachments")

    op.create_table(
        "invoices",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *scoped_columns(),
        sa.Column("order_id", sa.Integer(), nullable=True),
        sa.Column("invoice_number", sa.String(length=80), nullable=False),
        sa.Column("invoice_date", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("payment_status", sa.String(length=50), nullable=False),
        *totals_columns(include_payment=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("extra_data", sa.JSON(), nullable=False),
        *audit_columns(),
        *totals_checks("invoices", include_payment=True),
        *scoped_fks("invoices"),
        sa.ForeignKeyConstraint(["order_id"], ["sales_orders.id"], name="fk_invoices_order_id"),
        *audit_fks("invoices"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("invoice_number", name="uq_invoices_invoice_number"),
        sa.UniqueConstraint("uuid", name="uq_invoices_uuid"),
    )
    scoped_indexes("invoices")
    op.create_index("ix_invoices_id", "invoices", ["id"])
    op.create_index("ix_invoices_order_id", "invoices", ["order_id"])
    op.create_index("ix_invoices_invoice_number", "invoices", ["invoice_number"], unique=True)
    op.create_index("ix_invoices_invoice_date", "invoices", ["invoice_date"])
    op.create_index("ix_invoices_due_date", "invoices", ["due_date"])
    op.create_index("ix_invoices_status", "invoices", ["status"])
    op.create_index("ix_invoices_payment_status", "invoices", ["payment_status"])
    create_audit_indexes("invoices")

    op.create_table(
        "invoice_items",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *line_columns("invoice_id"),
        sa.Column("order_item_id", sa.Integer(), nullable=True),
        *audit_columns(),
        *line_checks("invoice_items"),
        sa.ForeignKeyConstraint(["invoice_id"], ["invoices.id"], name="fk_invoice_items_invoice_id"),
        sa.ForeignKeyConstraint(["order_item_id"], ["order_items.id"], name="fk_invoice_items_order_item_id"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_invoice_items_product_id"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], name="fk_invoice_items_variant_id"),
        *audit_fks("invoice_items"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_invoice_items_uuid"),
    )
    op.create_index("ix_invoice_items_id", "invoice_items", ["id"])
    op.create_index("ix_invoice_items_invoice_id", "invoice_items", ["invoice_id"])
    op.create_index("ix_invoice_items_order_item_id", "invoice_items", ["order_item_id"])
    op.create_index("ix_invoice_items_product_id", "invoice_items", ["product_id"])
    op.create_index("ix_invoice_items_variant_id", "invoice_items", ["variant_id"])
    op.create_index("ix_invoice_items_sku", "invoice_items", ["sku"])
    create_audit_indexes("invoice_items")

    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *scoped_columns(),
        sa.Column("order_id", sa.Integer(), nullable=True),
        sa.Column("invoice_id", sa.Integer(), nullable=True),
        sa.Column("payment_number", sa.String(length=80), nullable=False),
        sa.Column("payment_method", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("transaction_reference", sa.String(length=180), nullable=True),
        sa.Column("provider", sa.String(length=80), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("extra_data", sa.JSON(), nullable=False),
        *audit_columns(),
        sa.CheckConstraint("amount >= 0", name="ck_payments_amount_positive"),
        *scoped_fks("payments"),
        sa.ForeignKeyConstraint(["order_id"], ["sales_orders.id"], name="fk_payments_order_id"),
        sa.ForeignKeyConstraint(["invoice_id"], ["invoices.id"], name="fk_payments_invoice_id"),
        *audit_fks("payments"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("payment_number", name="uq_payments_payment_number"),
        sa.UniqueConstraint("uuid", name="uq_payments_uuid"),
    )
    scoped_indexes("payments")
    op.create_index("ix_payments_id", "payments", ["id"])
    op.create_index("ix_payments_order_id", "payments", ["order_id"])
    op.create_index("ix_payments_invoice_id", "payments", ["invoice_id"])
    op.create_index("ix_payments_payment_number", "payments", ["payment_number"], unique=True)
    op.create_index("ix_payments_payment_method", "payments", ["payment_method"])
    op.create_index("ix_payments_status", "payments", ["status"])
    op.create_index("ix_payments_transaction_reference", "payments", ["transaction_reference"])
    op.create_index("ix_payments_provider", "payments", ["provider"])
    op.create_index("ix_payments_paid_at", "payments", ["paid_at"])
    create_audit_indexes("payments")

    op.create_table(
        "invoice_payments",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("invoice_id", sa.Integer(), nullable=False),
        sa.Column("payment_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("applied_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        *audit_columns(),
        sa.CheckConstraint("amount > 0", name="ck_invoice_payments_amount_positive"),
        sa.ForeignKeyConstraint(["invoice_id"], ["invoices.id"], name="fk_invoice_payments_invoice_id"),
        sa.ForeignKeyConstraint(["payment_id"], ["payments.id"], name="fk_invoice_payments_payment_id"),
        *audit_fks("invoice_payments"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("invoice_id", "payment_id", name="uq_invoice_payments_invoice_payment"),
        sa.UniqueConstraint("uuid", name="uq_invoice_payments_uuid"),
    )
    op.create_index("ix_invoice_payments_id", "invoice_payments", ["id"])
    op.create_index("ix_invoice_payments_invoice_id", "invoice_payments", ["invoice_id"])
    op.create_index("ix_invoice_payments_payment_id", "invoice_payments", ["payment_id"])
    op.create_index("ix_invoice_payments_applied_at", "invoice_payments", ["applied_at"])
    create_audit_indexes("invoice_payments")

    op.create_table(
        "discounts",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *scoped_columns(require_customer=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("code", sa.String(length=80), nullable=True),
        sa.Column("discount_type", sa.String(length=50), nullable=False),
        sa.Column("value", sa.Numeric(14, 2), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("usage_limit", sa.Integer(), nullable=True),
        sa.Column("used_count", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        *audit_columns(),
        sa.CheckConstraint("value >= 0", name="ck_discounts_value_positive"),
        sa.CheckConstraint("usage_limit IS NULL OR usage_limit >= 0", name="ck_discounts_usage_limit_positive"),
        sa.CheckConstraint("used_count >= 0", name="ck_discounts_used_count_positive"),
        *scoped_fks("discounts", require_customer=False),
        *audit_fks("discounts"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code", name="uq_discounts_code"),
        sa.UniqueConstraint("uuid", name="uq_discounts_uuid"),
    )
    scoped_indexes("discounts", require_customer=False)
    op.create_index("ix_discounts_id", "discounts", ["id"])
    op.create_index("ix_discounts_name", "discounts", ["name"])
    op.create_index("ix_discounts_code", "discounts", ["code"], unique=True)
    op.create_index("ix_discounts_discount_type", "discounts", ["discount_type"])
    op.create_index("ix_discounts_status", "discounts", ["status"])
    create_audit_indexes("discounts")

    op.create_table(
        "taxes",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *scoped_columns(require_customer=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("tax_type", sa.String(length=50), nullable=False),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("region", sa.String(length=100), nullable=True),
        sa.Column("rate", sa.Numeric(6, 3), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        *audit_columns(),
        sa.CheckConstraint("rate >= 0", name="ck_taxes_rate_positive"),
        *scoped_fks("taxes", require_customer=False),
        *audit_fks("taxes"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("organization_id", "company_id", "name", "country", name="uq_taxes_scope_name_country"),
        sa.UniqueConstraint("uuid", name="uq_taxes_uuid"),
    )
    scoped_indexes("taxes", require_customer=False)
    op.create_index("ix_taxes_id", "taxes", ["id"])
    op.create_index("ix_taxes_name", "taxes", ["name"])
    op.create_index("ix_taxes_tax_type", "taxes", ["tax_type"])
    op.create_index("ix_taxes_country", "taxes", ["country"])
    op.create_index("ix_taxes_status", "taxes", ["status"])
    create_audit_indexes("taxes")

    op.create_table(
        "shipping_methods",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *scoped_columns(require_customer=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("courier", sa.String(length=120), nullable=True),
        sa.Column("service_level", sa.String(length=120), nullable=True),
        sa.Column("base_rate", sa.Numeric(14, 2), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        *audit_columns(),
        sa.CheckConstraint("base_rate >= 0", name="ck_shipping_methods_base_rate_positive"),
        *scoped_fks("shipping_methods", require_customer=False),
        *audit_fks("shipping_methods"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_shipping_methods_uuid"),
    )
    scoped_indexes("shipping_methods", require_customer=False)
    op.create_index("ix_shipping_methods_id", "shipping_methods", ["id"])
    op.create_index("ix_shipping_methods_name", "shipping_methods", ["name"])
    op.create_index("ix_shipping_methods_courier", "shipping_methods", ["courier"])
    op.create_index("ix_shipping_methods_status", "shipping_methods", ["status"])
    create_audit_indexes("shipping_methods")

    op.create_table(
        "shipments",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        *scoped_columns(require_customer=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("shipping_method_id", sa.Integer(), nullable=True),
        sa.Column("shipment_number", sa.String(length=80), nullable=False),
        sa.Column("tracking_number", sa.String(length=180), nullable=True),
        sa.Column("courier", sa.String(length=120), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("shipping_cost", sa.Numeric(14, 2), nullable=False),
        sa.Column("shipped_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("extra_data", sa.JSON(), nullable=False),
        *audit_columns(),
        sa.CheckConstraint("shipping_cost >= 0", name="ck_shipments_shipping_cost_positive"),
        *scoped_fks("shipments", require_customer=False),
        sa.ForeignKeyConstraint(["order_id"], ["sales_orders.id"], name="fk_shipments_order_id"),
        sa.ForeignKeyConstraint(["shipping_method_id"], ["shipping_methods.id"], name="fk_shipments_shipping_method_id"),
        *audit_fks("shipments"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("shipment_number", name="uq_shipments_shipment_number"),
        sa.UniqueConstraint("tracking_number", name="uq_shipments_tracking_number"),
        sa.UniqueConstraint("uuid", name="uq_shipments_uuid"),
    )
    scoped_indexes("shipments", require_customer=False)
    op.create_index("ix_shipments_id", "shipments", ["id"])
    op.create_index("ix_shipments_order_id", "shipments", ["order_id"])
    op.create_index("ix_shipments_shipping_method_id", "shipments", ["shipping_method_id"])
    op.create_index("ix_shipments_shipment_number", "shipments", ["shipment_number"], unique=True)
    op.create_index("ix_shipments_tracking_number", "shipments", ["tracking_number"], unique=True)
    op.create_index("ix_shipments_courier", "shipments", ["courier"])
    op.create_index("ix_shipments_status", "shipments", ["status"])
    op.create_index("ix_shipments_shipped_at", "shipments", ["shipped_at"])
    op.create_index("ix_shipments_delivered_at", "shipments", ["delivered_at"])
    create_audit_indexes("shipments")

    for permission_name in SALES_PERMISSIONS:
        op.execute(
            f"""
            INSERT INTO permissions (name, description)
            VALUES ('{permission_name}', 'Allows {permission_name}')
            ON CONFLICT (name) DO NOTHING
            """
        )

    permission_names = "', '".join(SALES_PERMISSIONS)
    op.execute(
        f"""
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles.id, permissions.id
        FROM roles
        CROSS JOIN permissions
        WHERE roles.name IN ('Admin', 'Owner')
          AND permissions.name IN ('{permission_names}')
        ON CONFLICT DO NOTHING
        """
    )


def downgrade() -> None:
    permission_names = "', '".join(SALES_PERMISSIONS)
    op.execute(
        f"""
        DELETE FROM role_permissions
        USING permissions
        WHERE role_permissions.permission_id = permissions.id
          AND permissions.name IN ('{permission_names}')
        """
    )
    op.execute(f"DELETE FROM permissions WHERE name IN ('{permission_names}')")

    drop_audit_indexes("shipments")
    op.drop_index("ix_shipments_delivered_at", table_name="shipments")
    op.drop_index("ix_shipments_shipped_at", table_name="shipments")
    op.drop_index("ix_shipments_status", table_name="shipments")
    op.drop_index("ix_shipments_courier", table_name="shipments")
    op.drop_index("ix_shipments_tracking_number", table_name="shipments")
    op.drop_index("ix_shipments_shipment_number", table_name="shipments")
    op.drop_index("ix_shipments_shipping_method_id", table_name="shipments")
    op.drop_index("ix_shipments_order_id", table_name="shipments")
    op.drop_index("ix_shipments_id", table_name="shipments")
    drop_scoped_indexes("shipments", require_customer=False)
    op.drop_table("shipments")

    drop_audit_indexes("shipping_methods")
    op.drop_index("ix_shipping_methods_status", table_name="shipping_methods")
    op.drop_index("ix_shipping_methods_courier", table_name="shipping_methods")
    op.drop_index("ix_shipping_methods_name", table_name="shipping_methods")
    op.drop_index("ix_shipping_methods_id", table_name="shipping_methods")
    drop_scoped_indexes("shipping_methods", require_customer=False)
    op.drop_table("shipping_methods")

    drop_audit_indexes("taxes")
    op.drop_index("ix_taxes_status", table_name="taxes")
    op.drop_index("ix_taxes_country", table_name="taxes")
    op.drop_index("ix_taxes_tax_type", table_name="taxes")
    op.drop_index("ix_taxes_name", table_name="taxes")
    op.drop_index("ix_taxes_id", table_name="taxes")
    drop_scoped_indexes("taxes", require_customer=False)
    op.drop_table("taxes")

    drop_audit_indexes("discounts")
    op.drop_index("ix_discounts_status", table_name="discounts")
    op.drop_index("ix_discounts_discount_type", table_name="discounts")
    op.drop_index("ix_discounts_code", table_name="discounts")
    op.drop_index("ix_discounts_name", table_name="discounts")
    op.drop_index("ix_discounts_id", table_name="discounts")
    drop_scoped_indexes("discounts", require_customer=False)
    op.drop_table("discounts")

    drop_audit_indexes("invoice_payments")
    op.drop_index("ix_invoice_payments_applied_at", table_name="invoice_payments")
    op.drop_index("ix_invoice_payments_payment_id", table_name="invoice_payments")
    op.drop_index("ix_invoice_payments_invoice_id", table_name="invoice_payments")
    op.drop_index("ix_invoice_payments_id", table_name="invoice_payments")
    op.drop_table("invoice_payments")

    drop_audit_indexes("payments")
    op.drop_index("ix_payments_paid_at", table_name="payments")
    op.drop_index("ix_payments_provider", table_name="payments")
    op.drop_index("ix_payments_transaction_reference", table_name="payments")
    op.drop_index("ix_payments_status", table_name="payments")
    op.drop_index("ix_payments_payment_method", table_name="payments")
    op.drop_index("ix_payments_payment_number", table_name="payments")
    op.drop_index("ix_payments_invoice_id", table_name="payments")
    op.drop_index("ix_payments_order_id", table_name="payments")
    op.drop_index("ix_payments_id", table_name="payments")
    drop_scoped_indexes("payments")
    op.drop_table("payments")

    drop_audit_indexes("invoice_items")
    op.drop_index("ix_invoice_items_sku", table_name="invoice_items")
    op.drop_index("ix_invoice_items_variant_id", table_name="invoice_items")
    op.drop_index("ix_invoice_items_product_id", table_name="invoice_items")
    op.drop_index("ix_invoice_items_order_item_id", table_name="invoice_items")
    op.drop_index("ix_invoice_items_invoice_id", table_name="invoice_items")
    op.drop_index("ix_invoice_items_id", table_name="invoice_items")
    op.drop_table("invoice_items")

    drop_audit_indexes("invoices")
    op.drop_index("ix_invoices_payment_status", table_name="invoices")
    op.drop_index("ix_invoices_status", table_name="invoices")
    op.drop_index("ix_invoices_due_date", table_name="invoices")
    op.drop_index("ix_invoices_invoice_date", table_name="invoices")
    op.drop_index("ix_invoices_invoice_number", table_name="invoices")
    op.drop_index("ix_invoices_order_id", table_name="invoices")
    op.drop_index("ix_invoices_id", table_name="invoices")
    drop_scoped_indexes("invoices")
    op.drop_table("invoices")

    drop_audit_indexes("order_attachments")
    op.drop_index("ix_order_attachments_order_id", table_name="order_attachments")
    op.drop_index("ix_order_attachments_id", table_name="order_attachments")
    op.drop_table("order_attachments")

    drop_audit_indexes("order_history")
    op.drop_index("ix_order_history_changed_by", table_name="order_history")
    op.drop_index("ix_order_history_changed_at", table_name="order_history")
    op.drop_index("ix_order_history_field_name", table_name="order_history")
    op.drop_index("ix_order_history_order_id", table_name="order_history")
    op.drop_index("ix_order_history_id", table_name="order_history")
    op.drop_table("order_history")

    drop_audit_indexes("order_timeline")
    op.drop_index("ix_order_timeline_occurred_at", table_name="order_timeline")
    op.drop_index("ix_order_timeline_event_type", table_name="order_timeline")
    op.drop_index("ix_order_timeline_order_id", table_name="order_timeline")
    op.drop_index("ix_order_timeline_id", table_name="order_timeline")
    op.drop_table("order_timeline")

    drop_audit_indexes("order_notes")
    op.drop_index("ix_order_notes_is_internal", table_name="order_notes")
    op.drop_index("ix_order_notes_note_type", table_name="order_notes")
    op.drop_index("ix_order_notes_order_id", table_name="order_notes")
    op.drop_index("ix_order_notes_id", table_name="order_notes")
    op.drop_table("order_notes")

    drop_audit_indexes("order_items")
    op.drop_index("ix_order_items_stock_status", table_name="order_items")
    op.drop_index("ix_order_items_sku", table_name="order_items")
    op.drop_index("ix_order_items_warehouse_id", table_name="order_items")
    op.drop_index("ix_order_items_variant_id", table_name="order_items")
    op.drop_index("ix_order_items_product_id", table_name="order_items")
    op.drop_index("ix_order_items_order_id", table_name="order_items")
    op.drop_index("ix_order_items_id", table_name="order_items")
    op.drop_table("order_items")

    drop_audit_indexes("quote_approvals")
    op.drop_index("ix_quote_approvals_approved_at", table_name="quote_approvals")
    op.drop_index("ix_quote_approvals_approved_by", table_name="quote_approvals")
    op.drop_index("ix_quote_approvals_status", table_name="quote_approvals")
    op.drop_index("ix_quote_approvals_quote_id", table_name="quote_approvals")
    op.drop_index("ix_quote_approvals_id", table_name="quote_approvals")
    op.drop_table("quote_approvals")

    drop_audit_indexes("quote_versions")
    op.drop_index("ix_quote_versions_quote_id", table_name="quote_versions")
    op.drop_index("ix_quote_versions_id", table_name="quote_versions")
    op.drop_table("quote_versions")

    drop_audit_indexes("quote_items")
    op.drop_index("ix_quote_items_sku", table_name="quote_items")
    op.drop_index("ix_quote_items_warehouse_id", table_name="quote_items")
    op.drop_index("ix_quote_items_variant_id", table_name="quote_items")
    op.drop_index("ix_quote_items_product_id", table_name="quote_items")
    op.drop_index("ix_quote_items_quote_id", table_name="quote_items")
    op.drop_index("ix_quote_items_id", table_name="quote_items")
    op.drop_table("quote_items")

    drop_audit_indexes("sales_orders")
    op.drop_index("ix_sales_orders_shipment_status", table_name="sales_orders")
    op.drop_index("ix_sales_orders_payment_status", table_name="sales_orders")
    op.drop_index("ix_sales_orders_status", table_name="sales_orders")
    op.drop_index("ix_sales_orders_order_date", table_name="sales_orders")
    op.drop_index("ix_sales_orders_order_number", table_name="sales_orders")
    op.drop_index("ix_sales_orders_quote_id", table_name="sales_orders")
    op.drop_index("ix_sales_orders_id", table_name="sales_orders")
    drop_scoped_indexes("sales_orders")
    op.drop_table("sales_orders")

    drop_audit_indexes("quotes")
    op.drop_index("ix_quotes_status", table_name="quotes")
    op.drop_index("ix_quotes_quote_date", table_name="quotes")
    op.drop_index("ix_quotes_quote_number", table_name="quotes")
    op.drop_index("ix_quotes_id", table_name="quotes")
    drop_scoped_indexes("quotes")
    op.drop_table("quotes")
