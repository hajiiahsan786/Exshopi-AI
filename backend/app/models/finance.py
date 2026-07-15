from sqlalchemy import Boolean, CheckConstraint, Column, Date, DateTime, ForeignKey, Integer, JSON
from sqlalchemy import Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database.base import Base
from app.models.crm_mixins import AuditMixin, UUIDMixin


class AccountType(UUIDMixin, AuditMixin, Base):
    __tablename__ = "account_types"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    code = Column(String(50), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    normal_balance = Column(String(10), nullable=False, default="Debit")
    description = Column(Text)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    accounts = relationship("ChartOfAccount", back_populates="account_type")

    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_account_types_org_code"),
        CheckConstraint("normal_balance IN ('Debit', 'Credit')", name="ck_account_types_normal_balance"),
    )


class Currency(UUIDMixin, AuditMixin, Base):
    __tablename__ = "currencies"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    code = Column(String(10), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    symbol = Column(String(10))
    decimal_places = Column(Integer, nullable=False, default=2)
    is_base = Column(Boolean, nullable=False, default=False, index=True)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")

    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_currencies_org_code"),
        CheckConstraint("decimal_places >= 0", name="ck_currencies_decimal_places_positive"),
    )


class ChartOfAccount(UUIDMixin, AuditMixin, Base):
    __tablename__ = "chart_of_accounts"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    account_type_id = Column(Integer, ForeignKey("account_types.id"), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    account_code = Column(String(80), nullable=False, index=True)
    name = Column(String(180), nullable=False, index=True)
    description = Column(Text)
    normal_balance = Column(String(10), nullable=False, default="Debit")
    opening_balance = Column(Numeric(18, 4), nullable=False, default=0)
    current_balance = Column(Numeric(18, 4), nullable=False, default=0)
    allow_posting = Column(Boolean, nullable=False, default=True)
    is_control_account = Column(Boolean, nullable=False, default=False, index=True)
    is_bank_account = Column(Boolean, nullable=False, default=False, index=True)
    status = Column(String(50), nullable=False, default="active", index=True)
    extra_data = Column(JSON, nullable=False, default=dict)

    organization = relationship("Organization")
    company = relationship("Company")
    account_type = relationship("AccountType", back_populates="accounts")
    parent = relationship("ChartOfAccount", remote_side=[id], back_populates="children")
    children = relationship("ChartOfAccount", back_populates="parent")
    currency = relationship("Currency")

    __table_args__ = (
        UniqueConstraint("organization_id", "account_code", name="uq_chart_of_accounts_org_code"),
        CheckConstraint("normal_balance IN ('Debit', 'Credit')", name="ck_chart_of_accounts_normal_balance"),
    )


class FiscalYear(UUIDMixin, AuditMixin, Base):
    __tablename__ = "fiscal_years"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    name = Column(String(120), nullable=False, index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="Open", index=True)
    is_current = Column(Boolean, nullable=False, default=False, index=True)
    closed_at = Column(DateTime(timezone=True), nullable=True, index=True)
    closed_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    closer = relationship("User", foreign_keys=[closed_by])
    periods = relationship("FiscalPeriod", back_populates="fiscal_year")

    __table_args__ = (
        UniqueConstraint("organization_id", "name", name="uq_fiscal_years_org_name"),
        CheckConstraint("end_date >= start_date", name="ck_fiscal_years_date_range"),
    )


class FiscalPeriod(UUIDMixin, AuditMixin, Base):
    __tablename__ = "fiscal_periods"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    fiscal_year_id = Column(Integer, ForeignKey("fiscal_years.id"), nullable=False, index=True)
    name = Column(String(120), nullable=False, index=True)
    period_number = Column(Integer, nullable=False, index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="Open", index=True)
    locked_at = Column(DateTime(timezone=True), nullable=True)
    locked_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    organization = relationship("Organization")
    fiscal_year = relationship("FiscalYear", back_populates="periods")
    locker = relationship("User", foreign_keys=[locked_by])

    __table_args__ = (
        UniqueConstraint("fiscal_year_id", "period_number", name="uq_fiscal_periods_year_period"),
        CheckConstraint("period_number > 0", name="ck_fiscal_periods_period_positive"),
        CheckConstraint("end_date >= start_date", name="ck_fiscal_periods_date_range"),
    )


class ExchangeRate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "exchange_rates"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    from_currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=False, index=True)
    to_currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=False, index=True)
    rate = Column(Numeric(18, 8), nullable=False)
    rate_date = Column(Date, nullable=False, index=True)
    source = Column(String(120))
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    from_currency = relationship("Currency", foreign_keys=[from_currency_id])
    to_currency = relationship("Currency", foreign_keys=[to_currency_id])

    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "from_currency_id",
            "to_currency_id",
            "rate_date",
            name="uq_exchange_rates_org_pair_date",
        ),
        CheckConstraint("rate > 0", name="ck_exchange_rates_rate_positive"),
    )


class CostCenter(UUIDMixin, AuditMixin, Base):
    __tablename__ = "cost_centers"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    parent_id = Column(Integer, ForeignKey("cost_centers.id"), nullable=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    code = Column(String(80), nullable=False, index=True)
    name = Column(String(180), nullable=False, index=True)
    description = Column(Text)
    allocation_percent = Column(Numeric(7, 4), nullable=False, default=100)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    parent = relationship("CostCenter", remote_side=[id], back_populates="children")
    children = relationship("CostCenter", back_populates="parent")
    manager = relationship("User", foreign_keys=[manager_id])

    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_cost_centers_org_code"),
        CheckConstraint("allocation_percent >= 0", name="ck_cost_centers_allocation_min"),
        CheckConstraint("allocation_percent <= 100", name="ck_cost_centers_allocation_max"),
    )


class JournalEntry(UUIDMixin, AuditMixin, Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    fiscal_year_id = Column(Integer, ForeignKey("fiscal_years.id"), nullable=True, index=True)
    fiscal_period_id = Column(Integer, ForeignKey("fiscal_periods.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    reversal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    entry_number = Column(String(80), nullable=False, index=True)
    entry_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    source_type = Column(String(80), nullable=True, index=True)
    source_id = Column(Integer, nullable=True, index=True)
    description = Column(Text)
    exchange_rate = Column(Numeric(18, 8), nullable=False, default=1)
    total_debit = Column(Numeric(18, 4), nullable=False, default=0)
    total_credit = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="Draft", index=True)
    posted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    posted_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    reversed_at = Column(DateTime(timezone=True), nullable=True, index=True)
    reversed_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    extra_data = Column(JSON, nullable=False, default=dict)

    organization = relationship("Organization")
    company = relationship("Company")
    fiscal_year = relationship("FiscalYear")
    fiscal_period = relationship("FiscalPeriod")
    currency = relationship("Currency")
    poster = relationship("User", foreign_keys=[posted_by])
    reverser = relationship("User", foreign_keys=[reversed_by])
    reversal_entry = relationship("JournalEntry", remote_side=[id])
    lines = relationship("JournalEntryLine", back_populates="journal_entry", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organization_id", "entry_number", name="uq_journal_entries_org_number"),
        CheckConstraint("exchange_rate > 0", name="ck_journal_entries_exchange_rate_positive"),
        CheckConstraint("total_debit >= 0", name="ck_journal_entries_total_debit_positive"),
        CheckConstraint("total_credit >= 0", name="ck_journal_entries_total_credit_positive"),
    )


class JournalEntryLine(UUIDMixin, AuditMixin, Base):
    __tablename__ = "journal_entry_lines"

    id = Column(Integer, primary_key=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=False, index=True)
    cost_center_id = Column(Integer, ForeignKey("cost_centers.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    tax_rate_id = Column(Integer, ForeignKey("tax_rates.id"), nullable=True, index=True)
    line_number = Column(Integer, nullable=False)
    description = Column(Text)
    debit = Column(Numeric(18, 4), nullable=False, default=0)
    credit = Column(Numeric(18, 4), nullable=False, default=0)
    exchange_rate = Column(Numeric(18, 8), nullable=False, default=1)
    base_debit = Column(Numeric(18, 4), nullable=False, default=0)
    base_credit = Column(Numeric(18, 4), nullable=False, default=0)
    party_type = Column(String(80), nullable=True, index=True)
    party_id = Column(Integer, nullable=True, index=True)

    journal_entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("ChartOfAccount")
    cost_center = relationship("CostCenter")
    currency = relationship("Currency")
    tax_rate = relationship("TaxRate")

    __table_args__ = (
        UniqueConstraint("journal_entry_id", "line_number", name="uq_journal_entry_lines_entry_line"),
        CheckConstraint("line_number > 0", name="ck_journal_entry_lines_line_number_positive"),
        CheckConstraint("debit >= 0", name="ck_journal_entry_lines_debit_positive"),
        CheckConstraint("credit >= 0", name="ck_journal_entry_lines_credit_positive"),
        CheckConstraint("base_debit >= 0", name="ck_journal_entry_lines_base_debit_positive"),
        CheckConstraint("base_credit >= 0", name="ck_journal_entry_lines_base_credit_positive"),
        CheckConstraint("exchange_rate > 0", name="ck_journal_entry_lines_exchange_rate_positive"),
    )


class GeneralLedger(UUIDMixin, AuditMixin, Base):
    __tablename__ = "general_ledger"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=False, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False, index=True)
    journal_entry_line_id = Column(Integer, ForeignKey("journal_entry_lines.id"), nullable=False, index=True)
    fiscal_year_id = Column(Integer, ForeignKey("fiscal_years.id"), nullable=True, index=True)
    fiscal_period_id = Column(Integer, ForeignKey("fiscal_periods.id"), nullable=True, index=True)
    cost_center_id = Column(Integer, ForeignKey("cost_centers.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    posting_date = Column(DateTime(timezone=True), nullable=False, index=True)
    description = Column(Text)
    debit = Column(Numeric(18, 4), nullable=False, default=0)
    credit = Column(Numeric(18, 4), nullable=False, default=0)
    balance = Column(Numeric(18, 4), nullable=False, default=0)
    exchange_rate = Column(Numeric(18, 8), nullable=False, default=1)
    source_type = Column(String(80), nullable=True, index=True)
    source_id = Column(Integer, nullable=True, index=True)
    status = Column(String(50), nullable=False, default="posted", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    account = relationship("ChartOfAccount")
    journal_entry = relationship("JournalEntry")
    journal_entry_line = relationship("JournalEntryLine")
    fiscal_year = relationship("FiscalYear")
    fiscal_period = relationship("FiscalPeriod")
    cost_center = relationship("CostCenter")
    currency = relationship("Currency")

    __table_args__ = (
        CheckConstraint("debit >= 0", name="ck_general_ledger_debit_positive"),
        CheckConstraint("credit >= 0", name="ck_general_ledger_credit_positive"),
        CheckConstraint("exchange_rate > 0", name="ck_general_ledger_exchange_rate_positive"),
    )


class Budget(UUIDMixin, AuditMixin, Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    fiscal_year_id = Column(Integer, ForeignKey("fiscal_years.id"), nullable=False, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    name = Column(String(180), nullable=False, index=True)
    description = Column(Text)
    total_amount = Column(Numeric(18, 4), nullable=False, default=0)
    consumed_amount = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="Draft", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    fiscal_year = relationship("FiscalYear")
    currency = relationship("Currency")
    lines = relationship("BudgetLine", back_populates="budget", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("organization_id", "fiscal_year_id", "name", name="uq_budgets_org_year_name"),
        CheckConstraint("total_amount >= 0", name="ck_budgets_total_positive"),
        CheckConstraint("consumed_amount >= 0", name="ck_budgets_consumed_positive"),
    )


class BudgetLine(UUIDMixin, AuditMixin, Base):
    __tablename__ = "budget_lines"

    id = Column(Integer, primary_key=True)
    budget_id = Column(Integer, ForeignKey("budgets.id"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=False, index=True)
    cost_center_id = Column(Integer, ForeignKey("cost_centers.id"), nullable=True, index=True)
    fiscal_period_id = Column(Integer, ForeignKey("fiscal_periods.id"), nullable=True, index=True)
    amount = Column(Numeric(18, 4), nullable=False, default=0)
    consumed_amount = Column(Numeric(18, 4), nullable=False, default=0)
    remaining_amount = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active", index=True)

    budget = relationship("Budget", back_populates="lines")
    account = relationship("ChartOfAccount")
    cost_center = relationship("CostCenter")
    fiscal_period = relationship("FiscalPeriod")

    __table_args__ = (
        CheckConstraint("amount >= 0", name="ck_budget_lines_amount_positive"),
        CheckConstraint("consumed_amount >= 0", name="ck_budget_lines_consumed_positive"),
    )


class BankAccount(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=False, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    bank_name = Column(String(180), nullable=False, index=True)
    account_name = Column(String(180), nullable=False)
    account_number = Column(String(120), nullable=False, index=True)
    iban = Column(String(120), nullable=True, index=True)
    swift_code = Column(String(50), nullable=True)
    opening_balance = Column(Numeric(18, 4), nullable=False, default=0)
    current_balance = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    account = relationship("ChartOfAccount")
    currency = relationship("Currency")
    transactions = relationship("BankTransaction", back_populates="bank_account")

    __table_args__ = (UniqueConstraint("organization_id", "account_number", name="uq_bank_accounts_org_number"),)


class BankTransaction(UUIDMixin, AuditMixin, Base):
    __tablename__ = "bank_transactions"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    bank_account_id = Column(Integer, ForeignKey("bank_accounts.id"), nullable=False, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    transaction_date = Column(DateTime(timezone=True), nullable=False, index=True)
    value_date = Column(DateTime(timezone=True), nullable=True, index=True)
    reference = Column(String(120), nullable=True, index=True)
    description = Column(Text)
    transaction_type = Column(String(50), nullable=False, index=True)
    amount = Column(Numeric(18, 4), nullable=False)
    reconciled_amount = Column(Numeric(18, 4), nullable=False, default=0)
    is_reconciled = Column(Boolean, nullable=False, default=False, index=True)
    reconciled_at = Column(DateTime(timezone=True), nullable=True, index=True)
    status = Column(String(50), nullable=False, default="unmatched", index=True)

    organization = relationship("Organization")
    bank_account = relationship("BankAccount", back_populates="transactions")
    journal_entry = relationship("JournalEntry")

    __table_args__ = (
        CheckConstraint("amount >= 0", name="ck_bank_transactions_amount_positive"),
        CheckConstraint("reconciled_amount >= 0", name="ck_bank_transactions_reconciled_positive"),
    )


class ExpenseCategory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    code = Column(String(80), nullable=False, index=True)
    name = Column(String(180), nullable=False, index=True)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    account = relationship("ChartOfAccount")

    __table_args__ = (UniqueConstraint("organization_id", "code", name="uq_expense_categories_org_code"),)


class PaymentTerm(UUIDMixin, AuditMixin, Base):
    __tablename__ = "payment_terms"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    code = Column(String(80), nullable=False, index=True)
    name = Column(String(180), nullable=False, index=True)
    days = Column(Integer, nullable=False, default=0)
    discount_days = Column(Integer, nullable=False, default=0)
    discount_percent = Column(Numeric(7, 4), nullable=False, default=0)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")

    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_payment_terms_org_code"),
        CheckConstraint("days >= 0", name="ck_payment_terms_days_positive"),
        CheckConstraint("discount_days >= 0", name="ck_payment_terms_discount_days_positive"),
        CheckConstraint("discount_percent >= 0", name="ck_payment_terms_discount_min"),
        CheckConstraint("discount_percent <= 100", name="ck_payment_terms_discount_max"),
    )


class Expense(UUIDMixin, AuditMixin, Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    expense_category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    payment_term_id = Column(Integer, ForeignKey("payment_terms.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    expense_number = Column(String(80), nullable=False, index=True)
    expense_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    vendor_name = Column(String(180), nullable=True, index=True)
    description = Column(Text)
    subtotal = Column(Numeric(18, 4), nullable=False, default=0)
    tax_total = Column(Numeric(18, 4), nullable=False, default=0)
    total_amount = Column(Numeric(18, 4), nullable=False, default=0)
    paid_amount = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="Draft", index=True)
    extra_data = Column(JSON, nullable=False, default=dict)

    organization = relationship("Organization")
    company = relationship("Company")
    expense_category = relationship("ExpenseCategory")
    account = relationship("ChartOfAccount")
    payment_term = relationship("PaymentTerm")
    currency = relationship("Currency")
    journal_entry = relationship("JournalEntry")

    __table_args__ = (
        UniqueConstraint("organization_id", "expense_number", name="uq_expenses_org_number"),
        CheckConstraint("subtotal >= 0", name="ck_expenses_subtotal_positive"),
        CheckConstraint("tax_total >= 0", name="ck_expenses_tax_positive"),
        CheckConstraint("total_amount >= 0", name="ck_expenses_total_positive"),
        CheckConstraint("paid_amount >= 0", name="ck_expenses_paid_positive"),
    )


class VendorBill(UUIDMixin, AuditMixin, Base):
    __tablename__ = "vendor_bills"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True, index=True)
    payment_term_id = Column(Integer, ForeignKey("payment_terms.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    bill_number = Column(String(80), nullable=False, index=True)
    bill_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    subtotal = Column(Numeric(18, 4), nullable=False, default=0)
    tax_total = Column(Numeric(18, 4), nullable=False, default=0)
    discount_total = Column(Numeric(18, 4), nullable=False, default=0)
    total_amount = Column(Numeric(18, 4), nullable=False, default=0)
    paid_amount = Column(Numeric(18, 4), nullable=False, default=0)
    balance_due = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="Draft", index=True)
    notes = Column(Text)
    extra_data = Column(JSON, nullable=False, default=dict)

    organization = relationship("Organization")
    company = relationship("Company")
    supplier = relationship("Supplier")
    payment_term = relationship("PaymentTerm")
    currency = relationship("Currency")
    journal_entry = relationship("JournalEntry")

    __table_args__ = (
        UniqueConstraint("organization_id", "bill_number", name="uq_vendor_bills_org_number"),
        CheckConstraint("subtotal >= 0", name="ck_vendor_bills_subtotal_positive"),
        CheckConstraint("tax_total >= 0", name="ck_vendor_bills_tax_positive"),
        CheckConstraint("discount_total >= 0", name="ck_vendor_bills_discount_positive"),
        CheckConstraint("total_amount >= 0", name="ck_vendor_bills_total_positive"),
        CheckConstraint("paid_amount >= 0", name="ck_vendor_bills_paid_positive"),
        CheckConstraint("balance_due >= 0", name="ck_vendor_bills_balance_positive"),
    )


class VendorCreditNote(UUIDMixin, AuditMixin, Base):
    __tablename__ = "vendor_credit_notes"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True, index=True)
    vendor_bill_id = Column(Integer, ForeignKey("vendor_bills.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    credit_note_number = Column(String(80), nullable=False, index=True)
    credit_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    amount = Column(Numeric(18, 4), nullable=False, default=0)
    tax_amount = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="Draft", index=True)
    reason = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    supplier = relationship("Supplier")
    vendor_bill = relationship("VendorBill")
    currency = relationship("Currency")
    journal_entry = relationship("JournalEntry")

    __table_args__ = (
        UniqueConstraint("organization_id", "credit_note_number", name="uq_vendor_credit_notes_org_number"),
        CheckConstraint("amount >= 0", name="ck_vendor_credit_notes_amount_positive"),
        CheckConstraint("tax_amount >= 0", name="ck_vendor_credit_notes_tax_positive"),
    )


class CustomerCreditNote(UUIDMixin, AuditMixin, Base):
    __tablename__ = "customer_credit_notes"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    credit_note_number = Column(String(80), nullable=False, index=True)
    credit_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    amount = Column(Numeric(18, 4), nullable=False, default=0)
    tax_amount = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="Draft", index=True)
    reason = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    customer = relationship("Customer")
    invoice = relationship("Invoice")
    currency = relationship("Currency")
    journal_entry = relationship("JournalEntry")

    __table_args__ = (
        UniqueConstraint("organization_id", "credit_note_number", name="uq_customer_credit_notes_org_number"),
        CheckConstraint("amount >= 0", name="ck_customer_credit_notes_amount_positive"),
        CheckConstraint("tax_amount >= 0", name="ck_customer_credit_notes_tax_positive"),
    )


class DebitNote(UUIDMixin, AuditMixin, Base):
    __tablename__ = "debit_notes"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    vendor_bill_id = Column(Integer, ForeignKey("vendor_bills.id"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    debit_note_number = Column(String(80), nullable=False, index=True)
    debit_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    amount = Column(Numeric(18, 4), nullable=False, default=0)
    tax_amount = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="Draft", index=True)
    reason = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    supplier = relationship("Supplier")
    customer = relationship("Customer")
    vendor_bill = relationship("VendorBill")
    invoice = relationship("Invoice")
    currency = relationship("Currency")
    journal_entry = relationship("JournalEntry")

    __table_args__ = (
        UniqueConstraint("organization_id", "debit_note_number", name="uq_debit_notes_org_number"),
        CheckConstraint("amount >= 0", name="ck_debit_notes_amount_positive"),
        CheckConstraint("tax_amount >= 0", name="ck_debit_notes_tax_positive"),
    )


class PaymentAllocation(UUIDMixin, AuditMixin, Base):
    __tablename__ = "payment_allocations"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True, index=True)
    vendor_bill_id = Column(Integer, ForeignKey("vendor_bills.id"), nullable=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=True, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    allocation_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    amount = Column(Numeric(18, 4), nullable=False)
    exchange_rate = Column(Numeric(18, 8), nullable=False, default=1)
    status = Column(String(50), nullable=False, default="allocated", index=True)
    notes = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    payment = relationship("Payment")
    invoice = relationship("Invoice")
    vendor_bill = relationship("VendorBill")
    expense = relationship("Expense")
    currency = relationship("Currency")

    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_payment_allocations_amount_positive"),
        CheckConstraint("exchange_rate > 0", name="ck_payment_allocations_exchange_rate_positive"),
    )


class RecurringJournal(UUIDMixin, AuditMixin, Base):
    __tablename__ = "recurring_journals"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    template_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    name = Column(String(180), nullable=False, index=True)
    frequency = Column(String(50), nullable=False, index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=True, index=True)
    next_run_date = Column(Date, nullable=False, index=True)
    last_run_date = Column(Date, nullable=True, index=True)
    auto_post = Column(Boolean, nullable=False, default=False)
    payload = Column(JSON, nullable=False, default=dict)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    template_entry = relationship("JournalEntry")


class TaxRate(UUIDMixin, AuditMixin, Base):
    __tablename__ = "tax_rates"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    recoverable_account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    code = Column(String(80), nullable=False, index=True)
    name = Column(String(180), nullable=False, index=True)
    tax_type = Column(String(50), nullable=False, index=True)
    rate = Column(Numeric(7, 4), nullable=False)
    effective_from = Column(Date, nullable=True, index=True)
    effective_to = Column(Date, nullable=True, index=True)
    country = Column(String(100), nullable=True, index=True)
    region = Column(String(120), nullable=True)
    is_compound = Column(Boolean, nullable=False, default=False)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    account = relationship("ChartOfAccount", foreign_keys=[account_id])
    recoverable_account = relationship("ChartOfAccount", foreign_keys=[recoverable_account_id])

    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_tax_rates_org_code"),
        CheckConstraint("rate >= 0", name="ck_tax_rates_rate_min"),
        CheckConstraint("rate <= 100", name="ck_tax_rates_rate_max"),
    )


class TaxGroup(UUIDMixin, AuditMixin, Base):
    __tablename__ = "tax_groups"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    code = Column(String(80), nullable=False, index=True)
    name = Column(String(180), nullable=False, index=True)
    tax_rate_ids = Column(JSON, nullable=False, default=list)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")

    __table_args__ = (UniqueConstraint("organization_id", "code", name="uq_tax_groups_org_code"),)


class PaymentSchedule(UUIDMixin, AuditMixin, Base):
    __tablename__ = "payment_schedules"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    payment_term_id = Column(Integer, ForeignKey("payment_terms.id"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=True, index=True)
    vendor_bill_id = Column(Integer, ForeignKey("vendor_bills.id"), nullable=True, index=True)
    due_date = Column(DateTime(timezone=True), nullable=False, index=True)
    amount = Column(Numeric(18, 4), nullable=False)
    paid_amount = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="pending", index=True)
    notes = Column(Text)

    organization = relationship("Organization")
    payment_term = relationship("PaymentTerm")
    invoice = relationship("Invoice")
    vendor_bill = relationship("VendorBill")

    __table_args__ = (
        CheckConstraint("amount >= 0", name="ck_payment_schedules_amount_positive"),
        CheckConstraint("paid_amount >= 0", name="ck_payment_schedules_paid_positive"),
    )


class AssetCategory(UUIDMixin, AuditMixin, Base):
    __tablename__ = "asset_categories"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    asset_account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    depreciation_account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    accumulated_depreciation_account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    code = Column(String(80), nullable=False, index=True)
    name = Column(String(180), nullable=False, index=True)
    useful_life_months = Column(Integer, nullable=False, default=36)
    depreciation_method = Column(String(50), nullable=False, default="straight_line")
    status = Column(String(50), nullable=False, default="active", index=True)

    organization = relationship("Organization")
    asset_account = relationship("ChartOfAccount", foreign_keys=[asset_account_id])
    depreciation_account = relationship("ChartOfAccount", foreign_keys=[depreciation_account_id])
    accumulated_depreciation_account = relationship("ChartOfAccount", foreign_keys=[accumulated_depreciation_account_id])

    __table_args__ = (
        UniqueConstraint("organization_id", "code", name="uq_asset_categories_org_code"),
        CheckConstraint("useful_life_months > 0", name="ck_asset_categories_life_positive"),
    )


class Asset(UUIDMixin, AuditMixin, Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    asset_category_id = Column(Integer, ForeignKey("asset_categories.id"), nullable=False, index=True)
    currency_id = Column(Integer, ForeignKey("currencies.id"), nullable=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    asset_number = Column(String(80), nullable=False, index=True)
    name = Column(String(180), nullable=False, index=True)
    acquisition_date = Column(Date, nullable=False, index=True)
    acquisition_cost = Column(Numeric(18, 4), nullable=False)
    salvage_value = Column(Numeric(18, 4), nullable=False, default=0)
    useful_life_months = Column(Integer, nullable=False)
    depreciation_method = Column(String(50), nullable=False, default="straight_line")
    accumulated_depreciation = Column(Numeric(18, 4), nullable=False, default=0)
    book_value = Column(Numeric(18, 4), nullable=False, default=0)
    status = Column(String(50), nullable=False, default="active", index=True)
    notes = Column(Text)

    organization = relationship("Organization")
    company = relationship("Company")
    asset_category = relationship("AssetCategory")
    currency = relationship("Currency")
    journal_entry = relationship("JournalEntry")
    depreciation_entries = relationship("DepreciationEntry", back_populates="asset")

    __table_args__ = (
        UniqueConstraint("organization_id", "asset_number", name="uq_assets_org_number"),
        CheckConstraint("acquisition_cost >= 0", name="ck_assets_cost_positive"),
        CheckConstraint("salvage_value >= 0", name="ck_assets_salvage_positive"),
        CheckConstraint("useful_life_months > 0", name="ck_assets_life_positive"),
        CheckConstraint("accumulated_depreciation >= 0", name="ck_assets_accumulated_positive"),
        CheckConstraint("book_value >= 0", name="ck_assets_book_value_positive"),
    )


class DepreciationEntry(UUIDMixin, AuditMixin, Base):
    __tablename__ = "depreciation_entries"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    fiscal_period_id = Column(Integer, ForeignKey("fiscal_periods.id"), nullable=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    depreciation_date = Column(Date, nullable=False, index=True)
    amount = Column(Numeric(18, 4), nullable=False)
    accumulated_depreciation = Column(Numeric(18, 4), nullable=False)
    book_value = Column(Numeric(18, 4), nullable=False)
    status = Column(String(50), nullable=False, default="posted", index=True)
    notes = Column(Text)

    organization = relationship("Organization")
    asset = relationship("Asset", back_populates="depreciation_entries")
    fiscal_period = relationship("FiscalPeriod")
    journal_entry = relationship("JournalEntry")

    __table_args__ = (
        CheckConstraint("amount >= 0", name="ck_depreciation_entries_amount_positive"),
        CheckConstraint("accumulated_depreciation >= 0", name="ck_depreciation_entries_accumulated_positive"),
        CheckConstraint("book_value >= 0", name="ck_depreciation_entries_book_value_positive"),
    )


class FinancialClosing(UUIDMixin, AuditMixin, Base):
    __tablename__ = "financial_closings"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True, index=True)
    fiscal_year_id = Column(Integer, ForeignKey("fiscal_years.id"), nullable=True, index=True)
    fiscal_period_id = Column(Integer, ForeignKey("fiscal_periods.id"), nullable=True, index=True)
    retained_earnings_account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    income_summary_account_id = Column(Integer, ForeignKey("chart_of_accounts.id"), nullable=True, index=True)
    closing_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=True, index=True)
    closing_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    closing_type = Column(String(50), nullable=False, index=True)
    status = Column(String(50), nullable=False, default="Draft", index=True)
    notes = Column(Text)
    closed_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)

    organization = relationship("Organization")
    company = relationship("Company")
    fiscal_year = relationship("FiscalYear")
    fiscal_period = relationship("FiscalPeriod")
    retained_earnings_account = relationship("ChartOfAccount", foreign_keys=[retained_earnings_account_id])
    income_summary_account = relationship("ChartOfAccount", foreign_keys=[income_summary_account_id])
    closing_entry = relationship("JournalEntry")
    closer = relationship("User", foreign_keys=[closed_by])


class AuditLog(UUIDMixin, AuditMixin, Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    entity_type = Column(String(120), nullable=False, index=True)
    entity_id = Column(Integer, nullable=True, index=True)
    action = Column(String(80), nullable=False, index=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    ip_address = Column(String(80))
    user_agent = Column(String(500))
    description = Column(Text)
    occurred_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    organization = relationship("Organization")
    user = relationship("User", foreign_keys=[user_id])
