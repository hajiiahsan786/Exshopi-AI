import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.main import app
from app.database.base import Base
from app.database.dependencies import get_db

# Use an in-memory SQLite database for fast unit and integration tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

@pytest.fixture(scope="session", autouse=True)
def create_test_database():
    # Import all models to ensure they are registered in metadata
    from app.models.role import Role
    from app.models.permission import Permission
    from app.models.organization import Organization
    from app.models.company import Company
    from app.models.user import User
    from app.models.auth_token import AuthToken
    from app.models.employee import Employee
    from app.models.department import Department
    from app.models.customer import Customer
    from app.models.contact import Contact
    from app.models.lead import Lead
    from app.models.opportunity import Opportunity
    from app.models.crm_task import CRMTask
    from app.models.activity import Activity
    from app.models.inventory import (
        Warehouse, Product, Category, Brand, Unit, ProductVariant,
        ProductImage, ProductTag, Inventory, StockAdjustment, StockTransfer, StockMovement, Supplier
    )
    from app.models.sales import (
        Quote, QuoteItem, QuoteVersion, QuoteApproval, SalesOrder,
        OrderItem, OrderHistory, OrderNote, OrderAttachment, OrderTimeline, ShippingMethod, Shipment,
        Tax, Discount, Invoice, InvoiceItem, InvoicePayment, Payment
    )
    from app.models.finance import (
        AccountType, Currency, ChartOfAccount, FiscalYear, FiscalPeriod, ExchangeRate, CostCenter,
        JournalEntry, JournalEntryLine, GeneralLedger, Budget, BudgetLine, BankAccount, BankTransaction,
        ExpenseCategory, PaymentTerm, Expense, VendorBill, VendorCreditNote, CustomerCreditNote, DebitNote,
        PaymentAllocation, RecurringJournal, TaxRate, TaxGroup, PaymentSchedule, AssetCategory, Asset,
        DepreciationEntry, FinancialClosing, AuditLog
    )

    # Create all tables once for the test session
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(name="db")
def db_fixture() -> Generator[Session, None, None]:
    # Establish a fresh connection and transaction per test
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(name="client")
def client_fixture(db: Session) -> Generator[TestClient, None, None]:
    # Override get_db to return our transactional session
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
