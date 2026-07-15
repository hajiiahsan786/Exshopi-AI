import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.inventory import Warehouse, Product, Inventory, Brand, Category, Supplier, Unit
from app.models.organization import Organization
from app.models.company import Company
from app.models.user import User
from app.models.role import Role
from app.models.customer import Customer
from app.models.sales import SalesOrder, OrderItem, Invoice, Payment, Shipment
from app.services.inventory_service import InventoryService
from app.services.order_service import SalesOrderService, update_order_payment_rollup

def test_order_lifecycle_flow(db: Session):
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

    # 1. Setup Organization, Company, and Warehouse
    org = Organization(name="Test Org", slug="test-org", owner_id=owner.id)
    db.add(org)
    db.commit()
    db.refresh(org)

    company = Company(organization_id=org.id, company_name="Test Company", owner_id=owner.id)
    db.add(company)
    db.commit()
    db.refresh(company)

    warehouse = Warehouse(
        name="Main WH",
        code="WH-MAIN",
        location="Austin",
        status="active"
    )
    db.add(warehouse)

    brand = Brand(name="BrandA", status="active")
    cat = Category(name="CatA", slug="cata", status="active")
    sup = Supplier(company="SupA", status="active")
    unit = Unit(name="UnitA", code="pcs", status="active")
    db.add_all([brand, cat, sup, unit])
    db.commit()
    db.refresh(warehouse)
    db.refresh(brand)
    db.refresh(cat)
    db.refresh(sup)
    db.refresh(unit)

    # Create Customer
    customer = Customer(
        organization_id=org.id,
        company_id=company.id,
        first_name="John",
        last_name="Doe",
        email="john@doe.com",
        customer_code="CUST-001",
        status="active"
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)

    # 2. Setup Product
    product = Product(
        brand_id=brand.id,
        category_id=cat.id,
        supplier_id=sup.id,
        warehouse_id=warehouse.id,
        unit_id=unit.id,
        sku="PROD-001",
        barcode="BC-001",
        name="Widget Test",
        slug="widget-test",
        cost_price=10.00,
        selling_price=50.00,
        quantity=0,
        available_quantity=0,
        status="active"
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # Stock inventory with 10 units
    inventory = InventoryService.create(db, {
        "product_id": product.id,
        "warehouse_id": warehouse.id,
        "current_stock": 10,
        "status": "active"
    })
    assert inventory.current_stock == 10

    # 3. Create a SalesOrder with 2 units (Will reserve them)
    order_data = {
        "organization_id": org.id,
        "company_id": company.id,
        "customer_id": customer.id,
        "order_number": "SO-TEST-001",
        "status": "Pending",
        "currency": "USD",
        "shipping_cost": 5.00,
        "items": [
            {
                "product_id": product.id,
                "warehouse_id": warehouse.id,
                "quantity": 2,
                "unit_price": 50.00,
                "discount_amount": 0.00,
                "tax_amount": 0.00
            }
        ]
    }

    order = SalesOrderService.create(db, order_data, user_id=owner.id)
    assert order.order_number == "SO-TEST-001"
    assert order.grand_total == 105.00 # 2 * 50 + 5

    # Check Reservation
    db.refresh(inventory)
    assert inventory.current_stock == 10
    assert inventory.reserved_stock == 2
    assert inventory.available_stock == 8

    # 4. Process the order (Commits the stock)
    SalesOrderService.update(db, order.id, {"status": "Processing"}, user_id=owner.id)
    db.refresh(inventory)
    assert inventory.current_stock == 8
    assert inventory.reserved_stock == 0
    assert inventory.available_stock == 8

    # 5. Check auto-generated invoice
    invoice = db.query(Invoice).filter(Invoice.order_id == order.id).first()
    assert invoice is not None
    assert invoice.grand_total == 105.00
    assert invoice.payment_status == "Pending"

    # 6. Apply payment
    payment = Payment(
        organization_id=org.id,
        company_id=company.id,
        customer_id=customer.id,
        order_id=order.id,
        invoice_id=invoice.id,
        payment_number="PAY-001",
        payment_method="Credit Card",
        status="Paid",
        amount=105.00,
        currency="USD"
    )
    db.add(payment)
    db.commit()

    update_order_payment_rollup(db, order.id, user_id=owner.id)
    invoice.payment_status = "Paid" # update invoice status
    db.commit() # crucial to commit the modified fields on order/invoice before refresh!
    db.refresh(order)
    db.refresh(invoice)

    assert order.paid_amount == 105.00
    assert order.payment_status == "Paid"
    assert invoice.payment_status == "Paid"

    # 7. Ship the order
    SalesOrderService.update(db, order.id, {"status": "Shipped"}, user_id=owner.id)
    db.refresh(order)
    assert order.shipment_status == "Dispatched"

    # 8. Cancel/Refund the order (restores stock)
    SalesOrderService.update(db, order.id, {"status": "Refunded"}, user_id=owner.id)
    db.refresh(inventory)
    assert inventory.current_stock == 10 # Restored from 8 to 10
    assert inventory.reserved_stock == 0
    assert inventory.available_stock == 10
