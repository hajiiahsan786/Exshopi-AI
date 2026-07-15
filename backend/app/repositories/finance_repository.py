from __future__ import annotations
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Generic, TypeVar, List

from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Query, Session

from app.models.finance import (
    AccountType,
    Asset,
    AssetCategory,
    AuditLog,
    BankAccount,
    BankTransaction,
    Budget,
    BudgetLine,
    ChartOfAccount,
    CostCenter,
    Currency,
    CustomerCreditNote,
    DebitNote,
    DepreciationEntry,
    ExchangeRate,
    Expense,
    ExpenseCategory,
    FinancialClosing,
    FiscalPeriod,
    FiscalYear,
    GeneralLedger,
    JournalEntry,
    JournalEntryLine,
    PaymentAllocation,
    PaymentSchedule,
    PaymentTerm,
    RecurringJournal,
    TaxGroup,
    TaxRate,
    VendorBill,
    VendorCreditNote,
)
from app.repositories.crm_repository import CRMRepository

ModelT = TypeVar("ModelT")


class FinanceRepository(CRMRepository[ModelT], Generic[ModelT]):
    sortable_fields = CRMRepository.sortable_fields | {
        "account_code",
        "account_id",
        "account_type_id",
        "action",
        "amount",
        "asset_number",
        "balance",
        "balance_due",
        "bank_account_id",
        "bank_name",
        "bill_date",
        "bill_number",
        "book_value",
        "category",
        "closing_date",
        "closing_type",
        "code",
        "company_id",
        "credit_date",
        "credit_note_number",
        "currency_id",
        "debit",
        "debit_date",
        "debit_note_number",
        "due_date",
        "entry_date",
        "entry_number",
        "expense_date",
        "expense_number",
        "fiscal_period_id",
        "fiscal_year_id",
        "is_base",
        "is_reconciled",
        "name",
        "organization_id",
        "period_number",
        "posting_date",
        "rate",
        "rate_date",
        "reference",
        "source_id",
        "source_type",
        "status",
        "total_amount",
        "total_credit",
        "total_debit",
        "transaction_date",
        "transaction_type",
    }

    date_fields = (
        "entry_date",
        "posting_date",
        "transaction_date",
        "expense_date",
        "bill_date",
        "credit_date",
        "debit_date",
        "closing_date",
        "rate_date",
        "due_date",
        "created_at",
        "occurred_at",
    )

    @staticmethod
    def _has_value(value: Any) -> bool:
        return value is not None and value != ""

    @classmethod
    def _range_filter(
        cls,
        query: Query,
        field_name: str,
        minimum: Decimal | int | None,
        maximum: Decimal | int | None,
    ) -> Query:
        if hasattr(cls.model, field_name):
            field = getattr(cls.model, field_name)
            if minimum is not None:
                query = query.filter(field >= minimum)
            if maximum is not None:
                query = query.filter(field <= maximum)
        return query

    @classmethod
    def _date_filter(
        cls,
        query: Query,
        date_from: date | datetime | None,
        date_to: date | datetime | None,
    ) -> Query:
        if date_from is None and date_to is None:
            return query

        for field_name in cls.date_fields:
            if hasattr(cls.model, field_name):
                field = getattr(cls.model, field_name)
                if date_from is not None:
                    query = query.filter(field >= date_from)
                if date_to is not None:
                    query = query.filter(field <= date_to)
                break
        return query

    @classmethod
    def _apply_filters(cls, query: Query, filters: dict[str, Any] | None) -> Query:
        if not filters:
            return query

        query = cls._range_filter(query, "amount", filters.get("amount_min"), filters.get("amount_max"))
        query = cls._range_filter(query, "total_amount", filters.get("amount_min"), filters.get("amount_max"))
        query = cls._range_filter(query, "total_debit", filters.get("debit_min"), filters.get("debit_max"))
        query = cls._range_filter(query, "total_credit", filters.get("credit_min"), filters.get("credit_max"))
        query = cls._date_filter(query, filters.get("date_from"), filters.get("date_to"))

        ignored = {
            "amount_min",
            "amount_max",
            "credit_min",
            "credit_max",
            "date_from",
            "date_to",
            "debit_min",
            "debit_max",
        }
        for field_name, value in filters.items():
            if field_name in ignored or not cls._has_value(value):
                continue
            if hasattr(cls.model, field_name):
                query = query.filter(getattr(cls.model, field_name) == value)
        return query

    @classmethod
    def list(
        cls,
        db: Session,
        *,
        search: str | None = None,
        status: str | None = None,
        tags: str | None = None,
        filters: dict[str, Any] | None = None,
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        include_deleted: bool = False,
    ) -> tuple[List[ModelT], int]:
        del tags
        query = cls.base_query(db, include_deleted)
        query = cls._apply_filters(query, filters)

        if status and hasattr(cls.model, "status"):
            query = query.filter(cls.model.status == status)

        if search:
            pattern = f"%{search}%"
            clauses = []
            for field_name in cls.search_fields:
                if hasattr(cls.model, field_name):
                    clauses.append(getattr(cls.model, field_name).ilike(pattern))
            if clauses:
                query = query.filter(or_(*clauses))

        total = query.with_entities(func.count(cls.model.id)).scalar() or 0
        order_field_name = sort_by if sort_by in cls.sortable_fields else "created_at"
        order_field = getattr(cls.model, order_field_name, cls.model.id)
        query = query.order_by(asc(order_field) if sort_order == "asc" else desc(order_field))
        query = query.offset((page - 1) * page_size).limit(page_size)
        return query.all(), total

    @classmethod
    def bulk_get(cls, db: Session, ids: List[int], include_deleted: bool = False) -> List[ModelT]:
        return cls.base_query(db, include_deleted).filter(cls.model.id.in_(ids)).all()


class AccountTypeRepository(FinanceRepository[AccountType]):
    model = AccountType
    search_fields = ("code", "name", "category", "normal_balance", "status")


class ChartOfAccountRepository(FinanceRepository[ChartOfAccount]):
    model = ChartOfAccount
    search_fields = ("account_code", "name", "description", "normal_balance", "status")


class CurrencyRepository(FinanceRepository[Currency]):
    model = Currency
    search_fields = ("code", "name", "symbol", "status")


class ExchangeRateRepository(FinanceRepository[ExchangeRate]):
    model = ExchangeRate
    search_fields = ("source", "status")


class FiscalYearRepository(FinanceRepository[FiscalYear]):
    model = FiscalYear
    search_fields = ("name", "status")


class FiscalPeriodRepository(FinanceRepository[FiscalPeriod]):
    model = FiscalPeriod
    search_fields = ("name", "status")


class CostCenterRepository(FinanceRepository[CostCenter]):
    model = CostCenter
    search_fields = ("code", "name", "description", "status")


class JournalEntryRepository(FinanceRepository[JournalEntry]):
    model = JournalEntry
    search_fields = ("entry_number", "source_type", "description", "status")


class JournalEntryLineRepository(FinanceRepository[JournalEntryLine]):
    model = JournalEntryLine
    search_fields = ("description", "party_type")


class GeneralLedgerRepository(FinanceRepository[GeneralLedger]):
    model = GeneralLedger
    search_fields = ("description", "source_type", "status")


class BudgetRepository(FinanceRepository[Budget]):
    model = Budget
    search_fields = ("name", "description", "status")


class BudgetLineRepository(FinanceRepository[BudgetLine]):
    model = BudgetLine
    search_fields = ("status",)


class BankAccountRepository(FinanceRepository[BankAccount]):
    model = BankAccount
    search_fields = ("bank_name", "account_name", "account_number", "iban", "swift_code", "status")


class BankTransactionRepository(FinanceRepository[BankTransaction]):
    model = BankTransaction
    search_fields = ("reference", "description", "transaction_type", "status")


class PaymentAllocationRepository(FinanceRepository[PaymentAllocation]):
    model = PaymentAllocation
    search_fields = ("status", "notes")


class ExpenseCategoryRepository(FinanceRepository[ExpenseCategory]):
    model = ExpenseCategory
    search_fields = ("code", "name", "description", "status")


class ExpenseRepository(FinanceRepository[Expense]):
    model = Expense
    search_fields = ("expense_number", "vendor_name", "description", "status")


class VendorBillRepository(FinanceRepository[VendorBill]):
    model = VendorBill
    search_fields = ("bill_number", "notes", "status")


class VendorCreditNoteRepository(FinanceRepository[VendorCreditNote]):
    model = VendorCreditNote
    search_fields = ("credit_note_number", "reason", "status")


class CustomerCreditNoteRepository(FinanceRepository[CustomerCreditNote]):
    model = CustomerCreditNote
    search_fields = ("credit_note_number", "reason", "status")


class DebitNoteRepository(FinanceRepository[DebitNote]):
    model = DebitNote
    search_fields = ("debit_note_number", "reason", "status")


class RecurringJournalRepository(FinanceRepository[RecurringJournal]):
    model = RecurringJournal
    search_fields = ("name", "frequency", "status")


class TaxRateRepository(FinanceRepository[TaxRate]):
    model = TaxRate
    search_fields = ("code", "name", "tax_type", "country", "region", "status")


class TaxGroupRepository(FinanceRepository[TaxGroup]):
    model = TaxGroup
    search_fields = ("code", "name", "description", "status")


class PaymentTermRepository(FinanceRepository[PaymentTerm]):
    model = PaymentTerm
    search_fields = ("code", "name", "description", "status")


class PaymentScheduleRepository(FinanceRepository[PaymentSchedule]):
    model = PaymentSchedule
    search_fields = ("status", "notes")


class AssetCategoryRepository(FinanceRepository[AssetCategory]):
    model = AssetCategory
    search_fields = ("code", "name", "depreciation_method", "status")


class AssetRepository(FinanceRepository[Asset]):
    model = Asset
    search_fields = ("asset_number", "name", "depreciation_method", "status", "notes")


class DepreciationEntryRepository(FinanceRepository[DepreciationEntry]):
    model = DepreciationEntry
    search_fields = ("status", "notes")


class FinancialClosingRepository(FinanceRepository[FinancialClosing]):
    model = FinancialClosing
    search_fields = ("closing_type", "status", "notes")


class AuditLogRepository(FinanceRepository[AuditLog]):
    model = AuditLog
    search_fields = ("entity_type", "action", "description", "ip_address", "user_agent")
