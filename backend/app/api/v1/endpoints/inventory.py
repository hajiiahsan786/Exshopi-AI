from app.api.v1.endpoints.inventory_router_factory import create_inventory_router
from app.schemas.inventory import (
    AttributeValueCreate,
    AttributeValueListResponse,
    AttributeValueSingleResponse,
    AttributeValueUpdate,
    BrandCreate,
    BrandListResponse,
    BrandSingleResponse,
    BrandUpdate,
    CategoryCreate,
    CategoryListResponse,
    CategorySingleResponse,
    CategoryUpdate,
    InventoryCreate,
    InventoryListResponse,
    InventorySingleResponse,
    InventoryUpdate,
    ProductAttributeCreate,
    ProductAttributeListResponse,
    ProductAttributeSingleResponse,
    ProductAttributeUpdate,
    ProductCreate,
    ProductImageCreate,
    ProductImageListResponse,
    ProductImageSingleResponse,
    ProductImageUpdate,
    ProductListResponse,
    ProductSingleResponse,
    ProductTagCreate,
    ProductTagListResponse,
    ProductTagSingleResponse,
    ProductTagUpdate,
    ProductUpdate,
    ProductVariantCreate,
    ProductVariantListResponse,
    ProductVariantSingleResponse,
    ProductVariantUpdate,
    StockAdjustmentCreate,
    StockAdjustmentListResponse,
    StockAdjustmentSingleResponse,
    StockAdjustmentUpdate,
    StockMovementCreate,
    StockMovementListResponse,
    StockMovementSingleResponse,
    StockMovementUpdate,
    StockTransferCreate,
    StockTransferListResponse,
    StockTransferSingleResponse,
    StockTransferUpdate,
    SupplierCreate,
    SupplierListResponse,
    SupplierSingleResponse,
    SupplierUpdate,
    UnitCreate,
    UnitListResponse,
    UnitSingleResponse,
    UnitUpdate,
    WarehouseCreate,
    WarehouseListResponse,
    WarehouseSingleResponse,
    WarehouseUpdate,
)
from app.services.inventory_service import (
    AttributeValueService,
    BrandService,
    CategoryService,
    InventoryService,
    ProductAttributeService,
    ProductImageService,
    ProductService,
    ProductTagService,
    ProductVariantService,
    StockAdjustmentService,
    StockMovementService,
    StockTransferService,
    SupplierService,
    UnitService,
    WarehouseService,
)


categories_router = create_inventory_router(
    service=CategoryService,
    create_schema=CategoryCreate,
    update_schema=CategoryUpdate,
    single_response=CategorySingleResponse,
    list_response=CategoryListResponse,
    permission_prefix="products",
    entity_label="Categories",
)

brands_router = create_inventory_router(
    service=BrandService,
    create_schema=BrandCreate,
    update_schema=BrandUpdate,
    single_response=BrandSingleResponse,
    list_response=BrandListResponse,
    permission_prefix="products",
    entity_label="Brands",
)

suppliers_router = create_inventory_router(
    service=SupplierService,
    create_schema=SupplierCreate,
    update_schema=SupplierUpdate,
    single_response=SupplierSingleResponse,
    list_response=SupplierListResponse,
    permission_prefix="supplier",
    entity_label="Suppliers",
    manager_permissions=("supplier.manage",),
)

warehouses_router = create_inventory_router(
    service=WarehouseService,
    create_schema=WarehouseCreate,
    update_schema=WarehouseUpdate,
    single_response=WarehouseSingleResponse,
    list_response=WarehouseListResponse,
    permission_prefix="warehouse",
    entity_label="Warehouses",
    manager_permissions=("warehouse.manage",),
)

products_router = create_inventory_router(
    service=ProductService,
    create_schema=ProductCreate,
    update_schema=ProductUpdate,
    single_response=ProductSingleResponse,
    list_response=ProductListResponse,
    permission_prefix="products",
    entity_label="Products",
)

product_variants_router = create_inventory_router(
    service=ProductVariantService,
    create_schema=ProductVariantCreate,
    update_schema=ProductVariantUpdate,
    single_response=ProductVariantSingleResponse,
    list_response=ProductVariantListResponse,
    permission_prefix="products",
    entity_label="Product variants",
)

product_images_router = create_inventory_router(
    service=ProductImageService,
    create_schema=ProductImageCreate,
    update_schema=ProductImageUpdate,
    single_response=ProductImageSingleResponse,
    list_response=ProductImageListResponse,
    permission_prefix="products",
    entity_label="Product images",
)

product_attributes_router = create_inventory_router(
    service=ProductAttributeService,
    create_schema=ProductAttributeCreate,
    update_schema=ProductAttributeUpdate,
    single_response=ProductAttributeSingleResponse,
    list_response=ProductAttributeListResponse,
    permission_prefix="products",
    entity_label="Product attributes",
)

attribute_values_router = create_inventory_router(
    service=AttributeValueService,
    create_schema=AttributeValueCreate,
    update_schema=AttributeValueUpdate,
    single_response=AttributeValueSingleResponse,
    list_response=AttributeValueListResponse,
    permission_prefix="products",
    entity_label="Attribute values",
)

product_tags_router = create_inventory_router(
    service=ProductTagService,
    create_schema=ProductTagCreate,
    update_schema=ProductTagUpdate,
    single_response=ProductTagSingleResponse,
    list_response=ProductTagListResponse,
    permission_prefix="products",
    entity_label="Product tags",
)

inventory_router = create_inventory_router(
    service=InventoryService,
    create_schema=InventoryCreate,
    update_schema=InventoryUpdate,
    single_response=InventorySingleResponse,
    list_response=InventoryListResponse,
    permission_prefix="inventory",
    entity_label="Inventory",
)

stock_movements_router = create_inventory_router(
    service=StockMovementService,
    create_schema=StockMovementCreate,
    update_schema=StockMovementUpdate,
    single_response=StockMovementSingleResponse,
    list_response=StockMovementListResponse,
    permission_prefix="inventory",
    entity_label="Stock movements",
)

stock_adjustments_router = create_inventory_router(
    service=StockAdjustmentService,
    create_schema=StockAdjustmentCreate,
    update_schema=StockAdjustmentUpdate,
    single_response=StockAdjustmentSingleResponse,
    list_response=StockAdjustmentListResponse,
    permission_prefix="inventory",
    entity_label="Stock adjustments",
)

stock_transfers_router = create_inventory_router(
    service=StockTransferService,
    create_schema=StockTransferCreate,
    update_schema=StockTransferUpdate,
    single_response=StockTransferSingleResponse,
    list_response=StockTransferListResponse,
    permission_prefix="inventory",
    entity_label="Stock transfers",
)

units_router = create_inventory_router(
    service=UnitService,
    create_schema=UnitCreate,
    update_schema=UnitUpdate,
    single_response=UnitSingleResponse,
    list_response=UnitListResponse,
    permission_prefix="inventory",
    entity_label="Units",
)

INVENTORY_ROUTERS = (
    (categories_router, "/categories", ["Categories"]),
    (brands_router, "/brands", ["Brands"]),
    (suppliers_router, "/suppliers", ["Suppliers"]),
    (warehouses_router, "/warehouses", ["Warehouses"]),
    (products_router, "/products", ["Products"]),
    (product_variants_router, "/product-variants", ["Product Variants"]),
    (product_images_router, "/product-images", ["Product Images"]),
    (product_attributes_router, "/product-attributes", ["Product Attributes"]),
    (attribute_values_router, "/attribute-values", ["Attribute Values"]),
    (product_tags_router, "/product-tags", ["Product Tags"]),
    (inventory_router, "/inventory", ["Inventory"]),
    (stock_movements_router, "/stock-movements", ["Stock Movements"]),
    (stock_adjustments_router, "/stock-adjustments", ["Stock Adjustments"]),
    (stock_transfers_router, "/stock-transfers", ["Stock Transfers"]),
    (units_router, "/units", ["Units"]),
)
