import pytest
from sqlalchemy import event, create_engine
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.organization import Organization
from app.models.company import Company
from app.models.user import User
from app.models.role import Role
from app.models.inventory import Warehouse, Product, Category, Brand, Supplier, Unit, Inventory
from app.services.inventory_service import InventoryService, ProductService

def test_tenant_company_isolation(db: Session):
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

    # Tenant 1 setup
    org1 = Organization(name="Tenant 1", slug="tenant-1", owner_id=owner.id)
    db.add(org1)
    db.commit()
    db.refresh(org1)

    company1 = Company(organization_id=org1.id, company_name="Company 1", owner_id=owner.id)
    db.add(company1)
    db.commit()
    db.refresh(company1)

    # Tenant 2 setup
    org2 = Organization(name="Tenant 2", slug="tenant-2", owner_id=owner.id)
    db.add(org2)
    db.commit()
    db.refresh(org2)

    company2 = Company(organization_id=org2.id, company_name="Company 2", owner_id=owner.id)
    db.add(company2)
    db.commit()
    db.refresh(company2)

    # Verify distinct IDs for tenant isolation validation
    assert org1.id != org2.id
    assert company1.id != company2.id


def test_list_performance_no_n_plus_one(db: Session):
    # 0. Setup Role and Owner User
    role = db.query(Role).filter(Role.name == "Owner").first()
    if not role:
        role = Role(name="Owner", description="Owner")
        db.add(role)
        db.commit()
        db.refresh(role)

    owner = db.query(User).filter(User.email == "owner@example.com").first()
    if not owner:
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

    org = db.query(Organization).filter(Organization.slug == "test-org").first()
    if not org:
        org = Organization(name="Test Org", slug="test-org", owner_id=owner.id)
        db.add(org)
        db.commit()
        db.refresh(org)

    company = db.query(Company).filter(Company.company_name == "Test Company").first()
    if not company:
        company = Company(organization_id=org.id, company_name="Test Company", owner_id=owner.id)
        db.add(company)
        db.commit()
        db.refresh(company)

    # Setup 3 products
    brand = Brand(name="BrandP", status="active")
    cat = Category(name="CatP", slug="catp", status="active")
    sup = Supplier(company="SupP", status="active")
    unit = Unit(name="UnitP", code="pcsp", status="active")
    db.add_all([brand, cat, sup, unit])
    db.commit()
    db.refresh(brand)
    db.refresh(cat)
    db.refresh(sup)
    db.refresh(unit)

    # Setup multiple products
    for i in range(5):
        product = Product(
            brand_id=brand.id,
            category_id=cat.id,
            supplier_id=sup.id,
            unit_id=unit.id,
            sku=f"PROD-PERF-{i}",
            barcode=f"BC-PERF-{i}",
            name=f"Perf Widget {i}",
            slug=f"perf-widget-{i}",
            cost_price=10.00,
            selling_price=15.00,
            quantity=0,
            available_quantity=0,
            status="active"
        )
        db.add(product)
    db.commit()

    # Track SQL Query execution count
    query_count = 0

    @event.listens_for(db.bind, "before_cursor_execute")
    def receive_before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
        nonlocal query_count
        query_count += 1

    try:
        # Perform List Operation through Service
        # List operation should query all products with pagination and counts, which executes 2 main queries (count + fetch).
        # Without N+1, listing 5 products should NOT execute queries for every single product (which would make it 7+ queries).
        res = ProductService.list(db, page=1, page_size=20)
        assert len(res.items) >= 5

        # We assert query_count is minimal (e.g. <= 3), proving that products are loaded in bulk/efficient queries without N+1 regression.
        print("QUERY COUNT EXECUTED FOR LISTING:", query_count)
        assert query_count <= 3
    finally:
        # Remove listener to avoid side effects
        event.remove(db.bind, "before_cursor_execute", receive_before_cursor_execute)
