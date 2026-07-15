import pytest
from sqlalchemy import create_engine
from app.database.base import Base

# We need to import all models to register them on Base.metadata
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

def test_metadata_consistency():
    """Verify that all SQLAlchemy models and relationships are consistent and can compile/initialize properly."""
    engine = create_engine("sqlite:///:memory:")
    try:
        Base.metadata.create_all(bind=engine)
        assert True
    except Exception as e:
        pytest.fail(f"SQLAlchemy metadata creation failed: {e}")
