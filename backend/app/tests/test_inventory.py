import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.inventory import Warehouse, Product, Inventory, StockAdjustment, StockTransfer, Brand, Category, Supplier, Unit
from app.models.user import User
from app.models.role import Role
from app.services.inventory_service import WarehouseService, ProductService, InventoryService, StockAdjustmentService, StockTransferService

def test_inventory_flow_and_negative_stock_protection(db: Session):
    # 0. Setup Role and Owner User
    role = Role(name="Owner", description="Owner")
    db.add(role)
    db.commit()
    db.refresh(role)

    owner = User(
        full_name="Alice Owner",
        email="owner@example.com",
        password_hash="dummy_hash",
        role_id=role.id,
        is_active=True,
        is_verified=True
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)

    # 1. Setup Warehouse and other lookup entities
    warehouse_from = Warehouse(
        name="Source Warehouse",
        code="WH-SRC",
        location="New York",
        status="active"
    )
    warehouse_to = Warehouse(
        name="Target Warehouse",
        code="WH-TRG",
        location="Boston",
        status="active"
    )
    db.add(warehouse_from)
    db.add(warehouse_to)

    brand = Brand(name="BrandA", status="active")
    cat = Category(name="CatA", slug="cata", status="active")
    sup = Supplier(company="SupA", status="active")
    unit = Unit(name="UnitA", code="pcs", status="active")
    db.add_all([brand, cat, sup, unit])
    db.commit()
    db.refresh(warehouse_from)
    db.refresh(warehouse_to)
    db.refresh(brand)
    db.refresh(cat)
    db.refresh(sup)
    db.refresh(unit)

    # 2. Setup Product
    product = Product(
        brand_id=brand.id,
        category_id=cat.id,
        supplier_id=sup.id,
        warehouse_id=warehouse_from.id,
        unit_id=unit.id,
        sku="PROD-001",
        barcode="BC-001",
        name="Widget Test",
        slug="widget-test",
        cost_price=10.00,
        selling_price=15.00,
        quantity=0,
        available_quantity=0,
        status="active"
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # 3. Create initial inventory
    inventory = InventoryService.create(db, {
        "product_id": product.id,
        "warehouse_id": warehouse_from.id,
        "current_stock": 100,
        "status": "active"
    })
    assert inventory.current_stock == 100

    # Sync and reload product
    db.refresh(product)
    assert product.quantity == 100

    # 4. Negative stock protection check
    with pytest.raises(HTTPException) as exc_info:
        InventoryService.update_stock(
            db,
            product_id=product.id,
            variant_id=None,
            warehouse_id=warehouse_from.id,
            delta=-150, # exceed 100
            movement_type="Manual",
            user_id=None
        )
    assert exc_info.value.status_code == 400
    assert "Negative stock" in exc_info.value.detail["message"]

    # 5. Stock adjustment
    adjustment = StockAdjustmentService.create(db, {
        "warehouse_id": warehouse_from.id,
        "product_id": product.id,
        "quantity_delta": -20,
        "status": "approved",
        "reason": "Damaged stock",
        "notes": "Adjustment notes"
    })
    db.refresh(inventory)
    assert inventory.current_stock == 80

    # 6. Stock transfer
    transfer = StockTransferService.create(db, {
        "product_id": product.id,
        "from_warehouse_id": warehouse_from.id,
        "to_warehouse_id": warehouse_to.id,
        "quantity": 30,
        "status": "approved",
        "notes": "Moving stock"
    })

    db.refresh(inventory)
    assert inventory.current_stock == 50 # 80 - 30

    inventory_to = db.query(Inventory).filter(
        Inventory.product_id == product.id,
        Inventory.warehouse_id == warehouse_to.id
    ).first()
    assert inventory_to is not None
    assert inventory_to.current_stock == 30
