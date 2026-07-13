from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, ForeignKey, Integer, JSON
from sqlalchemy import Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class Category(UUIDMixin, AuditMixin, Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    slug = Column(String(180), nullable=False, unique=True)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="active", index=True)
    sort_order = Column(Integer, nullable=False, default=0)

    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship("Category", back_populates="parent")
    products = relationship("Product", back_populates="category")


class Brand(UUIDMixin, AuditMixin, Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False, unique=True)
    logo = Column(String(500))
    description = Column(Text)
    website = Column(String(255))
    country = Column(String(100))
    status = Column(String(50), nullable=False, default="active", index=True)

    products = relationship("Product", back_populates="brand")


class Supplier(UUIDMixin, AuditMixin, Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True)
    company = Column(String(180), nullable=False, index=True)
    contact_person = Column(String(150))
    email = Column(String(255), index=True)
    phone = Column(String(50), index=True)
    address = Column(Text)
    country = Column(String(100))
    website = Column(String(255))
    payment_terms = Column(String(255))
    tax_number = Column(String(100), index=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    products = relationship("Product", back_populates="supplier")


class Warehouse(UUIDMixin, AuditMixin, Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False, index=True)
    code = Column(String(50), nullable=False, unique=True)
    location = Column(String(255))
    manager = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    phone = Column(String(50))
    email = Column(String(255))
    capacity = Column(Numeric(14, 2))
    status = Column(String(50), nullable=False, default="active", index=True)

    manager_user = relationship("User", foreign_keys=[manager])
    products = relationship("Product", back_populates="warehouse")
    inventory_items = relationship("Inventory", back_populates="warehouse")


class Unit(UUIDMixin, AuditMixin, Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(30), nullable=False, unique=True)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="active", index=True)

    products = relationship("Product", back_populates="unit")


class ProductTag(UUIDMixin, AuditMixin, Base):
    __tablename__ = "product_tags"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(130), nullable=False, unique=True)
    status = Column(String(50), nullable=False, default="active", index=True)


class Product(UUIDMixin, AuditMixin, Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    sku = Column(String(80), nullable=False, unique=True)
    barcode = Column(String(120), nullable=False, unique=True)
    name = Column(String(220), nullable=False, index=True)
    short_description = Column(String(500))
    full_description = Column(Text)
    seo_title = Column(String(255))
    seo_description = Column(String(500))
    slug = Column(String(240), nullable=False, unique=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=True, index=True)
    cost_price = Column(Numeric(14, 2), nullable=False, default=0)
    selling_price = Column(Numeric(14, 2), nullable=False, default=0)
    discount_price = Column(Numeric(14, 2))
    currency = Column(String(10), nullable=False, default="USD")
    quantity = Column(Integer, nullable=False, default=0, index=True)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    available_quantity = Column(Integer, nullable=False, default=0, index=True)
    reorder_level = Column(Integer, nullable=False, default=0)
    weight = Column(Numeric(10, 3))
    length = Column(Numeric(10, 3))
    width = Column(Numeric(10, 3))
    height = Column(Numeric(10, 3))
    country_of_origin = Column(String(100))
    warranty = Column(String(255))
    status = Column(String(50), nullable=False, default="active", index=True)
    visibility = Column(String(50), nullable=False, default="public", index=True)
    featured = Column(Boolean, nullable=False, default=False, index=True)
    published = Column(Boolean, nullable=False, default=False, index=True)
    tags = Column(JSON, nullable=False, default=list)

    brand = relationship("Brand", back_populates="products")
    category = relationship("Category", back_populates="products")
    supplier = relationship("Supplier", back_populates="products")
    warehouse = relationship("Warehouse", back_populates="products")
    unit = relationship("Unit", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product")
    attributes = relationship("ProductAttribute", back_populates="product")
    images = relationship("ProductImage", back_populates="product")
    inventory_items = relationship("Inventory", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")

    __table_args__ = (
        CheckConstraint("cost_price >= 0", name="ck_products_cost_price_positive"),
        CheckConstraint("selling_price >= 0", name="ck_products_selling_price_positive"),
        CheckConstraint("discount_price IS NULL OR discount_price >= 0", name="ck_products_discount_price_positive"),
        CheckConstraint(
            "discount_price IS NULL OR discount_price <= selling_price",
            name="ck_products_discount_price_lte_selling_price",
        ),
        CheckConstraint("quantity >= 0", name="ck_products_quantity_positive"),
        CheckConstraint("reserved_quantity >= 0", name="ck_products_reserved_quantity_positive"),
        CheckConstraint("available_quantity >= 0", name="ck_products_available_quantity_positive"),
    )

    @property
    def is_low_stock(self) -> bool:
        return self.available_quantity > 0 and self.available_quantity <= self.reorder_level

    @property
    def is_out_of_stock(self) -> bool:
        return self.available_quantity <= 0


class ProductVariant(UUIDMixin, AuditMixin, Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    sku = Column(String(80), nullable=False, unique=True)
    barcode = Column(String(120), nullable=False, unique=True)
    color = Column(String(80))
    size = Column(String(80))
    ram = Column(String(80))
    storage = Column(String(80))
    processor = Column(String(150))
    condition = Column(String(80))
    region = Column(String(80))
    serial_number = Column(String(120), index=True)
    imei = Column(String(120), index=True)
    mac_address = Column(String(120), index=True)
    quantity = Column(Integer, nullable=False, default=0)
    reserved_quantity = Column(Integer, nullable=False, default=0)
    available_quantity = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active", index=True)

    product = relationship("Product", back_populates="variants")
    inventory_items = relationship("Inventory", back_populates="variant")

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_product_variants_quantity_positive"),
        CheckConstraint("reserved_quantity >= 0", name="ck_product_variants_reserved_quantity_positive"),
        CheckConstraint("available_quantity >= 0", name="ck_product_variants_available_quantity_positive"),
    )


class ProductAttribute(UUIDMixin, AuditMixin, Base):
    __tablename__ = "product_attributes"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    name = Column(String(120), nullable=False, index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active", index=True)

    product = relationship("Product", back_populates="attributes")
    values = relationship("AttributeValue", back_populates="attribute")

    __table_args__ = (UniqueConstraint("product_id", "name", name="uq_product_attributes_product_name"),)


class AttributeValue(UUIDMixin, AuditMixin, Base):
    __tablename__ = "attribute_values"

    id = Column(Integer, primary_key=True)
    attribute_id = Column(Integer, ForeignKey("product_attributes.id"), nullable=False, index=True)
    value = Column(String(180), nullable=False, index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active", index=True)

    attribute = relationship("ProductAttribute", back_populates="values")

    __table_args__ = (UniqueConstraint("attribute_id", "value", name="uq_attribute_values_attribute_value"),)


class ProductImage(UUIDMixin, AuditMixin, Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    image_url = Column(String(1000), nullable=False)
    thumbnail_url = Column(String(1000))
    is_primary = Column(Boolean, nullable=False, default=False, index=True)
    is_gallery = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)
    alt_text = Column(String(255))
    status = Column(String(50), nullable=False, default="active", index=True)

    product = relationship("Product", back_populates="images")


class Inventory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    current_stock = Column(Integer, nullable=False, default=0, index=True)
    reserved_stock = Column(Integer, nullable=False, default=0)
    incoming_stock = Column(Integer, nullable=False, default=0)
    outgoing_stock = Column(Integer, nullable=False, default=0)
    available_stock = Column(Integer, nullable=False, default=0, index=True)
    reorder_level = Column(Integer, nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active", index=True)

    product = relationship("Product", back_populates="inventory_items")
    variant = relationship("ProductVariant", back_populates="inventory_items")
    warehouse = relationship("Warehouse", back_populates="inventory_items")

    __table_args__ = (
        UniqueConstraint("product_id", "variant_id", "warehouse_id", name="uq_inventory_product_variant_warehouse"),
        CheckConstraint("current_stock >= 0", name="ck_inventory_current_stock_positive"),
        CheckConstraint("reserved_stock >= 0", name="ck_inventory_reserved_stock_positive"),
        CheckConstraint("incoming_stock >= 0", name="ck_inventory_incoming_stock_positive"),
        CheckConstraint("outgoing_stock >= 0", name="ck_inventory_outgoing_stock_positive"),
        CheckConstraint("available_stock >= 0", name="ck_inventory_available_stock_positive"),
    )

    @property
    def is_low_stock(self) -> bool:
        return self.available_stock > 0 and self.available_stock <= self.reorder_level

    @property
    def is_out_of_stock(self) -> bool:
        return self.available_stock <= 0


class StockMovement(UUIDMixin, AuditMixin, Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    movement_type = Column(String(50), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    quantity_before = Column(Integer, nullable=False)
    quantity_after = Column(Integer, nullable=False)
    reference_type = Column(String(80))
    reference_id = Column(Integer)
    reason = Column(String(255))
    notes = Column(Text)
    moved_at = Column(DateTime(timezone=True), nullable=False, index=True)

    product = relationship("Product", back_populates="stock_movements")
    variant = relationship("ProductVariant")
    warehouse = relationship("Warehouse")


class StockAdjustment(UUIDMixin, AuditMixin, Base):
    __tablename__ = "stock_adjustments"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    quantity_delta = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="approved", index=True)
    notes = Column(Text)

    product = relationship("Product")
    variant = relationship("ProductVariant")
    warehouse = relationship("Warehouse")


class StockTransfer(UUIDMixin, AuditMixin, Base):
    __tablename__ = "stock_transfers"

    id = Column(Integer, primary_key=True)
    transfer_number = Column(String(80), nullable=False, unique=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    variant_id = Column(Integer, ForeignKey("product_variants.id"), nullable=True, index=True)
    from_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    to_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="draft", index=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True, index=True)
    history = Column(JSON, nullable=False, default=list)
    notes = Column(Text)

    product = relationship("Product")
    variant = relationship("ProductVariant")
    from_warehouse = relationship("Warehouse", foreign_keys=[from_warehouse_id])
    to_warehouse = relationship("Warehouse", foreign_keys=[to_warehouse_id])
    approver = relationship("User", foreign_keys=[approved_by])

    __table_args__ = (CheckConstraint("quantity > 0", name="ck_stock_transfers_quantity_positive"),)
