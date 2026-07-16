import pytest
from decimal import Decimal
from datetime import datetime, timezone, timedelta, date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.settings import settings
from app.database.base import Base

from app.models.organization import Organization
from app.models.company import Company
from app.models.department import Department
from app.models.user import User
from app.models.role import Role

from app.models.procurement import (
    SupplierCategory,
    SupplierContact,
    SupplierAddress,
    SupplierBankingInfo,
    SupplierDocument,
    SupplierRating,
    SupplierPerformance,
    PurchaseRequest,
    PurchaseRequestItem,
    PurchaseRequestApproval,
    RFQ,
    RFQItem,
    RFQSupplier,
    RFQResponseItem,
    PurchaseOrder,
    PurchaseOrderItem,
    PurchaseOrderApproval,
    GoodsReceiptNote,
    GoodsReceiptItem,
    PurchaseReturn,
    PurchaseReturnItem,
    SupplierPayment,
)
from app.models.inventory import Supplier, Product, ProductVariant, Inventory, StockMovement, Warehouse, Unit
from app.models.finance import Budget, BudgetLine, VendorBill, FiscalYear

from app.services.procurement_service import (
    SupplierCategoryService,
    SupplierContactService,
    PurchaseRequestService,
    RFQService,
    PurchaseOrderService,
    GoodsReceiptService,
    PurchaseReturnService,
    SupplierPaymentService,
    ProcurementAnalyticsService,
)
from app.services.inventory_service import InventoryService
from app.repositories.inventory_repository import SupplierRepository


# Setup a clean test database engine and session
@pytest.fixture(scope="module")
def db_session():
    # Use the local PostgreSQL test database
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="module")
def setup_data(db_session):
    # Ensure role exists
    role = db_session.query(Role).filter(Role.name == "Owner").first()
    if not role:
        role = Role(name="Owner", description="Owner role")
        db_session.add(role)
        db_session.commit()

    # Ensure user exists
    user = db_session.query(User).filter(User.email == "test_procurement@exshopi.com").first()
    if not user:
        user = User(
            email="test_procurement@exshopi.com",
            password_hash="hashed_password",
            full_name="Test User",
            is_active=True,
            is_verified=True,
            role_id=role.id
        )
        db_session.add(user)
        db_session.commit()

    # Ensure organization exists
    org = db_session.query(Organization).filter(Organization.slug == "exshopi-test-org-proc").first()
    if not org:
        org = Organization(
            name="Exshopi Test Org",
            slug="exshopi-test-org-proc",
            owner_id=user.id
        )
        db_session.add(org)
        db_session.commit()

    # Ensure company exists
    company = db_session.query(Company).filter(Company.company_name == "Exshopi Procurement Corp").first()
    if not company:
        company = Company(
            organization_id=org.id,
            company_name="Exshopi Procurement Corp",
            owner_id=user.id
        )
        db_session.add(company)
        db_session.commit()

    # Ensure department exists
    dept = db_session.query(Department).filter(Department.name == "Procurement Dept Test").first()
    if not dept:
        dept = Department(
            organization_id=org.id,
            company_id=company.id,
            name="Procurement Dept Test"
        )
        db_session.add(dept)
        db_session.commit()

    # Ensure warehouse exists
    warehouse = db_session.query(Warehouse).filter(Warehouse.code == "WH-MAIN-TEST").first()
    if not warehouse:
        warehouse = Warehouse(
            name="Main Storage Hub",
            code="WH-MAIN-TEST",
            status="active"
        )
        db_session.add(warehouse)
        db_session.commit()

    # Ensure unit exists
    unit = db_session.query(Unit).filter(Unit.code == "PCS").first()
    if not unit:
        unit = Unit(
            name="PCS",
            code="PCS",
            status="active"
        )
        db_session.add(unit)
        db_session.commit()

    # Ensure product exists
    product = db_session.query(Product).filter(Product.sku == "PROD-SKU-001").first()
    if not product:
        product = Product(
            sku="PROD-SKU-001",
            barcode="1234567890123",
            name="Industrial Steel Beam",
            slug="industrial-steel-beam",
            cost_price=Decimal("150.00"),
            selling_price=Decimal("200.00"),
            quantity=0,
            available_quantity=0,
            warehouse_id=warehouse.id,
            unit_id=unit.id,
            status="active"
        )
        db_session.add(product)
        db_session.commit()

    # Ensure inventory exists
    inventory = db_session.query(Inventory).filter(
        Inventory.product_id == product.id,
        Inventory.warehouse_id == warehouse.id
    ).first()
    if not inventory:
        inventory = Inventory(
            product_id=product.id,
            warehouse_id=warehouse.id,
            current_stock=0,
            available_stock=0,
            status="active"
        )
        db_session.add(inventory)
        db_session.commit()
    else:
        # Reset stock
        inventory.current_stock = 0
        inventory.available_stock = 0
        db_session.commit()

    # Create a Fiscal Year for budget testing
    fy = db_session.query(FiscalYear).filter(FiscalYear.name == "FY 2026 Test").first()
    if not fy:
        fy = FiscalYear(
            organization_id=org.id,
            company_id=company.id,
            name="FY 2026 Test",
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status="Open"
        )
        db_session.add(fy)
        db_session.commit()

    return {
        "user_id": user.id,
        "organization_id": org.id,
        "company_id": company.id,
        "department_id": dept.id,
        "warehouse_id": warehouse.id,
        "product_id": product.id,
        "fiscal_year_id": fy.id
    }


def test_supplier_profiles_and_categories(db_session, setup_data):
    # 1. Create Supplier Category
    category_data = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "name": "Raw Materials",
        "description": "Suppliers of raw materials like steel and copper",
        "status": "active"
    }
    category = SupplierCategoryService.create(db_session, category_data, setup_data["user_id"])
    assert category.id is not None
    assert category.name == "Raw Materials"

    # 2. Create Supplier Profile (integrated with Category)
    supplier_data = {
        "company": "Apex Steel Ltd",
        "contact_person": "John Doe",
        "email": "apex@apexsteel.com",
        "phone": "+1234567890",
        "country": "USA",
        "status": "active",
        "category_id": category.id,
        "is_preferred": True
    }
    # Check if supplier already exists and delete related contacts first
    supplier = db_session.query(Supplier).filter(Supplier.company == "Apex Steel Ltd").first()
    if supplier:
        for contact in list(supplier.contacts):
            db_session.delete(contact)
        db_session.delete(supplier)
        db_session.commit()

    supplier = SupplierRepository.create(db_session, supplier_data, setup_data["user_id"])
    assert supplier.id is not None
    assert supplier.company == "Apex Steel Ltd"
    assert supplier.is_preferred is True
    assert supplier.category_id == category.id

    # 3. Create Supplier Contact
    contact_data = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "supplier_id": supplier.id,
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@apexsteel.com",
        "phone": "+1234567891",
        "position": "Key Account Manager",
        "is_primary": True,
        "status": "active"
    }
    contact = SupplierContactService.create(db_session, contact_data, setup_data["user_id"])
    assert contact.id is not None
    assert contact.first_name == "Jane"
    assert contact.supplier_id == supplier.id


def test_purchase_request_budget_validation(db_session, setup_data):
    # 1. Fetch or Create Budget Line to avoid UniqueViolation/ForeignKeyViolation
    budget = db_session.query(Budget).filter(Budget.name == "FY 2026 Procurement Budget").first()
    if not budget:
        budget = Budget(
            organization_id=setup_data["organization_id"],
            company_id=setup_data["company_id"],
            fiscal_year_id=setup_data["fiscal_year_id"],
            name="FY 2026 Procurement Budget",
            total_amount=Decimal("10000.00"),
            consumed_amount=Decimal("0.00"),
            status="approved"
        )
        db_session.add(budget)
        db_session.commit()
    else:
        budget.consumed_amount = Decimal("0.00")
        db_session.commit()

    # 2. Test Purchase Request (PR) exceeding remaining budget
    pr_data_exceed = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "department_id": setup_data["department_id"],
        "requester_id": setup_data["user_id"],
        "budget_id": budget.id,
        "title": "Urgent steel purchase",
        "priority": "high",
        "status": "draft",
        "items": [
            {
                "product_id": setup_data["product_id"],
                "quantity": 100,
                "estimated_unit_price": Decimal("150.00"),  # Total = 15000 (exceeds budget 10000)
            }
        ]
    }
    with pytest.raises(Exception) as exc_info:
        PurchaseRequestService.create(db_session, pr_data_exceed, setup_data["user_id"])
    assert "exceeds remaining budget" in str(exc_info.value)

    # 3. Create successful Purchase Request within budget limit
    pr_data_ok = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "department_id": setup_data["department_id"],
        "requester_id": setup_data["user_id"],
        "budget_id": budget.id,
        "title": "Valid steel purchase",
        "priority": "medium",
        "status": "draft",
        "items": [
            {
                "product_id": setup_data["product_id"],
                "quantity": 10,
                "estimated_unit_price": Decimal("150.00"),  # Total = 1500 (within budget 10000)
            }
        ]
    }
    pr = PurchaseRequestService.create(db_session, pr_data_ok, setup_data["user_id"])
    assert pr.id is not None
    assert pr.total_amount == Decimal("1500.00")

    # 4. Approve Purchase Request and check budget consumption
    approved_pr = PurchaseRequestService.approve_request(db_session, pr.id, setup_data["user_id"], "approved")
    assert approved_pr.status == "approved"

    db_session.refresh(budget)
    assert budget.consumed_amount == Decimal("1500.00")


def test_rfq_winner_selection(db_session, setup_data):
    # 1. Create Supplier Category and multiple suppliers
    cat = SupplierCategory(
        organization_id=setup_data["organization_id"],
        name="Wholesale Supplies",
        status="active"
    )
    db_session.add(cat)
    db_session.commit()

    supplier_a = Supplier(company="Supplier A Corp", status="active", category_id=cat.id)
    supplier_b = Supplier(company="Supplier B Corp", status="active", category_id=cat.id)
    db_session.add(supplier_a)
    db_session.add(supplier_b)
    db_session.commit()

    # 2. Create RFQ
    rfq_data = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "title": "Steel RFQ 2026",
        "due_date": datetime.now(timezone.utc) + timedelta(days=7),
        "items": [
            {
                "product_id": setup_data["product_id"],
                "quantity": 50,
                "description": "Industrial grade steel"
            }
        ],
        "supplier_ids": [supplier_a.id, supplier_b.id]
    }
    rfq = RFQService.create(db_session, rfq_data, setup_data["user_id"])
    assert rfq.id is not None
    assert rfq.rfq_number.startswith("RFQ")

    # 3. Submit responses from both suppliers
    # Supplier A bids $120/pcs
    RFQService.submit_response(
        db_session,
        rfq_id=rfq.id,
        supplier_id=supplier_a.id,
        responses=[{
            "rfq_item_id": rfq.items[0].id,
            "quoted_unit_price": Decimal("120.00"),
            "delivery_lead_time_days": 3
        }]
    )
    # Supplier B bids $110/pcs (lower)
    RFQService.submit_response(
        db_session,
        rfq_id=rfq.id,
        supplier_id=supplier_b.id,
        responses=[{
            "rfq_item_id": rfq.items[0].id,
            "quoted_unit_price": Decimal("110.00"),
            "delivery_lead_time_days": 5
        }]
    )

    # 4. Assert Comparison table lists bids correctly
    comparison_table = RFQService.get_comparison_table(db_session, rfq.id)
    assert comparison_table["rfq_id"] == rfq.id
    bids = comparison_table["comparison"][0]["bids"]
    assert len(bids) == 2

    # 5. Award winner (select Supplier B)
    awarded_rfq = RFQService.select_winner(db_session, rfq.id, supplier_b.id, setup_data["user_id"])
    assert awarded_rfq.status == "awarded"

    # Verify Supplier B is won and A is lost
    supp_b_link = db_session.query(RFQSupplier).filter(RFQSupplier.rfq_id == rfq.id, RFQSupplier.supplier_id == supplier_b.id).first()
    assert supp_b_link.status == "won"

    supp_a_link = db_session.query(RFQSupplier).filter(RFQSupplier.rfq_id == rfq.id, RFQSupplier.supplier_id == supplier_a.id).first()
    assert supp_a_link.status == "lost"

    # Verify a Purchase Order was automatically spawned for Supplier B with winner's bidding total ($5500)
    po = db_session.query(PurchaseOrder).filter(PurchaseOrder.rfq_id == rfq.id).first()
    assert po is not None
    assert po.supplier_id == supplier_b.id
    assert po.total_amount == Decimal("5500.00")
    assert len(po.items) == 1
    assert po.items[0].unit_price == Decimal("110.00")


def test_goods_receiving_inventory_updates(db_session, setup_data):
    # 1. Create Supplier & Purchase Order
    supplier = Supplier(company="Steel Supply Inc", status="active")
    db_session.add(supplier)
    db_session.commit()

    po_data = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "supplier_id": supplier.id,
        "title": "Steel Beams Order",
        "items": [
            {
                "product_id": setup_data["product_id"],
                "quantity": 20,
                "unit_price": Decimal("150.00"),
                "tax_rate": Decimal("10.0")  # 10% tax
            }
        ]
    }
    po = PurchaseOrderService.create(db_session, po_data, setup_data["user_id"])
    assert po.total_amount == Decimal("3300.00") # (150 * 20) + 10% tax = 3300

    # 2. Approve Purchase Order to generate VendorBill in Finance module automatically!
    approved_po = PurchaseOrderService.approve_order(db_session, po.id, setup_data["user_id"], "approved")
    assert approved_po.status == "approved"

    # Verify VendorBill was created in Draft status
    bill = db_session.query(VendorBill).filter(VendorBill.supplier_id == supplier.id).first()
    assert bill is not None
    assert bill.total_amount == Decimal("3300.00")
    assert bill.status == "Draft"

    # 3. Create Goods Receipt Note (GRN) for partial receipt (receive 15 out of 20 beams)
    grn_data = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "purchase_order_id": po.id,
        "warehouse_id": setup_data["warehouse_id"],
        "received_by_id": setup_data["user_id"],
        "items": [
            {
                "product_id": setup_data["product_id"],
                "quantity_ordered": 20,
                "quantity_received": 15,
                "quality_status": "passed",
                "batch_number": "BATCH-STEEL-01"
            }
        ]
    }
    grn = GoodsReceiptService.create(db_session, grn_data, setup_data["user_id"])
    assert grn.grn_number.startswith("GRN")

    # 4. Complete GRN receipt and verify Inventory Stock Increment & StockMovement Logging
    completed_grn = GoodsReceiptService.complete_receipt(db_session, grn.id, setup_data["user_id"])
    assert completed_grn.status == "completed"

    # Verify PO item received quantity is updated and PO status is partially received
    db_session.refresh(po)
    assert po.items[0].received_quantity == 15
    assert po.status == "partially_received"

    # Verify inventory is incremented
    inventory_item = db_session.query(Inventory).filter(
        Inventory.product_id == setup_data["product_id"],
        Inventory.warehouse_id == setup_data["warehouse_id"]
    ).first()
    assert inventory_item.current_stock == 15
    assert inventory_item.available_stock == 15

    # Verify StockMovement was logged
    movement = db_session.query(StockMovement).filter(
        StockMovement.reference_type == "GRN",
        StockMovement.reference_id == grn.id
    ).first()
    assert movement is not None
    assert movement.quantity == 15
    assert movement.movement_type == "Purchase"


def test_purchase_returns_inventory_restoration(db_session, setup_data):
    # 1. Create Return Request to Supplier for 5 defective steel beams
    supplier = db_session.query(Supplier).filter(Supplier.company == "Steel Supply Inc").first()
    po = db_session.query(PurchaseOrder).filter(PurchaseOrder.title == "Steel Beams Order").first()
    grn = db_session.query(GoodsReceiptNote).filter(GoodsReceiptNote.purchase_order_id == po.id).first()

    return_data = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "purchase_order_id": po.id,
        "goods_receipt_note_id": grn.id,
        "supplier_id": supplier.id,
        "warehouse_id": setup_data["warehouse_id"],
        "returned_by_id": setup_data["user_id"],
        "items": [
            {
                "product_id": setup_data["product_id"],
                "quantity_returned": 5,
                "refund_unit_price": Decimal("150.00"),
                "reason": "Damaged structural coating",
                "condition_type": "damaged"
            }
        ]
    }
    ret = PurchaseReturnService.create(db_session, return_data, setup_data["user_id"])
    assert ret.return_number.startswith("RET")

    # 2. Complete return and assert Inventory Stock Decrement & StockMovement Logging
    completed_ret = PurchaseReturnService.complete_return(db_session, ret.id, setup_data["user_id"])
    assert completed_ret.status == "completed"

    # Assert PO item returned quantity is updated
    db_session.refresh(po)
    assert po.items[0].returned_quantity == 5

    # Verify inventory is deacremented by 5
    inventory_item = db_session.query(Inventory).filter(
        Inventory.product_id == setup_data["product_id"],
        Inventory.warehouse_id == setup_data["warehouse_id"]
    ).first()
    assert inventory_item.current_stock == 10 # 15 - 5 = 10

    # Verify StockMovement was logged
    movement = db_session.query(StockMovement).filter(
        StockMovement.reference_type == "Return",
        StockMovement.reference_id == ret.id
    ).first()
    assert movement is not None
    assert movement.quantity == -5
    assert movement.movement_type == "Return"


def test_billing_and_payments_tracking(db_session, setup_data):
    # 1. Fetch the generated VendorBill
    supplier = db_session.query(Supplier).filter(Supplier.company == "Steel Supply Inc").first()
    bill = db_session.query(VendorBill).filter(VendorBill.supplier_id == supplier.id).first()
    assert bill is not None

    # 2. Create SupplierPayment (Pay $2000 towards the outstanding $3300)
    payment_data = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "vendor_bill_id": bill.id,
        "supplier_id": supplier.id,
        "payment_method": "ACH Transfer",
        "amount": Decimal("2000.00"),
        "currency": "USD",
        "transaction_reference": "TXN-ACH-889100"
    }
    payment = SupplierPaymentService.create(db_session, payment_data, setup_data["user_id"])
    assert payment.id is not None
    assert payment.payment_number.startswith("PAY")
    assert payment.status == "completed"

    # 3. Verify VendorBill has updated balances and status inside Finance module (Finance Integration!)
    db_session.refresh(bill)
    assert bill.paid_amount == Decimal("2000.00")
    assert bill.balance_due == Decimal("1300.00")
    assert bill.status == "Partially Paid"

    # 4. Pay the remaining $1300 balance
    payment_final_data = {
        "organization_id": setup_data["organization_id"],
        "company_id": setup_data["company_id"],
        "vendor_bill_id": bill.id,
        "supplier_id": supplier.id,
        "payment_method": "ACH Transfer",
        "amount": Decimal("1300.00"),
        "currency": "USD",
        "transaction_reference": "TXN-ACH-889101"
    }
    payment_final = SupplierPaymentService.create(db_session, payment_final_data, setup_data["user_id"])
    assert payment_final.status == "completed"

    # 5. Assert the bill is now fully Paid
    db_session.refresh(bill)
    assert bill.paid_amount == Decimal("3300.00")
    assert bill.balance_due == Decimal("0.00")
    assert bill.status == "Paid"


def test_procurement_analytics_dashboard(db_session, setup_data):
    # Retrieve the dashboard report and verify keys/data
    dashboard = ProcurementAnalyticsService.get_dashboard(db_session)
    assert dashboard["total_orders"] > 0
    assert dashboard["total_suppliers_count"] > 0
    assert "top_suppliers" in dashboard
    assert "monthly_purchase_trends" in dashboard
    assert "cost_savings" in dashboard
