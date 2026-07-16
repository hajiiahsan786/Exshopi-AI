import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.organization import Organization
from app.models.company import Company
from app.models.user import User
from app.models.role import Role
from app.models.finance import AccountType, ChartOfAccount, JournalEntry, JournalEntryLine
from app.services.finance_service import AccountTypeService, ChartOfAccountService, JournalService, TrialBalanceService, ProfitLossService
from app.schemas.finance import JournalEntryCreate, JournalEntryLineCreate

def test_financial_double_entry_and_reporting(db: Session):
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

    # 1. Setup Organization, Company
    org = Organization(name="Test Org", slug="test-org", owner_id=owner.id)
    db.add(org)
    db.commit()
    db.refresh(org)

    company = Company(organization_id=org.id, company_name="Test Company", owner_id=owner.id)
    db.add(company)
    db.commit()
    db.refresh(company)

    # 2. Setup Account Types
    asset_type = AccountType(
        organization_id=org.id,
        code="AST",
        name="Asset",
        category="Asset",
        normal_balance="Debit",
        status="active"
    )
    rev_type = AccountType(
        organization_id=org.id,
        code="REV",
        name="Revenue",
        category="Revenue",
        normal_balance="Credit",
        status="active"
    )
    db.add_all([asset_type, rev_type])
    db.commit()
    db.refresh(asset_type)
    db.refresh(rev_type)

    # 3. Setup Chart of Accounts (Cash Account and Sales Revenue Account)
    cash_acc = ChartOfAccount(
        organization_id=org.id,
        company_id=company.id,
        account_type_id=asset_type.id,
        account_code="1010",
        name="Cash Account",
        normal_balance="Debit",
        current_balance=0.00,
        allow_posting=True,
        status="active"
    )
    sales_acc = ChartOfAccount(
        organization_id=org.id,
        company_id=company.id,
        account_type_id=rev_type.id,
        account_code="4010",
        name="Sales Revenue Account",
        normal_balance="Credit",
        current_balance=0.00,
        allow_posting=True,
        status="active"
    )
    db.add_all([cash_acc, sales_acc])
    db.commit()
    db.refresh(cash_acc)
    db.refresh(sales_acc)

    # 4. Attempt Unbalanced Journal Entry Creation (Debit 500, Credit 400)
    unbalanced_entry_req = JournalEntryCreate(
        organization_id=org.id,
        company_id=company.id,
        entry_number="JE-UNBAL-001",
        description="Unbalanced entry",
        lines=[
            JournalEntryLineCreate(account_id=cash_acc.id, debit=500.00, credit=0.00, description="Debit Cash"),
            JournalEntryLineCreate(account_id=sales_acc.id, debit=0.00, credit=400.00, description="Credit Sales")
        ]
    )
    with pytest.raises(HTTPException) as exc_info:
        JournalService.create(db, unbalanced_entry_req, user_id=owner.id)
    assert exc_info.value.status_code == 400
    assert "not balanced" in exc_info.value.detail["message"]

    # 5. Create and Post Balanced Journal Entry (Debit 500, Credit 500)
    balanced_entry_req = JournalEntryCreate(
        organization_id=org.id,
        company_id=company.id,
        entry_number="JE-BAL-001",
        description="Sale record",
        lines=[
            JournalEntryLineCreate(account_id=cash_acc.id, debit=500.00, credit=0.00, description="Debit Cash"),
            JournalEntryLineCreate(account_id=sales_acc.id, debit=0.00, credit=500.00, description="Credit Sales")
        ]
    )

    entry = JournalService.create(db, balanced_entry_req, user_id=owner.id)
    assert entry.status == "Draft"
    assert entry.total_debit == 500.00
    assert entry.total_credit == 500.00

    # Post it
    JournalService.post(db, entry.id, user_id=owner.id)
    db.refresh(cash_acc)
    db.refresh(sales_acc)

    # Verify Account Balances update correctly under double-entry accounting rules
    assert cash_acc.current_balance == 500.00
    assert sales_acc.current_balance == 500.00

    # 6. Generate Trial Balance Report and verify
    trial_balance = TrialBalanceService.generate(db, organization_id=org.id)
    assert trial_balance["is_balanced"] is True
    assert trial_balance["total_debit"] == 500.00
    assert trial_balance["total_credit"] == 500.00

    # 7. Generate Profit and Loss Report and verify
    pl_report = ProfitLossService.generate(db, organization_id=org.id)
    assert pl_report["total_revenue"] == 500.00
    assert pl_report["net_income"] == 500.00
