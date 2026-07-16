"""Enterprise inventory module

Revision ID: 2f4a8c9d1b30
Revises: 7b3f2a9c4d12
Create Date: 2026-07-13 21:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2f4a8c9d1b30"
down_revision: Union[str, Sequence[str], None] = "7b3f2a9c4d12"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


INVENTORY_PERMISSIONS = [
    "products.create",
    "products.read",
    "products.update",
    "products.delete",
    "products.*",
    "inventory.create",
    "inventory.read",
    "inventory.update",
    "inventory.delete",
    "inventory.manage",
    "inventory.*",
    "warehouse.manage",
    "supplier.manage",
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


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("slug", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(["parent_id"], ["categories.id"], name="fk_categories_parent_id"),
        *audit_fks("categories"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug", name="uq_categories_slug"),
        sa.UniqueConstraint("uuid", name="uq_categories_uuid"),
    )
    op.create_index("ix_categories_id", "categories", ["id"])
    op.create_index("ix_categories_parent_id", "categories", ["parent_id"])
    op.create_index("ix_categories_name", "categories", ["name"])
    op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)
    op.create_index("ix_categories_status", "categories", ["status"])
    create_audit_indexes("categories")

    op.create_table(
        "brands",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("logo", sa.String(length=500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        *audit_fks("brands"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_brands_name"),
        sa.UniqueConstraint("uuid", name="uq_brands_uuid"),
    )
    op.create_index("ix_brands_id", "brands", ["id"])
    op.create_index("ix_brands_name", "brands", ["name"], unique=True)
    op.create_index("ix_brands_status", "brands", ["status"])
    create_audit_indexes("brands")

    op.create_table(
        "suppliers",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("company", sa.String(length=180), nullable=False),
        sa.Column("contact_person", sa.String(length=150), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("payment_terms", sa.String(length=255), nullable=True),
        sa.Column("tax_number", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        *audit_fks("suppliers"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_suppliers_uuid"),
    )
    op.create_index("ix_suppliers_id", "suppliers", ["id"])
    op.create_index("ix_suppliers_company", "suppliers", ["company"])
    op.create_index("ix_suppliers_email", "suppliers", ["email"])
    op.create_index("ix_suppliers_phone", "suppliers", ["phone"])
    op.create_index("ix_suppliers_tax_number", "suppliers", ["tax_number"])
    op.create_index("ix_suppliers_status", "suppliers", ["status"])
    create_audit_indexes("suppliers")

    op.create_table(
        "warehouses",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("manager", sa.Integer(), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("capacity", sa.Numeric(14, 2), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(["manager"], ["users.id"], name="fk_warehouses_manager_users"),
        *audit_fks("warehouses"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code", name="uq_warehouses_code"),
        sa.UniqueConstraint("uuid", name="uq_warehouses_uuid"),
    )
    op.create_index("ix_warehouses_id", "warehouses", ["id"])
    op.create_index("ix_warehouses_name", "warehouses", ["name"])
    op.create_index("ix_warehouses_code", "warehouses", ["code"], unique=True)
    op.create_index("ix_warehouses_manager", "warehouses", ["manager"])
    op.create_index("ix_warehouses_status", "warehouses", ["status"])
    create_audit_indexes("warehouses")

    op.create_table(
        "units",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("code", sa.String(length=30), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        *audit_fks("units"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code", name="uq_units_code"),
        sa.UniqueConstraint("name", name="uq_units_name"),
        sa.UniqueConstraint("uuid", name="uq_units_uuid"),
    )
    op.create_index("ix_units_id", "units", ["id"])
    op.create_index("ix_units_name", "units", ["name"], unique=True)
    op.create_index("ix_units_code", "units", ["code"], unique=True)
    op.create_index("ix_units_status", "units", ["status"])
    create_audit_indexes("units")

    op.create_table(
        "product_tags",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=130), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        *audit_fks("product_tags"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", name="uq_product_tags_name"),
        sa.UniqueConstraint("slug", name="uq_product_tags_slug"),
        sa.UniqueConstraint("uuid", name="uq_product_tags_uuid"),
    )
    op.create_index("ix_product_tags_id", "product_tags", ["id"])
    op.create_index("ix_product_tags_name", "product_tags", ["name"], unique=True)
    op.create_index("ix_product_tags_slug", "product_tags", ["slug"], unique=True)
    op.create_index("ix_product_tags_status", "product_tags", ["status"])
    create_audit_indexes("product_tags")

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("sku", sa.String(length=80), nullable=False),
        sa.Column("barcode", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=220), nullable=False),
        sa.Column("short_description", sa.String(length=500), nullable=True),
        sa.Column("full_description", sa.Text(), nullable=True),
        sa.Column("seo_title", sa.String(length=255), nullable=True),
        sa.Column("seo_description", sa.String(length=500), nullable=True),
        sa.Column("slug", sa.String(length=240), nullable=False),
        sa.Column("brand_id", sa.Integer(), nullable=True),
        sa.Column("category_id", sa.Integer(), nullable=True),
        sa.Column("supplier_id", sa.Integer(), nullable=True),
        sa.Column("warehouse_id", sa.Integer(), nullable=True),
        sa.Column("unit_id", sa.Integer(), nullable=True),
        sa.Column("cost_price", sa.Numeric(14, 2), nullable=False),
        sa.Column("selling_price", sa.Numeric(14, 2), nullable=False),
        sa.Column("discount_price", sa.Numeric(14, 2), nullable=True),
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("reserved_quantity", sa.Integer(), nullable=False),
        sa.Column("available_quantity", sa.Integer(), nullable=False),
        sa.Column("reorder_level", sa.Integer(), nullable=False),
        sa.Column("weight", sa.Numeric(10, 3), nullable=True),
        sa.Column("length", sa.Numeric(10, 3), nullable=True),
        sa.Column("width", sa.Numeric(10, 3), nullable=True),
        sa.Column("height", sa.Numeric(10, 3), nullable=True),
        sa.Column("country_of_origin", sa.String(length=100), nullable=True),
        sa.Column("warranty", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("visibility", sa.String(length=50), nullable=False),
        sa.Column("featured", sa.Boolean(), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False),
        *audit_columns(),
        sa.CheckConstraint("available_quantity >= 0", name="ck_products_available_quantity_positive"),
        sa.CheckConstraint("cost_price >= 0", name="ck_products_cost_price_positive"),
        sa.CheckConstraint("discount_price IS NULL OR discount_price >= 0", name="ck_products_discount_price_positive"),
        sa.CheckConstraint(
            "discount_price IS NULL OR discount_price <= selling_price",
            name="ck_products_discount_price_lte_selling_price",
        ),
        sa.CheckConstraint("quantity >= 0", name="ck_products_quantity_positive"),
        sa.CheckConstraint("reserved_quantity >= 0", name="ck_products_reserved_quantity_positive"),
        sa.CheckConstraint("selling_price >= 0", name="ck_products_selling_price_positive"),
        sa.ForeignKeyConstraint(["brand_id"], ["brands.id"], name="fk_products_brand_id"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], name="fk_products_category_id"),
        sa.ForeignKeyConstraint(["supplier_id"], ["suppliers.id"], name="fk_products_supplier_id"),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"], name="fk_products_warehouse_id"),
        sa.ForeignKeyConstraint(["unit_id"], ["units.id"], name="fk_products_unit_id"),
        *audit_fks("products"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("barcode", name="uq_products_barcode"),
        sa.UniqueConstraint("sku", name="uq_products_sku"),
        sa.UniqueConstraint("slug", name="uq_products_slug"),
        sa.UniqueConstraint("uuid", name="uq_products_uuid"),
    )
    op.create_index("ix_products_id", "products", ["id"])
    op.create_index("ix_products_sku", "products", ["sku"], unique=True)
    op.create_index("ix_products_barcode", "products", ["barcode"], unique=True)
    op.create_index("ix_products_name", "products", ["name"])
    op.create_index("ix_products_slug", "products", ["slug"], unique=True)
    op.create_index("ix_products_brand_id", "products", ["brand_id"])
    op.create_index("ix_products_category_id", "products", ["category_id"])
    op.create_index("ix_products_supplier_id", "products", ["supplier_id"])
    op.create_index("ix_products_warehouse_id", "products", ["warehouse_id"])
    op.create_index("ix_products_unit_id", "products", ["unit_id"])
    op.create_index("ix_products_quantity", "products", ["quantity"])
    op.create_index("ix_products_available_quantity", "products", ["available_quantity"])
    op.create_index("ix_products_status", "products", ["status"])
    op.create_index("ix_products_visibility", "products", ["visibility"])
    op.create_index("ix_products_featured", "products", ["featured"])
    op.create_index("ix_products_published", "products", ["published"])
    create_audit_indexes("products")

    op.create_table(
        "product_variants",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("sku", sa.String(length=80), nullable=False),
        sa.Column("barcode", sa.String(length=120), nullable=False),
        sa.Column("color", sa.String(length=80), nullable=True),
        sa.Column("size", sa.String(length=80), nullable=True),
        sa.Column("ram", sa.String(length=80), nullable=True),
        sa.Column("storage", sa.String(length=80), nullable=True),
        sa.Column("processor", sa.String(length=150), nullable=True),
        sa.Column("condition", sa.String(length=80), nullable=True),
        sa.Column("region", sa.String(length=80), nullable=True),
        sa.Column("serial_number", sa.String(length=120), nullable=True),
        sa.Column("imei", sa.String(length=120), nullable=True),
        sa.Column("mac_address", sa.String(length=120), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("reserved_quantity", sa.Integer(), nullable=False),
        sa.Column("available_quantity", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        sa.CheckConstraint("available_quantity >= 0", name="ck_product_variants_available_quantity_positive"),
        sa.CheckConstraint("quantity >= 0", name="ck_product_variants_quantity_positive"),
        sa.CheckConstraint("reserved_quantity >= 0", name="ck_product_variants_reserved_quantity_positive"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_product_variants_product_id"),
        *audit_fks("product_variants"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("barcode", name="uq_product_variants_barcode"),
        sa.UniqueConstraint("sku", name="uq_product_variants_sku"),
        sa.UniqueConstraint("uuid", name="uq_product_variants_uuid"),
    )
    op.create_index("ix_product_variants_id", "product_variants", ["id"])
    op.create_index("ix_product_variants_product_id", "product_variants", ["product_id"])
    op.create_index("ix_product_variants_sku", "product_variants", ["sku"], unique=True)
    op.create_index("ix_product_variants_barcode", "product_variants", ["barcode"], unique=True)
    op.create_index("ix_product_variants_serial_number", "product_variants", ["serial_number"])
    op.create_index("ix_product_variants_imei", "product_variants", ["imei"])
    op.create_index("ix_product_variants_mac_address", "product_variants", ["mac_address"])
    op.create_index("ix_product_variants_status", "product_variants", ["status"])
    create_audit_indexes("product_variants")

    op.create_table(
        "product_attributes",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_product_attributes_product_id"),
        *audit_fks("product_attributes"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id", "name", name="uq_product_attributes_product_name"),
        sa.UniqueConstraint("uuid", name="uq_product_attributes_uuid"),
    )
    op.create_index("ix_product_attributes_id", "product_attributes", ["id"])
    op.create_index("ix_product_attributes_product_id", "product_attributes", ["product_id"])
    op.create_index("ix_product_attributes_name", "product_attributes", ["name"])
    op.create_index("ix_product_attributes_status", "product_attributes", ["status"])
    create_audit_indexes("product_attributes")

    op.create_table(
        "attribute_values",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("attribute_id", sa.Integer(), nullable=False),
        sa.Column("value", sa.String(length=180), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(["attribute_id"], ["product_attributes.id"], name="fk_attribute_values_attribute_id"),
        *audit_fks("attribute_values"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("attribute_id", "value", name="uq_attribute_values_attribute_value"),
        sa.UniqueConstraint("uuid", name="uq_attribute_values_uuid"),
    )
    op.create_index("ix_attribute_values_id", "attribute_values", ["id"])
    op.create_index("ix_attribute_values_attribute_id", "attribute_values", ["attribute_id"])
    op.create_index("ix_attribute_values_value", "attribute_values", ["value"])
    op.create_index("ix_attribute_values_status", "attribute_values", ["status"])
    create_audit_indexes("attribute_values")

    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(length=1000), nullable=False),
        sa.Column("thumbnail_url", sa.String(length=1000), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False),
        sa.Column("is_gallery", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("alt_text", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_product_images_product_id"),
        *audit_fks("product_images"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_product_images_uuid"),
    )
    op.create_index("ix_product_images_id", "product_images", ["id"])
    op.create_index("ix_product_images_product_id", "product_images", ["product_id"])
    op.create_index("ix_product_images_is_primary", "product_images", ["is_primary"])
    op.create_index("ix_product_images_status", "product_images", ["status"])
    create_audit_indexes("product_images")

    op.create_table(
        "inventory",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("variant_id", sa.Integer(), nullable=True),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("current_stock", sa.Integer(), nullable=False),
        sa.Column("reserved_stock", sa.Integer(), nullable=False),
        sa.Column("incoming_stock", sa.Integer(), nullable=False),
        sa.Column("outgoing_stock", sa.Integer(), nullable=False),
        sa.Column("available_stock", sa.Integer(), nullable=False),
        sa.Column("reorder_level", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        *audit_columns(),
        sa.CheckConstraint("available_stock >= 0", name="ck_inventory_available_stock_positive"),
        sa.CheckConstraint("current_stock >= 0", name="ck_inventory_current_stock_positive"),
        sa.CheckConstraint("incoming_stock >= 0", name="ck_inventory_incoming_stock_positive"),
        sa.CheckConstraint("outgoing_stock >= 0", name="ck_inventory_outgoing_stock_positive"),
        sa.CheckConstraint("reserved_stock >= 0", name="ck_inventory_reserved_stock_positive"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_inventory_product_id"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], name="fk_inventory_variant_id"),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"], name="fk_inventory_warehouse_id"),
        *audit_fks("inventory"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("product_id", "variant_id", "warehouse_id", name="uq_inventory_product_variant_warehouse"),
        sa.UniqueConstraint("uuid", name="uq_inventory_uuid"),
    )
    op.create_index("ix_inventory_id", "inventory", ["id"])
    op.create_index("ix_inventory_product_id", "inventory", ["product_id"])
    op.create_index("ix_inventory_variant_id", "inventory", ["variant_id"])
    op.create_index("ix_inventory_warehouse_id", "inventory", ["warehouse_id"])
    op.create_index("ix_inventory_current_stock", "inventory", ["current_stock"])
    op.create_index("ix_inventory_available_stock", "inventory", ["available_stock"])
    op.create_index("ix_inventory_status", "inventory", ["status"])
    create_audit_indexes("inventory")

    op.create_table(
        "stock_movements",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("variant_id", sa.Integer(), nullable=True),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("movement_type", sa.String(length=50), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("quantity_before", sa.Integer(), nullable=False),
        sa.Column("quantity_after", sa.Integer(), nullable=False),
        sa.Column("reference_type", sa.String(length=80), nullable=True),
        sa.Column("reference_id", sa.Integer(), nullable=True),
        sa.Column("reason", sa.String(length=255), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("moved_at", sa.DateTime(timezone=True), nullable=False),
        *audit_columns(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_stock_movements_product_id"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], name="fk_stock_movements_variant_id"),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"], name="fk_stock_movements_warehouse_id"),
        *audit_fks("stock_movements"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_stock_movements_uuid"),
    )
    op.create_index("ix_stock_movements_id", "stock_movements", ["id"])
    op.create_index("ix_stock_movements_product_id", "stock_movements", ["product_id"])
    op.create_index("ix_stock_movements_variant_id", "stock_movements", ["variant_id"])
    op.create_index("ix_stock_movements_warehouse_id", "stock_movements", ["warehouse_id"])
    op.create_index("ix_stock_movements_movement_type", "stock_movements", ["movement_type"])
    op.create_index("ix_stock_movements_moved_at", "stock_movements", ["moved_at"])
    create_audit_indexes("stock_movements")

    op.create_table(
        "stock_adjustments",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("variant_id", sa.Integer(), nullable=True),
        sa.Column("warehouse_id", sa.Integer(), nullable=False),
        sa.Column("quantity_delta", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(length=255), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        *audit_columns(),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_stock_adjustments_product_id"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], name="fk_stock_adjustments_variant_id"),
        sa.ForeignKeyConstraint(["warehouse_id"], ["warehouses.id"], name="fk_stock_adjustments_warehouse_id"),
        *audit_fks("stock_adjustments"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_stock_adjustments_uuid"),
    )
    op.create_index("ix_stock_adjustments_id", "stock_adjustments", ["id"])
    op.create_index("ix_stock_adjustments_product_id", "stock_adjustments", ["product_id"])
    op.create_index("ix_stock_adjustments_variant_id", "stock_adjustments", ["variant_id"])
    op.create_index("ix_stock_adjustments_warehouse_id", "stock_adjustments", ["warehouse_id"])
    op.create_index("ix_stock_adjustments_status", "stock_adjustments", ["status"])
    create_audit_indexes("stock_adjustments")

    op.create_table(
        "stock_transfers",
        sa.Column("id", sa.Integer(), nullable=False),
        uuid_column(),
        sa.Column("transfer_number", sa.String(length=80), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("variant_id", sa.Integer(), nullable=True),
        sa.Column("from_warehouse_id", sa.Integer(), nullable=False),
        sa.Column("to_warehouse_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("approved_by", sa.Integer(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("history", sa.JSON(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        *audit_columns(),
        sa.CheckConstraint("quantity > 0", name="ck_stock_transfers_quantity_positive"),
        sa.ForeignKeyConstraint(["approved_by"], ["users.id"], name="fk_stock_transfers_approved_by"),
        sa.ForeignKeyConstraint(["from_warehouse_id"], ["warehouses.id"], name="fk_stock_transfers_from_warehouse_id"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name="fk_stock_transfers_product_id"),
        sa.ForeignKeyConstraint(["to_warehouse_id"], ["warehouses.id"], name="fk_stock_transfers_to_warehouse_id"),
        sa.ForeignKeyConstraint(["variant_id"], ["product_variants.id"], name="fk_stock_transfers_variant_id"),
        *audit_fks("stock_transfers"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("transfer_number", name="uq_stock_transfers_transfer_number"),
        sa.UniqueConstraint("uuid", name="uq_stock_transfers_uuid"),
    )
    op.create_index("ix_stock_transfers_id", "stock_transfers", ["id"])
    op.create_index("ix_stock_transfers_transfer_number", "stock_transfers", ["transfer_number"], unique=True)
    op.create_index("ix_stock_transfers_product_id", "stock_transfers", ["product_id"])
    op.create_index("ix_stock_transfers_variant_id", "stock_transfers", ["variant_id"])
    op.create_index("ix_stock_transfers_from_warehouse_id", "stock_transfers", ["from_warehouse_id"])
    op.create_index("ix_stock_transfers_to_warehouse_id", "stock_transfers", ["to_warehouse_id"])
    op.create_index("ix_stock_transfers_status", "stock_transfers", ["status"])
    op.create_index("ix_stock_transfers_approved_at", "stock_transfers", ["approved_at"])
    create_audit_indexes("stock_transfers")

    for permission_name in INVENTORY_PERMISSIONS:
        op.execute(
            f"""
            INSERT INTO permissions (name, description)
            VALUES ('{permission_name}', 'Allows {permission_name}')
            ON CONFLICT (name) DO NOTHING
            """
        )

    permission_names = "', '".join(INVENTORY_PERMISSIONS)
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
    permission_names = "', '".join(INVENTORY_PERMISSIONS)
    op.execute(
        f"""
        DELETE FROM role_permissions
        USING permissions
        WHERE role_permissions.permission_id = permissions.id
          AND permissions.name IN ('{permission_names}')
        """
    )
    op.execute(f"DELETE FROM permissions WHERE name IN ('{permission_names}') AND name != 'inventory.*'")

    drop_audit_indexes("stock_transfers")
    op.drop_index("ix_stock_transfers_approved_at", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_status", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_to_warehouse_id", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_from_warehouse_id", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_variant_id", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_product_id", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_transfer_number", table_name="stock_transfers")
    op.drop_index("ix_stock_transfers_id", table_name="stock_transfers")
    op.drop_table("stock_transfers")

    drop_audit_indexes("stock_adjustments")
    op.drop_index("ix_stock_adjustments_status", table_name="stock_adjustments")
    op.drop_index("ix_stock_adjustments_warehouse_id", table_name="stock_adjustments")
    op.drop_index("ix_stock_adjustments_variant_id", table_name="stock_adjustments")
    op.drop_index("ix_stock_adjustments_product_id", table_name="stock_adjustments")
    op.drop_index("ix_stock_adjustments_id", table_name="stock_adjustments")
    op.drop_table("stock_adjustments")

    drop_audit_indexes("stock_movements")
    op.drop_index("ix_stock_movements_moved_at", table_name="stock_movements")
    op.drop_index("ix_stock_movements_movement_type", table_name="stock_movements")
    op.drop_index("ix_stock_movements_warehouse_id", table_name="stock_movements")
    op.drop_index("ix_stock_movements_variant_id", table_name="stock_movements")
    op.drop_index("ix_stock_movements_product_id", table_name="stock_movements")
    op.drop_index("ix_stock_movements_id", table_name="stock_movements")
    op.drop_table("stock_movements")

    drop_audit_indexes("inventory")
    op.drop_index("ix_inventory_status", table_name="inventory")
    op.drop_index("ix_inventory_available_stock", table_name="inventory")
    op.drop_index("ix_inventory_current_stock", table_name="inventory")
    op.drop_index("ix_inventory_warehouse_id", table_name="inventory")
    op.drop_index("ix_inventory_variant_id", table_name="inventory")
    op.drop_index("ix_inventory_product_id", table_name="inventory")
    op.drop_index("ix_inventory_id", table_name="inventory")
    op.drop_table("inventory")

    drop_audit_indexes("product_images")
    op.drop_index("ix_product_images_status", table_name="product_images")
    op.drop_index("ix_product_images_is_primary", table_name="product_images")
    op.drop_index("ix_product_images_product_id", table_name="product_images")
    op.drop_index("ix_product_images_id", table_name="product_images")
    op.drop_table("product_images")

    drop_audit_indexes("attribute_values")
    op.drop_index("ix_attribute_values_status", table_name="attribute_values")
    op.drop_index("ix_attribute_values_value", table_name="attribute_values")
    op.drop_index("ix_attribute_values_attribute_id", table_name="attribute_values")
    op.drop_index("ix_attribute_values_id", table_name="attribute_values")
    op.drop_table("attribute_values")

    drop_audit_indexes("product_attributes")
    op.drop_index("ix_product_attributes_status", table_name="product_attributes")
    op.drop_index("ix_product_attributes_name", table_name="product_attributes")
    op.drop_index("ix_product_attributes_product_id", table_name="product_attributes")
    op.drop_index("ix_product_attributes_id", table_name="product_attributes")
    op.drop_table("product_attributes")

    drop_audit_indexes("product_variants")
    op.drop_index("ix_product_variants_status", table_name="product_variants")
    op.drop_index("ix_product_variants_mac_address", table_name="product_variants")
    op.drop_index("ix_product_variants_imei", table_name="product_variants")
    op.drop_index("ix_product_variants_serial_number", table_name="product_variants")
    op.drop_index("ix_product_variants_barcode", table_name="product_variants")
    op.drop_index("ix_product_variants_sku", table_name="product_variants")
    op.drop_index("ix_product_variants_product_id", table_name="product_variants")
    op.drop_index("ix_product_variants_id", table_name="product_variants")
    op.drop_table("product_variants")

    drop_audit_indexes("products")
    op.drop_index("ix_products_published", table_name="products")
    op.drop_index("ix_products_featured", table_name="products")
    op.drop_index("ix_products_visibility", table_name="products")
    op.drop_index("ix_products_status", table_name="products")
    op.drop_index("ix_products_available_quantity", table_name="products")
    op.drop_index("ix_products_quantity", table_name="products")
    op.drop_index("ix_products_unit_id", table_name="products")
    op.drop_index("ix_products_warehouse_id", table_name="products")
    op.drop_index("ix_products_supplier_id", table_name="products")
    op.drop_index("ix_products_category_id", table_name="products")
    op.drop_index("ix_products_brand_id", table_name="products")
    op.drop_index("ix_products_slug", table_name="products")
    op.drop_index("ix_products_name", table_name="products")
    op.drop_index("ix_products_barcode", table_name="products")
    op.drop_index("ix_products_sku", table_name="products")
    op.drop_index("ix_products_id", table_name="products")
    op.drop_table("products")

    drop_audit_indexes("product_tags")
    op.drop_index("ix_product_tags_status", table_name="product_tags")
    op.drop_index("ix_product_tags_slug", table_name="product_tags")
    op.drop_index("ix_product_tags_name", table_name="product_tags")
    op.drop_index("ix_product_tags_id", table_name="product_tags")
    op.drop_table("product_tags")

    drop_audit_indexes("units")
    op.drop_index("ix_units_status", table_name="units")
    op.drop_index("ix_units_code", table_name="units")
    op.drop_index("ix_units_name", table_name="units")
    op.drop_index("ix_units_id", table_name="units")
    op.drop_table("units")

    drop_audit_indexes("warehouses")
    op.drop_index("ix_warehouses_status", table_name="warehouses")
    op.drop_index("ix_warehouses_manager", table_name="warehouses")
    op.drop_index("ix_warehouses_code", table_name="warehouses")
    op.drop_index("ix_warehouses_name", table_name="warehouses")
    op.drop_index("ix_warehouses_id", table_name="warehouses")
    op.drop_table("warehouses")

    drop_audit_indexes("suppliers")
    op.drop_index("ix_suppliers_status", table_name="suppliers")
    op.drop_index("ix_suppliers_tax_number", table_name="suppliers")
    op.drop_index("ix_suppliers_phone", table_name="suppliers")
    op.drop_index("ix_suppliers_email", table_name="suppliers")
    op.drop_index("ix_suppliers_company", table_name="suppliers")
    op.drop_index("ix_suppliers_id", table_name="suppliers")
    op.drop_table("suppliers")

    drop_audit_indexes("brands")
    op.drop_index("ix_brands_status", table_name="brands")
    op.drop_index("ix_brands_name", table_name="brands")
    op.drop_index("ix_brands_id", table_name="brands")
    op.drop_table("brands")

    drop_audit_indexes("categories")
    op.drop_index("ix_categories_status", table_name="categories")
    op.drop_index("ix_categories_slug", table_name="categories")
    op.drop_index("ix_categories_name", table_name="categories")
    op.drop_index("ix_categories_parent_id", table_name="categories")
    op.drop_index("ix_categories_id", table_name="categories")
    op.drop_table("categories")
