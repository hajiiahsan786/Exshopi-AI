from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import Field, field_validator, model_validator

from app.schemas.crm_common import APIResponse, AuditResponseMixin, CRMBaseModel, PaginatedResponse, validate_choice


ACCOUNT_CATEGORIES = {"Asset", "Liability", "Equity", "Revenue", "Expense"}
NORMAL_BALANCES = {"Debit", "Credit"}
GENERIC_STATUS_VALUES = {"active", "inactive", "archived", "draft"}
JOURNAL_STATUS_VALUES = {"Draft", "Posted", "Reversed", "Cancelled"}
FISCAL_STATUS_VALUES = {"Open", "Closed", "Locked"}
DOCUMENT_STATUS_VALUES = {"Draft", "Approved", "Posted", "Paid", "Partially Paid", "Void", "Cancelled"}
TAX_TYPE_VALUES = {"VAT", "GST", "Sales Tax", "Purchase Tax", "Withholding", "Country Tax"}
TRANSACTION_TYPE_VALUES = {"Deposit", "Withdrawal", "Transfer", "Fee", "Interest", "Adjustment"}
RECONCILIATION_STATUS_VALUES = {"unmatched", "matched", "reconciled", "ignored"}
FREQUENCY_VALUES = {"daily", "weekly", "monthly", "quarterly", "semiannual", "annual"}
DEPRECIATION_METHOD_VALUES = {"straight_line", "declining_balance", "manual"}
CLOSING_TYPE_VALUES = {"Period", "Year"}


def _validate_status(value: str | None, allowed: set[str] = GENERIC_STATUS_VALUES) -> str | None:
    return validate_choice(value, allowed, "status")


class ScopedFinanceModel(CRMBaseModel):
    organization_id: int
    company_id: int | None = None


class FinanceMoneyMixin(CRMBaseModel):
    currency_id: int | None = None
    exchange_rate: Decimal = Field(default=1, gt=0)


class AccountTypeBase(CRMBaseModel):
    organization_id: int
    code: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=150)
    category: str
    normal_balance: str = "Debit"
    description: str | None = None
    status: str = "active"

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        return validate_choice(value, ACCOUNT_CATEGORIES, "category") or value

    @field_validator("normal_balance")
    @classmethod
    def validate_normal_balance(cls, value: str) -> str:
        return validate_choice(value, NORMAL_BALANCES, "normal_balance") or value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return _validate_status(value) or value


class AccountTypeCreate(AccountTypeBase):
    pass


class AccountTypeUpdate(CRMBaseModel):
    organization_id: int | None = None
    code: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=150)
    category: str | None = None
    normal_balance: str | None = None
    description: str | None = None
    status: str | None = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str | None) -> str | None:
        return validate_choice(value, ACCOUNT_CATEGORIES, "category")

    @field_validator("normal_balance")
    @classmethod
    def validate_normal_balance(cls, value: str | None) -> str | None:
        return validate_choice(value, NORMAL_BALANCES, "normal_balance")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return _validate_status(value)


class AccountTypeResponse(AccountTypeBase, AuditResponseMixin):
    id: int


class CurrencyBase(CRMBaseModel):
    organization_id: int
    code: str = Field(min_length=3, max_length=10)
    name: str = Field(min_length=1, max_length=150)
    symbol: str | None = Field(default=None, max_length=10)
    decimal_places: int = Field(default=2, ge=0, le=8)
    is_base: bool = False
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return _validate_status(value) or value


class CurrencyCreate(CurrencyBase):
    pass


class CurrencyUpdate(CRMBaseModel):
    organization_id: int | None = None
    code: str | None = Field(default=None, min_length=3, max_length=10)
    name: str | None = Field(default=None, min_length=1, max_length=150)
    symbol: str | None = Field(default=None, max_length=10)
    decimal_places: int | None = Field(default=None, ge=0, le=8)
    is_base: bool | None = None
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return _validate_status(value)


class CurrencyResponse(CurrencyBase, AuditResponseMixin):
    id: int


class ChartOfAccountBase(ScopedFinanceModel):
    account_type_id: int
    parent_id: int | None = None
    currency_id: int | None = None
    account_code: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=180)
    description: str | None = None
    normal_balance: str = "Debit"
    opening_balance: Decimal = Decimal("0")
    current_balance: Decimal = Decimal("0")
    allow_posting: bool = True
    is_control_account: bool = False
    is_bank_account: bool = False
    status: str = "active"
    extra_data: dict[str, Any] = Field(default_factory=dict)

    @field_validator("normal_balance")
    @classmethod
    def validate_normal_balance(cls, value: str) -> str:
        return validate_choice(value, NORMAL_BALANCES, "normal_balance") or value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return _validate_status(value) or value


class ChartOfAccountCreate(ChartOfAccountBase):
    pass


class ChartOfAccountUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    account_type_id: int | None = None
    parent_id: int | None = None
    currency_id: int | None = None
    account_code: str | None = Field(default=None, min_length=1, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=180)
    description: str | None = None
    normal_balance: str | None = None
    opening_balance: Decimal | None = None
    current_balance: Decimal | None = None
    allow_posting: bool | None = None
    is_control_account: bool | None = None
    is_bank_account: bool | None = None
    status: str | None = None
    extra_data: dict[str, Any] | None = None

    @field_validator("normal_balance")
    @classmethod
    def validate_normal_balance(cls, value: str | None) -> str | None:
        return validate_choice(value, NORMAL_BALANCES, "normal_balance")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return _validate_status(value)


class ChartOfAccountResponse(ChartOfAccountBase, AuditResponseMixin):
    id: int


class FiscalYearBase(ScopedFinanceModel):
    name: str = Field(min_length=1, max_length=120)
    start_date: date
    end_date: date
    status: str = "Open"
    is_current: bool = False
    closed_at: datetime | None = None
    closed_by: int | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, FISCAL_STATUS_VALUES, "status") or value

    @model_validator(mode="after")
    def validate_date_range(self) -> "FiscalYearBase":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class FiscalYearCreate(FiscalYearBase):
    pass


class FiscalYearUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=120)
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    is_current: bool | None = None
    closed_at: datetime | None = None
    closed_by: int | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, FISCAL_STATUS_VALUES, "status")


class FiscalYearResponse(FiscalYearBase, AuditResponseMixin):
    id: int


class FiscalPeriodBase(CRMBaseModel):
    organization_id: int
    fiscal_year_id: int
    name: str = Field(min_length=1, max_length=120)
    period_number: int = Field(gt=0)
    start_date: date
    end_date: date
    status: str = "Open"
    locked_at: datetime | None = None
    locked_by: int | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, FISCAL_STATUS_VALUES, "status") or value

    @model_validator(mode="after")
    def validate_date_range(self) -> "FiscalPeriodBase":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class FiscalPeriodCreate(FiscalPeriodBase):
    pass


class FiscalPeriodUpdate(CRMBaseModel):
    organization_id: int | None = None
    fiscal_year_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=120)
    period_number: int | None = Field(default=None, gt=0)
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    locked_at: datetime | None = None
    locked_by: int | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, FISCAL_STATUS_VALUES, "status")


class FiscalPeriodResponse(FiscalPeriodBase, AuditResponseMixin):
    id: int


class ExchangeRateBase(CRMBaseModel):
    organization_id: int
    from_currency_id: int
    to_currency_id: int
    rate: Decimal = Field(gt=0)
    rate_date: date
    source: str | None = Field(default=None, max_length=120)
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return _validate_status(value) or value


class ExchangeRateCreate(ExchangeRateBase):
    pass


class ExchangeRateUpdate(CRMBaseModel):
    organization_id: int | None = None
    from_currency_id: int | None = None
    to_currency_id: int | None = None
    rate: Decimal | None = Field(default=None, gt=0)
    rate_date: date | None = None
    source: str | None = Field(default=None, max_length=120)
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return _validate_status(value)


class ExchangeRateResponse(ExchangeRateBase, AuditResponseMixin):
    id: int


class CostCenterBase(ScopedFinanceModel):
    parent_id: int | None = None
    manager_id: int | None = None
    code: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=180)
    description: str | None = None
    allocation_percent: Decimal = Field(default=100, ge=0, le=100)
    status: str = "active"

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return _validate_status(value) or value


class CostCenterCreate(CostCenterBase):
    pass


class CostCenterUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    parent_id: int | None = None
    manager_id: int | None = None
    code: str | None = Field(default=None, min_length=1, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=180)
    description: str | None = None
    allocation_percent: Decimal | None = Field(default=None, ge=0, le=100)
    status: str | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return _validate_status(value)


class CostCenterResponse(CostCenterBase, AuditResponseMixin):
    id: int


class JournalEntryLineBase(CRMBaseModel):
    account_id: int
    cost_center_id: int | None = None
    currency_id: int | None = None
    tax_rate_id: int | None = None
    line_number: int | None = Field(default=None, gt=0)
    description: str | None = None
    debit: Decimal = Field(default=0, ge=0)
    credit: Decimal = Field(default=0, ge=0)
    exchange_rate: Decimal = Field(default=1, gt=0)
    base_debit: Decimal | None = Field(default=None, ge=0)
    base_credit: Decimal | None = Field(default=None, ge=0)
    party_type: str | None = Field(default=None, max_length=80)
    party_id: int | None = None

    @model_validator(mode="after")
    def validate_debit_credit(self) -> "JournalEntryLineBase":
        if self.debit and self.credit:
            raise ValueError("A journal line cannot contain both debit and credit")
        if not self.debit and not self.credit:
            raise ValueError("A journal line requires either debit or credit")
        return self


class JournalEntryLineCreate(JournalEntryLineBase):
    pass


class JournalEntryLineUpdate(CRMBaseModel):
    journal_entry_id: int | None = None
    account_id: int | None = None
    cost_center_id: int | None = None
    currency_id: int | None = None
    tax_rate_id: int | None = None
    line_number: int | None = Field(default=None, gt=0)
    description: str | None = None
    debit: Decimal | None = Field(default=None, ge=0)
    credit: Decimal | None = Field(default=None, ge=0)
    exchange_rate: Decimal | None = Field(default=None, gt=0)
    base_debit: Decimal | None = Field(default=None, ge=0)
    base_credit: Decimal | None = Field(default=None, ge=0)
    party_type: str | None = Field(default=None, max_length=80)
    party_id: int | None = None


class JournalEntryLineResponse(JournalEntryLineBase, AuditResponseMixin):
    id: int
    journal_entry_id: int
    line_number: int
    base_debit: Decimal
    base_credit: Decimal


class JournalEntryBase(ScopedFinanceModel, FinanceMoneyMixin):
    fiscal_year_id: int | None = None
    fiscal_period_id: int | None = None
    reversal_entry_id: int | None = None
    entry_number: str | None = Field(default=None, max_length=80)
    entry_date: datetime | None = None
    source_type: str | None = Field(default=None, max_length=80)
    source_id: int | None = None
    description: str | None = None
    total_debit: Decimal = Field(default=0, ge=0)
    total_credit: Decimal = Field(default=0, ge=0)
    status: str = "Draft"
    posted_at: datetime | None = None
    posted_by: int | None = None
    reversed_at: datetime | None = None
    reversed_by: int | None = None
    extra_data: dict[str, Any] = Field(default_factory=dict)

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, JOURNAL_STATUS_VALUES, "status") or value


class JournalEntryCreate(JournalEntryBase):
    lines: list[JournalEntryLineCreate] = Field(min_length=2)


class JournalEntryUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    fiscal_year_id: int | None = None
    fiscal_period_id: int | None = None
    currency_id: int | None = None
    reversal_entry_id: int | None = None
    entry_number: str | None = Field(default=None, max_length=80)
    entry_date: datetime | None = None
    source_type: str | None = Field(default=None, max_length=80)
    source_id: int | None = None
    description: str | None = None
    exchange_rate: Decimal | None = Field(default=None, gt=0)
    total_debit: Decimal | None = Field(default=None, ge=0)
    total_credit: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    posted_at: datetime | None = None
    posted_by: int | None = None
    reversed_at: datetime | None = None
    reversed_by: int | None = None
    extra_data: dict[str, Any] | None = None
    lines: list[JournalEntryLineCreate] | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, JOURNAL_STATUS_VALUES, "status")


class JournalEntryResponse(JournalEntryBase, AuditResponseMixin):
    id: int
    entry_number: str
    entry_date: datetime
    lines: list[JournalEntryLineResponse] = Field(default_factory=list)


class GeneralLedgerBase(ScopedFinanceModel, FinanceMoneyMixin):
    account_id: int
    journal_entry_id: int
    journal_entry_line_id: int
    fiscal_year_id: int | None = None
    fiscal_period_id: int | None = None
    cost_center_id: int | None = None
    posting_date: datetime
    description: str | None = None
    debit: Decimal = Field(default=0, ge=0)
    credit: Decimal = Field(default=0, ge=0)
    balance: Decimal = Decimal("0")
    source_type: str | None = Field(default=None, max_length=80)
    source_id: int | None = None
    status: str = "posted"


class GeneralLedgerCreate(GeneralLedgerBase):
    pass


class GeneralLedgerUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    account_id: int | None = None
    journal_entry_id: int | None = None
    journal_entry_line_id: int | None = None
    fiscal_year_id: int | None = None
    fiscal_period_id: int | None = None
    cost_center_id: int | None = None
    currency_id: int | None = None
    posting_date: datetime | None = None
    description: str | None = None
    debit: Decimal | None = Field(default=None, ge=0)
    credit: Decimal | None = Field(default=None, ge=0)
    balance: Decimal | None = None
    exchange_rate: Decimal | None = Field(default=None, gt=0)
    source_type: str | None = Field(default=None, max_length=80)
    source_id: int | None = None
    status: str | None = None


class GeneralLedgerResponse(GeneralLedgerBase, AuditResponseMixin):
    id: int


class BudgetLineBase(CRMBaseModel):
    account_id: int
    cost_center_id: int | None = None
    fiscal_period_id: int | None = None
    amount: Decimal = Field(default=0, ge=0)
    consumed_amount: Decimal = Field(default=0, ge=0)
    remaining_amount: Decimal | None = Field(default=None, ge=0)
    status: str = "active"


class BudgetLineCreate(BudgetLineBase):
    pass


class BudgetLineUpdate(CRMBaseModel):
    budget_id: int | None = None
    account_id: int | None = None
    cost_center_id: int | None = None
    fiscal_period_id: int | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    consumed_amount: Decimal | None = Field(default=None, ge=0)
    remaining_amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = None


class BudgetLineResponse(BudgetLineBase, AuditResponseMixin):
    id: int
    budget_id: int
    remaining_amount: Decimal


class BudgetBase(ScopedFinanceModel):
    fiscal_year_id: int
    currency_id: int | None = None
    name: str = Field(min_length=1, max_length=180)
    description: str | None = None
    total_amount: Decimal = Field(default=0, ge=0)
    consumed_amount: Decimal = Field(default=0, ge=0)
    status: str = "Draft"


class BudgetCreate(BudgetBase):
    lines: list[BudgetLineCreate] = Field(default_factory=list)


class BudgetUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    fiscal_year_id: int | None = None
    currency_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=180)
    description: str | None = None
    total_amount: Decimal | None = Field(default=None, ge=0)
    consumed_amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    lines: list[BudgetLineCreate] | None = None


class BudgetResponse(BudgetBase, AuditResponseMixin):
    id: int
    lines: list[BudgetLineResponse] = Field(default_factory=list)


class BankAccountBase(ScopedFinanceModel):
    account_id: int
    currency_id: int | None = None
    bank_name: str = Field(min_length=1, max_length=180)
    account_name: str = Field(min_length=1, max_length=180)
    account_number: str = Field(min_length=1, max_length=120)
    iban: str | None = Field(default=None, max_length=120)
    swift_code: str | None = Field(default=None, max_length=50)
    opening_balance: Decimal = Decimal("0")
    current_balance: Decimal = Decimal("0")
    status: str = "active"


class BankAccountCreate(BankAccountBase):
    pass


class BankAccountUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    account_id: int | None = None
    currency_id: int | None = None
    bank_name: str | None = Field(default=None, min_length=1, max_length=180)
    account_name: str | None = Field(default=None, min_length=1, max_length=180)
    account_number: str | None = Field(default=None, min_length=1, max_length=120)
    iban: str | None = Field(default=None, max_length=120)
    swift_code: str | None = Field(default=None, max_length=50)
    opening_balance: Decimal | None = None
    current_balance: Decimal | None = None
    status: str | None = None


class BankAccountResponse(BankAccountBase, AuditResponseMixin):
    id: int


class BankTransactionBase(CRMBaseModel):
    organization_id: int
    bank_account_id: int
    journal_entry_id: int | None = None
    transaction_date: datetime
    value_date: datetime | None = None
    reference: str | None = Field(default=None, max_length=120)
    description: str | None = None
    transaction_type: str
    amount: Decimal = Field(ge=0)
    reconciled_amount: Decimal = Field(default=0, ge=0)
    is_reconciled: bool = False
    reconciled_at: datetime | None = None
    status: str = "unmatched"

    @field_validator("transaction_type")
    @classmethod
    def validate_transaction_type(cls, value: str) -> str:
        return validate_choice(value, TRANSACTION_TYPE_VALUES, "transaction_type") or value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        return validate_choice(value, RECONCILIATION_STATUS_VALUES, "status") or value


class BankTransactionCreate(BankTransactionBase):
    pass


class BankTransactionUpdate(CRMBaseModel):
    organization_id: int | None = None
    bank_account_id: int | None = None
    journal_entry_id: int | None = None
    transaction_date: datetime | None = None
    value_date: datetime | None = None
    reference: str | None = Field(default=None, max_length=120)
    description: str | None = None
    transaction_type: str | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    reconciled_amount: Decimal | None = Field(default=None, ge=0)
    is_reconciled: bool | None = None
    reconciled_at: datetime | None = None
    status: str | None = None

    @field_validator("transaction_type")
    @classmethod
    def validate_transaction_type(cls, value: str | None) -> str | None:
        return validate_choice(value, TRANSACTION_TYPE_VALUES, "transaction_type")

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str | None) -> str | None:
        return validate_choice(value, RECONCILIATION_STATUS_VALUES, "status")


class BankTransactionResponse(BankTransactionBase, AuditResponseMixin):
    id: int


class ExpenseCategoryBase(CRMBaseModel):
    organization_id: int
    account_id: int | None = None
    code: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=180)
    description: str | None = None
    status: str = "active"


class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass


class ExpenseCategoryUpdate(CRMBaseModel):
    organization_id: int | None = None
    account_id: int | None = None
    code: str | None = Field(default=None, min_length=1, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=180)
    description: str | None = None
    status: str | None = None


class ExpenseCategoryResponse(ExpenseCategoryBase, AuditResponseMixin):
    id: int


class ExpenseBase(ScopedFinanceModel):
    expense_category_id: int
    account_id: int | None = None
    payment_term_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    expense_number: str | None = Field(default=None, max_length=80)
    expense_date: datetime | None = None
    due_date: datetime | None = None
    vendor_name: str | None = Field(default=None, max_length=180)
    description: str | None = None
    subtotal: Decimal = Field(default=0, ge=0)
    tax_total: Decimal = Field(default=0, ge=0)
    total_amount: Decimal = Field(default=0, ge=0)
    paid_amount: Decimal = Field(default=0, ge=0)
    status: str = "Draft"
    extra_data: dict[str, Any] = Field(default_factory=dict)


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    expense_category_id: int | None = None
    account_id: int | None = None
    payment_term_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    expense_number: str | None = Field(default=None, max_length=80)
    expense_date: datetime | None = None
    due_date: datetime | None = None
    vendor_name: str | None = Field(default=None, max_length=180)
    description: str | None = None
    subtotal: Decimal | None = Field(default=None, ge=0)
    tax_total: Decimal | None = Field(default=None, ge=0)
    total_amount: Decimal | None = Field(default=None, ge=0)
    paid_amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    extra_data: dict[str, Any] | None = None


class ExpenseResponse(ExpenseBase, AuditResponseMixin):
    id: int
    expense_number: str
    expense_date: datetime


class VendorBillBase(ScopedFinanceModel):
    supplier_id: int | None = None
    payment_term_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    bill_number: str = Field(min_length=1, max_length=80)
    bill_date: datetime | None = None
    due_date: datetime | None = None
    subtotal: Decimal = Field(default=0, ge=0)
    tax_total: Decimal = Field(default=0, ge=0)
    discount_total: Decimal = Field(default=0, ge=0)
    total_amount: Decimal = Field(default=0, ge=0)
    paid_amount: Decimal = Field(default=0, ge=0)
    balance_due: Decimal = Field(default=0, ge=0)
    status: str = "Draft"
    notes: str | None = None
    extra_data: dict[str, Any] = Field(default_factory=dict)


class VendorBillCreate(VendorBillBase):
    pass


class VendorBillUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    supplier_id: int | None = None
    payment_term_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    bill_number: str | None = Field(default=None, min_length=1, max_length=80)
    bill_date: datetime | None = None
    due_date: datetime | None = None
    subtotal: Decimal | None = Field(default=None, ge=0)
    tax_total: Decimal | None = Field(default=None, ge=0)
    discount_total: Decimal | None = Field(default=None, ge=0)
    total_amount: Decimal | None = Field(default=None, ge=0)
    paid_amount: Decimal | None = Field(default=None, ge=0)
    balance_due: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    notes: str | None = None
    extra_data: dict[str, Any] | None = None


class VendorBillResponse(VendorBillBase, AuditResponseMixin):
    id: int
    bill_date: datetime


class CreditNoteBase(ScopedFinanceModel):
    supplier_id: int | None = None
    customer_id: int | None = None
    vendor_bill_id: int | None = None
    invoice_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    credit_note_number: str = Field(min_length=1, max_length=80)
    credit_date: datetime | None = None
    amount: Decimal = Field(default=0, ge=0)
    tax_amount: Decimal = Field(default=0, ge=0)
    status: str = "Draft"
    reason: str | None = None


class VendorCreditNoteCreate(CreditNoteBase):
    customer_id: None = None
    invoice_id: None = None


class VendorCreditNoteUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    supplier_id: int | None = None
    vendor_bill_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    credit_note_number: str | None = Field(default=None, min_length=1, max_length=80)
    credit_date: datetime | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    tax_amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    reason: str | None = None


class VendorCreditNoteResponse(CreditNoteBase, AuditResponseMixin):
    id: int
    credit_date: datetime


class CustomerCreditNoteCreate(CreditNoteBase):
    supplier_id: None = None
    vendor_bill_id: None = None


class CustomerCreditNoteUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    customer_id: int | None = None
    invoice_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    credit_note_number: str | None = Field(default=None, min_length=1, max_length=80)
    credit_date: datetime | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    tax_amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    reason: str | None = None


class CustomerCreditNoteResponse(CreditNoteBase, AuditResponseMixin):
    id: int
    credit_date: datetime


class DebitNoteBase(ScopedFinanceModel):
    supplier_id: int | None = None
    customer_id: int | None = None
    vendor_bill_id: int | None = None
    invoice_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    debit_note_number: str = Field(min_length=1, max_length=80)
    debit_date: datetime | None = None
    amount: Decimal = Field(default=0, ge=0)
    tax_amount: Decimal = Field(default=0, ge=0)
    status: str = "Draft"
    reason: str | None = None


class DebitNoteCreate(DebitNoteBase):
    pass


class DebitNoteUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    supplier_id: int | None = None
    customer_id: int | None = None
    vendor_bill_id: int | None = None
    invoice_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    debit_note_number: str | None = Field(default=None, min_length=1, max_length=80)
    debit_date: datetime | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    tax_amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    reason: str | None = None


class DebitNoteResponse(DebitNoteBase, AuditResponseMixin):
    id: int
    debit_date: datetime


class PaymentAllocationBase(ScopedFinanceModel, FinanceMoneyMixin):
    payment_id: int | None = None
    invoice_id: int | None = None
    vendor_bill_id: int | None = None
    expense_id: int | None = None
    allocation_date: datetime | None = None
    amount: Decimal = Field(gt=0)
    status: str = "allocated"
    notes: str | None = None


class PaymentAllocationCreate(PaymentAllocationBase):
    pass


class PaymentAllocationUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    payment_id: int | None = None
    invoice_id: int | None = None
    vendor_bill_id: int | None = None
    expense_id: int | None = None
    currency_id: int | None = None
    allocation_date: datetime | None = None
    amount: Decimal | None = Field(default=None, gt=0)
    exchange_rate: Decimal | None = Field(default=None, gt=0)
    status: str | None = None
    notes: str | None = None


class PaymentAllocationResponse(PaymentAllocationBase, AuditResponseMixin):
    id: int
    allocation_date: datetime


class RecurringJournalBase(ScopedFinanceModel):
    template_entry_id: int | None = None
    name: str = Field(min_length=1, max_length=180)
    frequency: str
    start_date: date
    end_date: date | None = None
    next_run_date: date
    last_run_date: date | None = None
    auto_post: bool = False
    payload: dict[str, Any] = Field(default_factory=dict)
    status: str = "active"

    @field_validator("frequency")
    @classmethod
    def validate_frequency(cls, value: str) -> str:
        return validate_choice(value, FREQUENCY_VALUES, "frequency") or value


class RecurringJournalCreate(RecurringJournalBase):
    pass


class RecurringJournalUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    template_entry_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=180)
    frequency: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    next_run_date: date | None = None
    last_run_date: date | None = None
    auto_post: bool | None = None
    payload: dict[str, Any] | None = None
    status: str | None = None

    @field_validator("frequency")
    @classmethod
    def validate_frequency(cls, value: str | None) -> str | None:
        return validate_choice(value, FREQUENCY_VALUES, "frequency")


class RecurringJournalResponse(RecurringJournalBase, AuditResponseMixin):
    id: int


class TaxRateBase(CRMBaseModel):
    organization_id: int
    account_id: int | None = None
    recoverable_account_id: int | None = None
    code: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=180)
    tax_type: str
    rate: Decimal = Field(ge=0, le=100)
    effective_from: date | None = None
    effective_to: date | None = None
    country: str | None = Field(default=None, max_length=100)
    region: str | None = Field(default=None, max_length=120)
    is_compound: bool = False
    status: str = "active"

    @field_validator("tax_type")
    @classmethod
    def validate_tax_type(cls, value: str) -> str:
        return validate_choice(value, TAX_TYPE_VALUES, "tax_type") or value


class TaxRateCreate(TaxRateBase):
    pass


class TaxRateUpdate(CRMBaseModel):
    organization_id: int | None = None
    account_id: int | None = None
    recoverable_account_id: int | None = None
    code: str | None = Field(default=None, min_length=1, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=180)
    tax_type: str | None = None
    rate: Decimal | None = Field(default=None, ge=0, le=100)
    effective_from: date | None = None
    effective_to: date | None = None
    country: str | None = Field(default=None, max_length=100)
    region: str | None = Field(default=None, max_length=120)
    is_compound: bool | None = None
    status: str | None = None

    @field_validator("tax_type")
    @classmethod
    def validate_tax_type(cls, value: str | None) -> str | None:
        return validate_choice(value, TAX_TYPE_VALUES, "tax_type")


class TaxRateResponse(TaxRateBase, AuditResponseMixin):
    id: int


class TaxGroupBase(CRMBaseModel):
    organization_id: int
    code: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=180)
    tax_rate_ids: list[int] = Field(default_factory=list)
    description: str | None = None
    status: str = "active"


class TaxGroupCreate(TaxGroupBase):
    pass


class TaxGroupUpdate(CRMBaseModel):
    organization_id: int | None = None
    code: str | None = Field(default=None, min_length=1, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=180)
    tax_rate_ids: list[int] | None = None
    description: str | None = None
    status: str | None = None


class TaxGroupResponse(TaxGroupBase, AuditResponseMixin):
    id: int


class PaymentTermBase(CRMBaseModel):
    organization_id: int
    code: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=180)
    days: int = Field(default=0, ge=0)
    discount_days: int = Field(default=0, ge=0)
    discount_percent: Decimal = Field(default=0, ge=0, le=100)
    description: str | None = None
    status: str = "active"


class PaymentTermCreate(PaymentTermBase):
    pass


class PaymentTermUpdate(CRMBaseModel):
    organization_id: int | None = None
    code: str | None = Field(default=None, min_length=1, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=180)
    days: int | None = Field(default=None, ge=0)
    discount_days: int | None = Field(default=None, ge=0)
    discount_percent: Decimal | None = Field(default=None, ge=0, le=100)
    description: str | None = None
    status: str | None = None


class PaymentTermResponse(PaymentTermBase, AuditResponseMixin):
    id: int


class PaymentScheduleBase(CRMBaseModel):
    organization_id: int
    payment_term_id: int | None = None
    invoice_id: int | None = None
    vendor_bill_id: int | None = None
    due_date: datetime
    amount: Decimal = Field(ge=0)
    paid_amount: Decimal = Field(default=0, ge=0)
    status: str = "pending"
    notes: str | None = None


class PaymentScheduleCreate(PaymentScheduleBase):
    pass


class PaymentScheduleUpdate(CRMBaseModel):
    organization_id: int | None = None
    payment_term_id: int | None = None
    invoice_id: int | None = None
    vendor_bill_id: int | None = None
    due_date: datetime | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    paid_amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    notes: str | None = None


class PaymentScheduleResponse(PaymentScheduleBase, AuditResponseMixin):
    id: int


class AssetCategoryBase(CRMBaseModel):
    organization_id: int
    asset_account_id: int | None = None
    depreciation_account_id: int | None = None
    accumulated_depreciation_account_id: int | None = None
    code: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=180)
    useful_life_months: int = Field(default=36, gt=0)
    depreciation_method: str = "straight_line"
    status: str = "active"

    @field_validator("depreciation_method")
    @classmethod
    def validate_method(cls, value: str) -> str:
        return validate_choice(value, DEPRECIATION_METHOD_VALUES, "depreciation_method") or value


class AssetCategoryCreate(AssetCategoryBase):
    pass


class AssetCategoryUpdate(CRMBaseModel):
    organization_id: int | None = None
    asset_account_id: int | None = None
    depreciation_account_id: int | None = None
    accumulated_depreciation_account_id: int | None = None
    code: str | None = Field(default=None, min_length=1, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=180)
    useful_life_months: int | None = Field(default=None, gt=0)
    depreciation_method: str | None = None
    status: str | None = None

    @field_validator("depreciation_method")
    @classmethod
    def validate_method(cls, value: str | None) -> str | None:
        return validate_choice(value, DEPRECIATION_METHOD_VALUES, "depreciation_method")


class AssetCategoryResponse(AssetCategoryBase, AuditResponseMixin):
    id: int


class AssetBase(ScopedFinanceModel):
    asset_category_id: int
    currency_id: int | None = None
    journal_entry_id: int | None = None
    asset_number: str | None = Field(default=None, max_length=80)
    name: str = Field(min_length=1, max_length=180)
    acquisition_date: date
    acquisition_cost: Decimal = Field(ge=0)
    salvage_value: Decimal = Field(default=0, ge=0)
    useful_life_months: int = Field(gt=0)
    depreciation_method: str = "straight_line"
    accumulated_depreciation: Decimal = Field(default=0, ge=0)
    book_value: Decimal | None = Field(default=None, ge=0)
    status: str = "active"
    notes: str | None = None

    @field_validator("depreciation_method")
    @classmethod
    def validate_method(cls, value: str) -> str:
        return validate_choice(value, DEPRECIATION_METHOD_VALUES, "depreciation_method") or value


class AssetCreate(AssetBase):
    pass


class AssetUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    asset_category_id: int | None = None
    currency_id: int | None = None
    journal_entry_id: int | None = None
    asset_number: str | None = Field(default=None, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=180)
    acquisition_date: date | None = None
    acquisition_cost: Decimal | None = Field(default=None, ge=0)
    salvage_value: Decimal | None = Field(default=None, ge=0)
    useful_life_months: int | None = Field(default=None, gt=0)
    depreciation_method: str | None = None
    accumulated_depreciation: Decimal | None = Field(default=None, ge=0)
    book_value: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    notes: str | None = None

    @field_validator("depreciation_method")
    @classmethod
    def validate_method(cls, value: str | None) -> str | None:
        return validate_choice(value, DEPRECIATION_METHOD_VALUES, "depreciation_method")


class AssetResponse(AssetBase, AuditResponseMixin):
    id: int
    asset_number: str
    book_value: Decimal


class DepreciationEntryBase(CRMBaseModel):
    organization_id: int
    asset_id: int
    fiscal_period_id: int | None = None
    journal_entry_id: int | None = None
    depreciation_date: date
    amount: Decimal = Field(ge=0)
    accumulated_depreciation: Decimal = Field(default=0, ge=0)
    book_value: Decimal = Field(default=0, ge=0)
    status: str = "posted"
    notes: str | None = None


class DepreciationEntryCreate(DepreciationEntryBase):
    pass


class DepreciationEntryUpdate(CRMBaseModel):
    organization_id: int | None = None
    asset_id: int | None = None
    fiscal_period_id: int | None = None
    journal_entry_id: int | None = None
    depreciation_date: date | None = None
    amount: Decimal | None = Field(default=None, ge=0)
    accumulated_depreciation: Decimal | None = Field(default=None, ge=0)
    book_value: Decimal | None = Field(default=None, ge=0)
    status: str | None = None
    notes: str | None = None


class DepreciationEntryResponse(DepreciationEntryBase, AuditResponseMixin):
    id: int


class FinancialClosingBase(ScopedFinanceModel):
    fiscal_year_id: int | None = None
    fiscal_period_id: int | None = None
    retained_earnings_account_id: int | None = None
    income_summary_account_id: int | None = None
    closing_entry_id: int | None = None
    closing_date: datetime | None = None
    closing_type: str
    status: str = "Draft"
    notes: str | None = None
    closed_by: int | None = None

    @field_validator("closing_type")
    @classmethod
    def validate_closing_type(cls, value: str) -> str:
        return validate_choice(value, CLOSING_TYPE_VALUES, "closing_type") or value


class FinancialClosingCreate(FinancialClosingBase):
    pass


class FinancialClosingUpdate(CRMBaseModel):
    organization_id: int | None = None
    company_id: int | None = None
    fiscal_year_id: int | None = None
    fiscal_period_id: int | None = None
    retained_earnings_account_id: int | None = None
    income_summary_account_id: int | None = None
    closing_entry_id: int | None = None
    closing_date: datetime | None = None
    closing_type: str | None = None
    status: str | None = None
    notes: str | None = None
    closed_by: int | None = None

    @field_validator("closing_type")
    @classmethod
    def validate_closing_type(cls, value: str | None) -> str | None:
        return validate_choice(value, CLOSING_TYPE_VALUES, "closing_type")


class FinancialClosingResponse(FinancialClosingBase, AuditResponseMixin):
    id: int
    closing_date: datetime


class AuditLogBase(CRMBaseModel):
    organization_id: int
    user_id: int | None = None
    entity_type: str = Field(min_length=1, max_length=120)
    entity_id: int | None = None
    action: str = Field(min_length=1, max_length=80)
    old_values: dict[str, Any] | None = None
    new_values: dict[str, Any] | None = None
    ip_address: str | None = Field(default=None, max_length=80)
    user_agent: str | None = Field(default=None, max_length=500)
    description: str | None = None
    occurred_at: datetime | None = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogUpdate(CRMBaseModel):
    organization_id: int | None = None
    user_id: int | None = None
    entity_type: str | None = Field(default=None, min_length=1, max_length=120)
    entity_id: int | None = None
    action: str | None = Field(default=None, min_length=1, max_length=80)
    old_values: dict[str, Any] | None = None
    new_values: dict[str, Any] | None = None
    ip_address: str | None = Field(default=None, max_length=80)
    user_agent: str | None = Field(default=None, max_length=500)
    description: str | None = None
    occurred_at: datetime | None = None


class AuditLogResponse(AuditLogBase, AuditResponseMixin):
    id: int
    occurred_at: datetime


AccountTypeSingleResponse = APIResponse[AccountTypeResponse]
AccountTypeListResponse = APIResponse[PaginatedResponse[AccountTypeResponse]]
ChartOfAccountSingleResponse = APIResponse[ChartOfAccountResponse]
ChartOfAccountListResponse = APIResponse[PaginatedResponse[ChartOfAccountResponse]]
CurrencySingleResponse = APIResponse[CurrencyResponse]
CurrencyListResponse = APIResponse[PaginatedResponse[CurrencyResponse]]
ExchangeRateSingleResponse = APIResponse[ExchangeRateResponse]
ExchangeRateListResponse = APIResponse[PaginatedResponse[ExchangeRateResponse]]
FiscalYearSingleResponse = APIResponse[FiscalYearResponse]
FiscalYearListResponse = APIResponse[PaginatedResponse[FiscalYearResponse]]
FiscalPeriodSingleResponse = APIResponse[FiscalPeriodResponse]
FiscalPeriodListResponse = APIResponse[PaginatedResponse[FiscalPeriodResponse]]
CostCenterSingleResponse = APIResponse[CostCenterResponse]
CostCenterListResponse = APIResponse[PaginatedResponse[CostCenterResponse]]
JournalEntrySingleResponse = APIResponse[JournalEntryResponse]
JournalEntryListResponse = APIResponse[PaginatedResponse[JournalEntryResponse]]
GeneralLedgerSingleResponse = APIResponse[GeneralLedgerResponse]
GeneralLedgerListResponse = APIResponse[PaginatedResponse[GeneralLedgerResponse]]
BudgetSingleResponse = APIResponse[BudgetResponse]
BudgetListResponse = APIResponse[PaginatedResponse[BudgetResponse]]
BankAccountSingleResponse = APIResponse[BankAccountResponse]
BankAccountListResponse = APIResponse[PaginatedResponse[BankAccountResponse]]
BankTransactionSingleResponse = APIResponse[BankTransactionResponse]
BankTransactionListResponse = APIResponse[PaginatedResponse[BankTransactionResponse]]
PaymentAllocationSingleResponse = APIResponse[PaymentAllocationResponse]
PaymentAllocationListResponse = APIResponse[PaginatedResponse[PaymentAllocationResponse]]
ExpenseCategorySingleResponse = APIResponse[ExpenseCategoryResponse]
ExpenseCategoryListResponse = APIResponse[PaginatedResponse[ExpenseCategoryResponse]]
ExpenseSingleResponse = APIResponse[ExpenseResponse]
ExpenseListResponse = APIResponse[PaginatedResponse[ExpenseResponse]]
VendorBillSingleResponse = APIResponse[VendorBillResponse]
VendorBillListResponse = APIResponse[PaginatedResponse[VendorBillResponse]]
VendorCreditNoteSingleResponse = APIResponse[VendorCreditNoteResponse]
VendorCreditNoteListResponse = APIResponse[PaginatedResponse[VendorCreditNoteResponse]]
CustomerCreditNoteSingleResponse = APIResponse[CustomerCreditNoteResponse]
CustomerCreditNoteListResponse = APIResponse[PaginatedResponse[CustomerCreditNoteResponse]]
DebitNoteSingleResponse = APIResponse[DebitNoteResponse]
DebitNoteListResponse = APIResponse[PaginatedResponse[DebitNoteResponse]]
RecurringJournalSingleResponse = APIResponse[RecurringJournalResponse]
RecurringJournalListResponse = APIResponse[PaginatedResponse[RecurringJournalResponse]]
TaxRateSingleResponse = APIResponse[TaxRateResponse]
TaxRateListResponse = APIResponse[PaginatedResponse[TaxRateResponse]]
TaxGroupSingleResponse = APIResponse[TaxGroupResponse]
TaxGroupListResponse = APIResponse[PaginatedResponse[TaxGroupResponse]]
PaymentTermSingleResponse = APIResponse[PaymentTermResponse]
PaymentTermListResponse = APIResponse[PaginatedResponse[PaymentTermResponse]]
PaymentScheduleSingleResponse = APIResponse[PaymentScheduleResponse]
PaymentScheduleListResponse = APIResponse[PaginatedResponse[PaymentScheduleResponse]]
AssetCategorySingleResponse = APIResponse[AssetCategoryResponse]
AssetCategoryListResponse = APIResponse[PaginatedResponse[AssetCategoryResponse]]
AssetSingleResponse = APIResponse[AssetResponse]
AssetListResponse = APIResponse[PaginatedResponse[AssetResponse]]
DepreciationEntrySingleResponse = APIResponse[DepreciationEntryResponse]
DepreciationEntryListResponse = APIResponse[PaginatedResponse[DepreciationEntryResponse]]
FinancialClosingSingleResponse = APIResponse[FinancialClosingResponse]
FinancialClosingListResponse = APIResponse[PaginatedResponse[FinancialClosingResponse]]
AuditLogSingleResponse = APIResponse[AuditLogResponse]
AuditLogListResponse = APIResponse[PaginatedResponse[AuditLogResponse]]
