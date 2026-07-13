"""Enterprise verification alignment

Revision ID: 8c2f71b4e0a1
Revises: 3d7a0e5c2b11
Create Date: 2026-07-13 23:55:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8c2f71b4e0a1"
down_revision: Union[str, Sequence[str], None] = "3d7a0e5c2b11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ADDED_INDEXES: tuple[tuple[str, str, tuple[str, ...], bool], ...] = (
    ("ix_companies_organization_id", "companies", ("organization_id",), False),
    ("ix_departments_organization_id", "departments", ("organization_id",), False),
    ("ix_departments_company_id", "departments", ("company_id",), False),
    ("ix_employees_organization_id", "employees", ("organization_id",), False),
    ("ix_employees_company_id", "employees", ("company_id",), False),
    ("ix_employees_department_id", "employees", ("department_id",), False),
    ("ix_employees_user_id", "employees", ("user_id",), False),
    ("ix_employees_email", "employees", ("email",), True),
    ("ix_activities_activity_type", "activities", ("activity_type",), False),
    ("ix_activities_contact_id", "activities", ("contact_id",), False),
    ("ix_activities_created_at", "activities", ("created_at",), False),
    ("ix_activities_opportunity_id", "activities", ("opportunity_id",), False),
    ("ix_activities_organization_id", "activities", ("organization_id",), False),
    ("ix_activities_owner", "activities", ("owner",), False),
    ("ix_contacts_created_at", "contacts", ("created_at",), False),
    ("ix_contacts_first_name", "contacts", ("first_name",), False),
    ("ix_contacts_last_name", "contacts", ("last_name",), False),
    ("ix_crm_tasks_contact_id", "crm_tasks", ("contact_id",), False),
    ("ix_crm_tasks_created_at", "crm_tasks", ("created_at",), False),
    ("ix_crm_tasks_lead_id", "crm_tasks", ("lead_id",), False),
    ("ix_crm_tasks_opportunity_id", "crm_tasks", ("opportunity_id",), False),
    ("ix_crm_tasks_organization_id", "crm_tasks", ("organization_id",), False),
    ("ix_crm_tasks_priority", "crm_tasks", ("priority",), False),
    ("ix_crm_tasks_title", "crm_tasks", ("title",), False),
    ("ix_customers_assigned_to", "customers", ("assigned_to",), False),
    ("ix_customers_created_at", "customers", ("created_at",), False),
    ("ix_customers_first_name", "customers", ("first_name",), False),
    ("ix_customers_last_name", "customers", ("last_name",), False),
    ("ix_customers_mobile", "customers", ("mobile",), False),
    ("ix_discounts_ends_at", "discounts", ("ends_at",), False),
    ("ix_discounts_starts_at", "discounts", ("starts_at",), False),
    ("ix_leads_assigned_to", "leads", ("assigned_to",), False),
    ("ix_leads_created_at", "leads", ("created_at",), False),
    ("ix_leads_priority", "leads", ("priority",), False),
    ("ix_opportunities_created_at", "opportunities", ("created_at",), False),
    ("ix_opportunities_owner", "opportunities", ("owner",), False),
    ("ix_opportunities_pipeline", "opportunities", ("pipeline",), False),
    ("ix_opportunities_title", "opportunities", ("title",), False),
)


DROPPED_INDEXES: tuple[tuple[str, str, tuple[str, ...], bool], ...] = (
    ("ix_attribute_values_id", "attribute_values", ("id",), False),
    ("ix_attribute_values_uuid", "attribute_values", ("uuid",), True),
    ("ix_auth_tokens_id", "auth_tokens", ("id",), False),
    ("ix_brands_id", "brands", ("id",), False),
    ("ix_brands_name", "brands", ("name",), True),
    ("ix_brands_uuid", "brands", ("uuid",), True),
    ("ix_categories_id", "categories", ("id",), False),
    ("ix_categories_slug", "categories", ("slug",), True),
    ("ix_categories_uuid", "categories", ("uuid",), True),
    ("ix_companies_id", "companies", ("id",), False),
    ("ix_discounts_code", "discounts", ("code",), True),
    ("ix_discounts_id", "discounts", ("id",), False),
    ("ix_discounts_uuid", "discounts", ("uuid",), True),
    ("ix_inventory_id", "inventory", ("id",), False),
    ("ix_inventory_uuid", "inventory", ("uuid",), True),
    ("ix_invoice_items_id", "invoice_items", ("id",), False),
    ("ix_invoice_items_uuid", "invoice_items", ("uuid",), True),
    ("ix_invoice_payments_id", "invoice_payments", ("id",), False),
    ("ix_invoice_payments_uuid", "invoice_payments", ("uuid",), True),
    ("ix_invoices_id", "invoices", ("id",), False),
    ("ix_invoices_invoice_number", "invoices", ("invoice_number",), True),
    ("ix_invoices_uuid", "invoices", ("uuid",), True),
    ("ix_order_attachments_id", "order_attachments", ("id",), False),
    ("ix_order_attachments_uuid", "order_attachments", ("uuid",), True),
    ("ix_order_history_id", "order_history", ("id",), False),
    ("ix_order_history_uuid", "order_history", ("uuid",), True),
    ("ix_order_items_id", "order_items", ("id",), False),
    ("ix_order_items_uuid", "order_items", ("uuid",), True),
    ("ix_order_notes_id", "order_notes", ("id",), False),
    ("ix_order_notes_uuid", "order_notes", ("uuid",), True),
    ("ix_order_timeline_id", "order_timeline", ("id",), False),
    ("ix_order_timeline_uuid", "order_timeline", ("uuid",), True),
    ("ix_organizations_id", "organizations", ("id",), False),
    ("ix_payments_id", "payments", ("id",), False),
    ("ix_payments_payment_number", "payments", ("payment_number",), True),
    ("ix_payments_uuid", "payments", ("uuid",), True),
    ("ix_product_attributes_id", "product_attributes", ("id",), False),
    ("ix_product_attributes_uuid", "product_attributes", ("uuid",), True),
    ("ix_product_images_id", "product_images", ("id",), False),
    ("ix_product_images_uuid", "product_images", ("uuid",), True),
    ("ix_product_tags_id", "product_tags", ("id",), False),
    ("ix_product_tags_name", "product_tags", ("name",), True),
    ("ix_product_tags_slug", "product_tags", ("slug",), True),
    ("ix_product_tags_uuid", "product_tags", ("uuid",), True),
    ("ix_product_variants_barcode", "product_variants", ("barcode",), True),
    ("ix_product_variants_id", "product_variants", ("id",), False),
    ("ix_product_variants_sku", "product_variants", ("sku",), True),
    ("ix_product_variants_uuid", "product_variants", ("uuid",), True),
    ("ix_products_barcode", "products", ("barcode",), True),
    ("ix_products_id", "products", ("id",), False),
    ("ix_products_sku", "products", ("sku",), True),
    ("ix_products_slug", "products", ("slug",), True),
    ("ix_products_uuid", "products", ("uuid",), True),
    ("ix_quote_approvals_id", "quote_approvals", ("id",), False),
    ("ix_quote_approvals_uuid", "quote_approvals", ("uuid",), True),
    ("ix_quote_items_id", "quote_items", ("id",), False),
    ("ix_quote_items_uuid", "quote_items", ("uuid",), True),
    ("ix_quote_versions_id", "quote_versions", ("id",), False),
    ("ix_quote_versions_uuid", "quote_versions", ("uuid",), True),
    ("ix_quotes_id", "quotes", ("id",), False),
    ("ix_quotes_quote_number", "quotes", ("quote_number",), True),
    ("ix_quotes_uuid", "quotes", ("uuid",), True),
    ("ix_sales_orders_id", "sales_orders", ("id",), False),
    ("ix_sales_orders_order_number", "sales_orders", ("order_number",), True),
    ("ix_sales_orders_uuid", "sales_orders", ("uuid",), True),
    ("ix_shipments_id", "shipments", ("id",), False),
    ("ix_shipments_shipment_number", "shipments", ("shipment_number",), True),
    ("ix_shipments_tracking_number", "shipments", ("tracking_number",), True),
    ("ix_shipments_uuid", "shipments", ("uuid",), True),
    ("ix_shipping_methods_id", "shipping_methods", ("id",), False),
    ("ix_shipping_methods_uuid", "shipping_methods", ("uuid",), True),
    ("ix_stock_adjustments_id", "stock_adjustments", ("id",), False),
    ("ix_stock_adjustments_uuid", "stock_adjustments", ("uuid",), True),
    ("ix_stock_movements_id", "stock_movements", ("id",), False),
    ("ix_stock_movements_uuid", "stock_movements", ("uuid",), True),
    ("ix_stock_transfers_id", "stock_transfers", ("id",), False),
    ("ix_stock_transfers_transfer_number", "stock_transfers", ("transfer_number",), True),
    ("ix_stock_transfers_uuid", "stock_transfers", ("uuid",), True),
    ("ix_suppliers_id", "suppliers", ("id",), False),
    ("ix_suppliers_uuid", "suppliers", ("uuid",), True),
    ("ix_taxes_id", "taxes", ("id",), False),
    ("ix_taxes_uuid", "taxes", ("uuid",), True),
    ("ix_units_code", "units", ("code",), True),
    ("ix_units_id", "units", ("id",), False),
    ("ix_units_name", "units", ("name",), True),
    ("ix_units_uuid", "units", ("uuid",), True),
    ("ix_users_id", "users", ("id",), False),
    ("ix_warehouses_code", "warehouses", ("code",), True),
    ("ix_warehouses_id", "warehouses", ("id",), False),
    ("ix_warehouses_uuid", "warehouses", ("uuid",), True),
)


def _create_indexes(indexes: tuple[tuple[str, str, tuple[str, ...], bool], ...]) -> None:
    for index_name, table_name, columns, unique in indexes:
        op.create_index(index_name, table_name, list(columns), unique=unique)


def _drop_indexes(indexes: tuple[tuple[str, str, tuple[str, ...], bool], ...]) -> None:
    for index_name, table_name, _columns, _unique in indexes:
        op.drop_index(index_name, table_name=table_name)


def upgrade() -> None:
    op.create_table(
        "employees",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=True),
        sa.Column("company_id", sa.Integer(), nullable=True),
        sa.Column("department_id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("position", sa.String(length=100), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(
            ["organization_id"],
            ["organizations.id"],
            name="fk_employees_organization_id",
            onupdate="CASCADE",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["company_id"],
            ["companies.id"],
            name="fk_employees_company_id",
            onupdate="CASCADE",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["department_id"],
            ["departments.id"],
            name="fk_employees_department_id",
            onupdate="CASCADE",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_employees_user_id",
            onupdate="CASCADE",
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column("companies", sa.Column("organization_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_companies_organization_id",
        "companies",
        "organizations",
        ["organization_id"],
        ["id"],
        onupdate="CASCADE",
        ondelete="SET NULL",
    )

    op.add_column("departments", sa.Column("organization_id", sa.Integer(), nullable=True))
    op.add_column("departments", sa.Column("company_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_departments_organization_id",
        "departments",
        "organizations",
        ["organization_id"],
        ["id"],
        onupdate="CASCADE",
        ondelete="SET NULL",
    )
    op.create_foreign_key(
        "fk_departments_company_id",
        "departments",
        "companies",
        ["company_id"],
        ["id"],
        onupdate="CASCADE",
        ondelete="SET NULL",
    )

    op.drop_column("users", "role")
    _drop_indexes(DROPPED_INDEXES)
    _create_indexes(ADDED_INDEXES)


def downgrade() -> None:
    _drop_indexes(ADDED_INDEXES)
    _create_indexes(DROPPED_INDEXES)

    op.add_column("users", sa.Column("role", sa.String(), nullable=True))

    op.drop_constraint("fk_departments_company_id", "departments", type_="foreignkey")
    op.drop_constraint("fk_departments_organization_id", "departments", type_="foreignkey")
    op.drop_column("departments", "company_id")
    op.drop_column("departments", "organization_id")

    op.drop_constraint("fk_companies_organization_id", "companies", type_="foreignkey")
    op.drop_column("companies", "organization_id")

    op.drop_table("employees")
