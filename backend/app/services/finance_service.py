from __future__ import annotations
import csv
import io
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.customer import Customer
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
    PaymentTerm,
    RecurringJournal,
    TaxGroup,
    TaxRate,
    VendorBill,
)
from app.models.inventory import Supplier
from app.models.organization import Organization
from app.models.sales import Invoice, Payment
from app.models.user import User
from app.repositories.finance_repository import (
    AccountTypeRepository,
    AssetCategoryRepository,
    AssetRepository,
    AuditLogRepository,
    BankAccountRepository,
    BankTransactionRepository,
    BudgetRepository,
    ChartOfAccountRepository,
    CostCenterRepository,
    CurrencyRepository,
    CustomerCreditNoteRepository,
    DebitNoteRepository,
    DepreciationEntryRepository,
    ExchangeRateRepository,
    ExpenseCategoryRepository,
    ExpenseRepository,
    FinanceRepository,
    FinancialClosingRepository,
    FiscalPeriodRepository,
    FiscalYearRepository,
    GeneralLedgerRepository,
    JournalEntryRepository,
    PaymentAllocationRepository,
    PaymentScheduleRepository,
    PaymentTermRepository,
    RecurringJournalRepository,
    TaxGroupRepository,
    TaxRateRepository,
    VendorBillRepository,
    VendorCreditNoteRepository,
)
from app.schemas.crm_common import PaginatedResponse
from app.schemas.finance import JournalEntryCreate, JournalEntryLineCreate
from app.services.inventory_service import build_xlsx, generate_identifier, normalize_payload, serialize_export_value


def decimal_or_zero(value: Any) -> Decimal:
    if value is None:
        return Decimal("0")
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))


def quantize_money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.0001"))


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class BaseFinanceService:
    repository: type[FinanceRepository]
    entity_name = "Finance entity"
    required_fields: tuple[str, ...] = ()
    scoped_unique_fields: tuple[str, ...] = ()
    export_fields: tuple[str, ...] = ("id", "uuid", "organization_id", "status", "created_at", "updated_at")
    foreign_keys: dict[str, type[Any]] = {
        "organization_id": Organization,
        "company_id": Company,
        "customer_id": Customer,
        "supplier_id": Supplier,
        "account_type_id": AccountType,
        "account_id": ChartOfAccount,
        "parent_id": ChartOfAccount,
        "currency_id": Currency,
        "from_currency_id": Currency,
        "to_currency_id": Currency,
        "fiscal_year_id": FiscalYear,
        "fiscal_period_id": FiscalPeriod,
        "cost_center_id": CostCenter,
        "bank_account_id": BankAccount,
        "expense_category_id": ExpenseCategory,
        "payment_term_id": PaymentTerm,
        "journal_entry_id": JournalEntry,
        "vendor_bill_id": VendorBill,
        "expense_id": Expense,
        "invoice_id": Invoice,
        "payment_id": Payment,
        "asset_category_id": AssetCategory,
        "asset_id": Asset,
        "user_id": User,
        "manager_id": User,
        "closed_by": User,
        "created_by": User,
        "updated_by": User,
    }

    @classmethod
    def list(cls, db: Session, **params: Any) -> PaginatedResponse:
        items, total = cls.repository.list(db, **params)
        page = params.get("page", 1)
        page_size = params.get("page_size", 20)
        pages = (total + page_size - 1) // page_size if total else 0
        return PaginatedResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)

    @classmethod
    def get(cls, db: Session, item_id: int, include_deleted: bool = False) -> Any:
        item = cls.repository.get_by_id(db, item_id, include_deleted=include_deleted)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"success": False, "message": f"{cls.entity_name} not found", "errors": {"id": item_id}},
            )
        return item

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Any:
        payload = normalize_payload(cls.repository.to_dict(data))
        cls.prepare_payload(db, payload)
        cls.validate_payload(db, payload)
        cls.ensure_unique(db, payload)
        return cls.repository.create(db, payload, user_id)

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Any:
        item = cls.get(db, item_id)
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))
        cls.prepare_payload(db, payload, item=item)
        cls.validate_payload(db, payload, item=item)
        cls.ensure_unique(db, payload, item=item, exclude_id=item_id)
        return cls.repository.update(db, item, payload, user_id)

    @classmethod
    def delete(cls, db: Session, item_id: int, user_id: int | None = None) -> Any:
        return cls.repository.soft_delete(db, cls.get(db, item_id), user_id)

    @classmethod
    def restore(cls, db: Session, item_id: int, user_id: int | None = None) -> Any:
        return cls.repository.restore(db, cls.get(db, item_id, include_deleted=True), user_id)

    @classmethod
    def permanent_delete(cls, db: Session, item_id: int) -> dict[str, int]:
        item = cls.get(db, item_id, include_deleted=True)
        cls.repository.hard_delete(db, item)
        return {"deleted": item_id}

    @classmethod
    def bulk_delete(cls, db: Session, ids: list[int], user_id: int | None = None) -> dict[str, Any]:
        items = cls.repository.bulk_get(db, ids)
        for item in items:
            cls.repository.soft_delete(db, item, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_restore(cls, db: Session, ids: list[int], user_id: int | None = None) -> dict[str, Any]:
        items = cls.repository.bulk_get(db, ids, include_deleted=True)
        for item in items:
            cls.repository.restore(db, item, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_update(cls, db: Session, ids: list[int], values: dict[str, Any], user_id: int | None = None) -> dict[str, Any]:
        items = cls.repository.bulk_get(db, ids)
        allowed_values = {key: value for key, value in values.items() if hasattr(cls.repository.model, key)}
        for item in items:
            cls.update(db, item.id, allowed_values, user_id)
        return {"affected": len(items), "ids": [item.id for item in items]}

    @classmethod
    def bulk_status(cls, db: Session, ids: list[int], new_status: str, user_id: int | None = None) -> dict[str, Any]:
        return cls.bulk_update(db, ids, {"status": new_status}, user_id)

    @classmethod
    async def import_csv(cls, db: Session, file: Any, create_schema: type[Any], user_id: int | None = None) -> dict[str, Any]:
        raw = await file.read()
        reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")))
        created: list[int] = []
        errors: list[dict[str, Any]] = []
        for row_number, row in enumerate(reader, start=2):
            try:
                data = create_schema(**{key: (None if value == "" else value) for key, value in row.items()})
                created.append(cls.create(db, data, user_id).id)
            except Exception as exc:  # noqa: BLE001 - imports collect row-level errors.
                errors.append({"row": row_number, "error": getattr(exc, "detail", str(exc))})
        return {"created": len(created), "ids": created, "errors": errors}

    @classmethod
    def export_rows(cls, db: Session, export_format: str = "json") -> Any:
        export_format = export_format.lower()
        items, _ = cls.repository.list(db, page=1, page_size=10000, include_deleted=True)
        rows = [{field: getattr(item, field, None) for field in cls.export_fields} for item in items]
        if export_format == "json":
            return rows
        if export_format == "xlsx":
            return build_xlsx(rows, cls.export_fields)
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=list(cls.export_fields))
        writer.writeheader()
        for row in rows:
            writer.writerow({field: serialize_export_value(row.get(field)) for field in cls.export_fields})
        return output.getvalue()

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db, payload, item

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        for field_name in cls.required_fields:
            if payload.get(field_name, getattr(item, field_name, None) if item is not None else None) is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"success": False, "message": f"{field_name} is required", "errors": {field_name: "required"}},
                )

        for field_name, model in cls.foreign_keys.items():
            value = payload.get(field_name)
            if value is None:
                continue
            cls.ensure_exists(db, model, value, field_name)

    @classmethod
    def ensure_unique(
        cls,
        db: Session,
        payload: dict[str, Any],
        item: Any | None = None,
        exclude_id: int | None = None,
    ) -> None:
        organization_id = payload.get("organization_id", getattr(item, "organization_id", None) if item else None)
        for field_name in cls.scoped_unique_fields:
            value = payload.get(field_name)
            if not value or organization_id is None:
                continue
            query = cls.repository.base_query(db, include_deleted=True).filter(
                cls.repository.model.organization_id == organization_id,
                getattr(cls.repository.model, field_name) == value,
            )
            if exclude_id is not None:
                query = query.filter(cls.repository.model.id != exclude_id)
            if query.first():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "success": False,
                        "message": f"Duplicate {field_name}",
                        "errors": {"organization_id": organization_id, field_name: value},
                    },
                )

    @staticmethod
    def ensure_exists(db: Session, model: type[Any], item_id: int | None, label: str) -> None:
        if item_id is None:
            return
        exists = db.query(model.id).filter(model.id == item_id).first()
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"success": False, "message": f"Invalid {label}", "errors": {label: item_id}},
            )


class AccountTypeService(BaseFinanceService):
    repository = AccountTypeRepository
    entity_name = "Account type"
    required_fields = ("organization_id", "code", "name", "category", "normal_balance")
    scoped_unique_fields = ("code",)
    export_fields = ("id", "uuid", "organization_id", "code", "name", "category", "normal_balance", "status")


class ChartOfAccountService(BaseFinanceService):
    repository = ChartOfAccountRepository
    entity_name = "Chart of account"
    required_fields = ("organization_id", "account_type_id", "account_code", "name", "normal_balance")
    scoped_unique_fields = ("account_code",)
    export_fields = (
        "id",
        "uuid",
        "organization_id",
        "company_id",
        "account_type_id",
        "account_code",
        "name",
        "normal_balance",
        "opening_balance",
        "current_balance",
        "allow_posting",
        "status",
    )

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        super().validate_payload(db, payload, item)
        parent_id = payload.get("parent_id")
        if item is not None and parent_id == item.id:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Account cannot parent itself"})
        if parent_id is not None:
            cls.ensure_exists(db, ChartOfAccount, parent_id, "parent_id")


class CurrencyService(BaseFinanceService):
    repository = CurrencyRepository
    entity_name = "Currency"
    required_fields = ("organization_id", "code", "name")
    scoped_unique_fields = ("code",)
    export_fields = ("id", "uuid", "organization_id", "code", "name", "symbol", "decimal_places", "is_base", "status")

    @classmethod
    def convert(
        cls,
        db: Session,
        *,
        organization_id: int,
        amount: Decimal,
        from_currency_id: int,
        to_currency_id: int,
        conversion_date: date | None = None,
    ) -> dict[str, Any]:
        if from_currency_id == to_currency_id:
            return {"amount": amount, "rate": Decimal("1"), "converted_amount": amount}
        conversion_date = conversion_date or date.today()
        rate = (
            db.query(ExchangeRate)
            .filter(
                ExchangeRate.organization_id == organization_id,
                ExchangeRate.from_currency_id == from_currency_id,
                ExchangeRate.to_currency_id == to_currency_id,
                ExchangeRate.rate_date <= conversion_date,
                ExchangeRate.deleted_at.is_(None),
            )
            .order_by(ExchangeRate.rate_date.desc())
            .first()
        )
        if not rate:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Exchange rate not found"})
        converted = quantize_money(decimal_or_zero(amount) * decimal_or_zero(rate.rate))
        return {"amount": amount, "rate": rate.rate, "converted_amount": converted, "rate_date": rate.rate_date}


class ExchangeRateService(BaseFinanceService):
    repository = ExchangeRateRepository
    entity_name = "Exchange rate"
    required_fields = ("organization_id", "from_currency_id", "to_currency_id", "rate", "rate_date")
    export_fields = ("id", "uuid", "organization_id", "from_currency_id", "to_currency_id", "rate", "rate_date", "source", "status")


class FiscalYearService(BaseFinanceService):
    repository = FiscalYearRepository
    entity_name = "Fiscal year"
    required_fields = ("organization_id", "name", "start_date", "end_date")
    scoped_unique_fields = ("name",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "name", "start_date", "end_date", "status", "is_current")


class FiscalPeriodService(BaseFinanceService):
    repository = FiscalPeriodRepository
    entity_name = "Fiscal period"
    required_fields = ("organization_id", "fiscal_year_id", "name", "period_number", "start_date", "end_date")
    export_fields = ("id", "uuid", "organization_id", "fiscal_year_id", "name", "period_number", "start_date", "end_date", "status")


class CostCenterService(BaseFinanceService):
    repository = CostCenterRepository
    entity_name = "Cost center"
    required_fields = ("organization_id", "code", "name")
    scoped_unique_fields = ("code",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "code", "name", "allocation_percent", "status")

    @classmethod
    def allocate(cls, amount: Decimal, centers: list[dict[str, Any]]) -> list[dict[str, Any]]:
        total_percent = sum(decimal_or_zero(center.get("allocation_percent")) for center in centers)
        if total_percent != Decimal("100"):
            raise HTTPException(status_code=400, detail={"success": False, "message": "Cost center allocation must equal 100%"})
        return [
            {
                "cost_center_id": center["cost_center_id"],
                "allocation_percent": center["allocation_percent"],
                "amount": quantize_money(decimal_or_zero(amount) * decimal_or_zero(center["allocation_percent"]) / Decimal("100")),
            }
            for center in centers
        ]


class JournalService(BaseFinanceService):
    repository = JournalEntryRepository
    entity_name = "Journal entry"
    required_fields = ("organization_id", "entry_number")
    scoped_unique_fields = ("entry_number",)
    export_fields = (
        "id",
        "uuid",
        "organization_id",
        "company_id",
        "entry_number",
        "entry_date",
        "source_type",
        "source_id",
        "total_debit",
        "total_credit",
        "status",
    )

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db
        if not payload.get("entry_number"):
            payload["entry_number"] = generate_identifier("JE", str(payload.get("organization_id") or "ORG"))
        if payload.get("entry_date") is None and item is None:
            payload["entry_date"] = utc_now()

    @classmethod
    def _prepare_line(cls, line_payload: dict[str, Any], line_number: int) -> dict[str, Any]:
        line_payload["line_number"] = line_payload.get("line_number") or line_number
        debit = decimal_or_zero(line_payload.get("debit"))
        credit = decimal_or_zero(line_payload.get("credit"))
        if debit and credit:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Journal line cannot have both debit and credit"})
        if not debit and not credit:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Journal line requires debit or credit"})
        rate = decimal_or_zero(line_payload.get("exchange_rate") or 1)
        if rate <= 0:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Exchange rate must be positive"})
        line_payload["debit"] = debit
        line_payload["credit"] = credit
        line_payload["exchange_rate"] = rate
        line_payload["base_debit"] = quantize_money(decimal_or_zero(line_payload.get("base_debit")) or debit * rate)
        line_payload["base_credit"] = quantize_money(decimal_or_zero(line_payload.get("base_credit")) or credit * rate)
        return line_payload

    @classmethod
    def _validate_balanced(cls, lines_payload: list[dict[str, Any]]) -> tuple[Decimal, Decimal]:
        if len(lines_payload) < 2:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Journal entry requires at least two lines"})
        total_debit = quantize_money(sum(decimal_or_zero(line.get("base_debit")) for line in lines_payload))
        total_credit = quantize_money(sum(decimal_or_zero(line.get("base_credit")) for line in lines_payload))
        if total_debit != total_credit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "success": False,
                    "message": "Journal entry is not balanced",
                    "errors": {"total_debit": str(total_debit), "total_credit": str(total_credit)},
                },
            )
        return total_debit, total_credit

    @classmethod
    def create(cls, db: Session, data: JournalEntryCreate, user_id: int | None = None) -> JournalEntry:
        payload = normalize_payload(cls.repository.to_dict(data))
        lines_payload = [normalize_payload(line) for line in payload.pop("lines", [])]
        cls.prepare_payload(db, payload)
        prepared_lines = [cls._prepare_line(line, index) for index, line in enumerate(lines_payload, start=1)]
        total_debit, total_credit = cls._validate_balanced(prepared_lines)
        payload["total_debit"] = total_debit
        payload["total_credit"] = total_credit
        requested_status = payload.pop("status", "Draft")
        payload["status"] = "Draft"
        cls.validate_payload(db, payload)
        cls.ensure_unique(db, payload)

        entry = JournalEntry(**payload)
        if user_id:
            entry.created_by = user_id
        db.add(entry)
        db.flush()
        for line_payload in prepared_lines:
            cls.ensure_exists(db, ChartOfAccount, line_payload.get("account_id"), "account_id")
            line = JournalEntryLine(journal_entry_id=entry.id, **line_payload)
            if user_id:
                line.created_by = user_id
            db.add(line)
        db.flush()
        if requested_status == "Posted":
            cls.post_entry(db, entry, user_id=user_id, commit=False)
        db.commit()
        db.refresh(entry)
        return entry

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> JournalEntry:
        entry = cls.get(db, item_id)
        if entry.status == "Posted":
            raise HTTPException(status_code=400, detail={"success": False, "message": "Posted journals cannot be edited"})
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))
        lines_payload = payload.pop("lines", None)
        cls.prepare_payload(db, payload, item=entry)
        if lines_payload is not None:
            prepared_lines = [cls._prepare_line(normalize_payload(line), index) for index, line in enumerate(lines_payload, start=1)]
            total_debit, total_credit = cls._validate_balanced(prepared_lines)
            payload["total_debit"] = total_debit
            payload["total_credit"] = total_credit
        cls.validate_payload(db, payload, item=entry)
        cls.ensure_unique(db, payload, item=entry, exclude_id=item_id)
        for key, value in payload.items():
            setattr(entry, key, value)
        if user_id:
            entry.updated_by = user_id
        if lines_payload is not None:
            for line in list(entry.lines):
                db.delete(line)
            db.flush()
            for line_payload in prepared_lines:
                cls.ensure_exists(db, ChartOfAccount, line_payload.get("account_id"), "account_id")
                line = JournalEntryLine(journal_entry_id=entry.id, **line_payload)
                if user_id:
                    line.created_by = user_id
                db.add(line)
        db.commit()
        db.refresh(entry)
        return entry

    @classmethod
    def post(cls, db: Session, item_id: int, user_id: int | None = None) -> JournalEntry:
        entry = cls.get(db, item_id)
        cls.post_entry(db, entry, user_id=user_id, commit=True)
        db.refresh(entry)
        return entry

    @classmethod
    def post_entry(cls, db: Session, entry: JournalEntry, user_id: int | None = None, commit: bool = True) -> None:
        if entry.status == "Posted":
            raise HTTPException(status_code=400, detail={"success": False, "message": "Journal entry is already posted"})
        prepared_lines = [
            cls._prepare_line(
                {
                    "account_id": line.account_id,
                    "cost_center_id": line.cost_center_id,
                    "currency_id": line.currency_id,
                    "tax_rate_id": line.tax_rate_id,
                    "line_number": line.line_number,
                    "description": line.description,
                    "debit": line.debit,
                    "credit": line.credit,
                    "exchange_rate": line.exchange_rate,
                    "base_debit": line.base_debit,
                    "base_credit": line.base_credit,
                    "party_type": line.party_type,
                    "party_id": line.party_id,
                },
                line.line_number,
            )
            for line in entry.lines
        ]
        cls._validate_balanced(prepared_lines)
        posted_at = utc_now()
        for line in entry.lines:
            account = db.query(ChartOfAccount).filter(ChartOfAccount.id == line.account_id, ChartOfAccount.deleted_at.is_(None)).first()
            if not account:
                raise HTTPException(status_code=400, detail={"success": False, "message": "Invalid account_id"})
            if not account.allow_posting:
                raise HTTPException(status_code=400, detail={"success": False, "message": f"Account {account.account_code} does not allow posting"})

            debit = decimal_or_zero(line.base_debit)
            credit = decimal_or_zero(line.base_credit)
            movement = debit - credit if account.normal_balance == "Debit" else credit - debit
            account.current_balance = quantize_money(decimal_or_zero(account.current_balance) + movement)
            ledger = GeneralLedger(
                organization_id=entry.organization_id,
                company_id=entry.company_id,
                account_id=line.account_id,
                journal_entry_id=entry.id,
                journal_entry_line_id=line.id,
                fiscal_year_id=entry.fiscal_year_id,
                fiscal_period_id=entry.fiscal_period_id,
                cost_center_id=line.cost_center_id,
                currency_id=line.currency_id or entry.currency_id,
                posting_date=entry.entry_date or posted_at,
                description=line.description or entry.description,
                debit=debit,
                credit=credit,
                balance=account.current_balance,
                exchange_rate=line.exchange_rate or entry.exchange_rate,
                source_type=entry.source_type,
                source_id=entry.source_id,
                status="posted",
                created_by=user_id,
            )
            db.add(ledger)
        entry.status = "Posted"
        entry.posted_at = posted_at
        entry.posted_by = user_id
        if user_id:
            entry.updated_by = user_id
        if commit:
            db.commit()

    @classmethod
    def reverse(cls, db: Session, item_id: int, user_id: int | None = None) -> JournalEntry:
        entry = cls.get(db, item_id)
        if entry.status != "Posted":
            raise HTTPException(status_code=400, detail={"success": False, "message": "Only posted journals can be reversed"})
        reversal = JournalEntryCreate(
            organization_id=entry.organization_id,
            company_id=entry.company_id,
            fiscal_year_id=entry.fiscal_year_id,
            fiscal_period_id=entry.fiscal_period_id,
            currency_id=entry.currency_id,
            exchange_rate=entry.exchange_rate,
            reversal_entry_id=entry.id,
            entry_number=generate_identifier("REV", entry.entry_number),
            entry_date=utc_now(),
            source_type="journal_reversal",
            source_id=entry.id,
            description=f"Reversal of {entry.entry_number}",
            status="Posted",
            lines=[
                JournalEntryLineCreate(
                    account_id=line.account_id,
                    cost_center_id=line.cost_center_id,
                    currency_id=line.currency_id,
                    tax_rate_id=line.tax_rate_id,
                    description=line.description,
                    debit=line.credit,
                    credit=line.debit,
                    exchange_rate=line.exchange_rate,
                    base_debit=line.base_credit,
                    base_credit=line.base_debit,
                    party_type=line.party_type,
                    party_id=line.party_id,
                )
                for line in entry.lines
            ],
        )
        reversal_entry = cls.create(db, reversal, user_id)
        entry.status = "Reversed"
        entry.reversed_at = utc_now()
        entry.reversed_by = user_id
        db.commit()
        return reversal_entry


class LedgerService(BaseFinanceService):
    repository = GeneralLedgerRepository
    entity_name = "General ledger"
    required_fields = ("organization_id", "account_id", "journal_entry_id", "journal_entry_line_id", "posting_date")
    export_fields = ("id", "uuid", "organization_id", "account_id", "journal_entry_id", "posting_date", "debit", "credit", "balance", "status")

    @classmethod
    def account_activity(
        cls,
        db: Session,
        *,
        organization_id: int,
        account_id: int | None = None,
        date_from: date | datetime | None = None,
        date_to: date | datetime | None = None,
    ) -> list[dict[str, Any]]:
        query = db.query(GeneralLedger).filter(GeneralLedger.organization_id == organization_id, GeneralLedger.deleted_at.is_(None))
        if account_id is not None:
            query = query.filter(GeneralLedger.account_id == account_id)
        if date_from is not None:
            query = query.filter(GeneralLedger.posting_date >= date_from)
        if date_to is not None:
            query = query.filter(GeneralLedger.posting_date <= date_to)
        rows = query.order_by(GeneralLedger.posting_date, GeneralLedger.id).all()
        return [
            {
                "id": row.id,
                "account_id": row.account_id,
                "posting_date": row.posting_date,
                "description": row.description,
                "debit": row.debit,
                "credit": row.credit,
                "balance": row.balance,
                "source_type": row.source_type,
                "source_id": row.source_id,
            }
            for row in rows
        ]


class TrialBalanceService:
    @classmethod
    def generate(
        cls,
        db: Session,
        *,
        organization_id: int,
        fiscal_period_id: int | None = None,
        date_from: date | datetime | None = None,
        date_to: date | datetime | None = None,
    ) -> dict[str, Any]:
        query = (
            db.query(
                ChartOfAccount.id,
                ChartOfAccount.account_code,
                ChartOfAccount.name,
                AccountType.category,
                func.coalesce(func.sum(GeneralLedger.debit), 0).label("debit"),
                func.coalesce(func.sum(GeneralLedger.credit), 0).label("credit"),
            )
            .join(GeneralLedger, GeneralLedger.account_id == ChartOfAccount.id)
            .join(AccountType, AccountType.id == ChartOfAccount.account_type_id)
            .filter(GeneralLedger.organization_id == organization_id, GeneralLedger.deleted_at.is_(None))
        )
        if fiscal_period_id is not None:
            query = query.filter(GeneralLedger.fiscal_period_id == fiscal_period_id)
        if date_from is not None:
            query = query.filter(GeneralLedger.posting_date >= date_from)
        if date_to is not None:
            query = query.filter(GeneralLedger.posting_date <= date_to)
        rows = query.group_by(ChartOfAccount.id, AccountType.category).order_by(ChartOfAccount.account_code).all()
        items = []
        total_debit = Decimal("0")
        total_credit = Decimal("0")
        for row in rows:
            debit = decimal_or_zero(row.debit)
            credit = decimal_or_zero(row.credit)
            net = debit - credit
            items.append(
                {
                    "account_id": row.id,
                    "account_code": row.account_code,
                    "account_name": row.name,
                    "category": row.category,
                    "debit": debit,
                    "credit": credit,
                    "net": net,
                }
            )
            total_debit += debit
            total_credit += credit
        return {
            "items": items,
            "total_debit": quantize_money(total_debit),
            "total_credit": quantize_money(total_credit),
            "is_balanced": quantize_money(total_debit) == quantize_money(total_credit),
        }


class ProfitLossService:
    @classmethod
    def generate(
        cls,
        db: Session,
        *,
        organization_id: int,
        date_from: date | datetime | None = None,
        date_to: date | datetime | None = None,
    ) -> dict[str, Any]:
        rows = _account_balances(db, organization_id, {"Revenue", "Expense"}, date_from, date_to)
        revenue = []
        expenses = []
        total_revenue = Decimal("0")
        total_expenses = Decimal("0")
        for row in rows:
            if row["category"] == "Revenue":
                amount = row["credit"] - row["debit"]
                total_revenue += amount
                revenue.append({**row, "amount": quantize_money(amount)})
            if row["category"] == "Expense":
                amount = row["debit"] - row["credit"]
                total_expenses += amount
                expenses.append({**row, "amount": quantize_money(amount)})
        return {
            "revenue": revenue,
            "expenses": expenses,
            "total_revenue": quantize_money(total_revenue),
            "total_expenses": quantize_money(total_expenses),
            "net_income": quantize_money(total_revenue - total_expenses),
        }


class BalanceSheetService:
    @classmethod
    def generate(
        cls,
        db: Session,
        *,
        organization_id: int,
        as_of: date | datetime | None = None,
    ) -> dict[str, Any]:
        rows = _account_balances(db, organization_id, {"Asset", "Liability", "Equity"}, None, as_of)
        sections = {"assets": [], "liabilities": [], "equity": []}
        totals = {"assets": Decimal("0"), "liabilities": Decimal("0"), "equity": Decimal("0")}
        for row in rows:
            if row["category"] == "Asset":
                amount = row["debit"] - row["credit"]
                sections["assets"].append({**row, "amount": quantize_money(amount)})
                totals["assets"] += amount
            elif row["category"] == "Liability":
                amount = row["credit"] - row["debit"]
                sections["liabilities"].append({**row, "amount": quantize_money(amount)})
                totals["liabilities"] += amount
            elif row["category"] == "Equity":
                amount = row["credit"] - row["debit"]
                sections["equity"].append({**row, "amount": quantize_money(amount)})
                totals["equity"] += amount
        return {
            **sections,
            "total_assets": quantize_money(totals["assets"]),
            "total_liabilities": quantize_money(totals["liabilities"]),
            "total_equity": quantize_money(totals["equity"]),
            "is_balanced": quantize_money(totals["assets"]) == quantize_money(totals["liabilities"] + totals["equity"]),
        }


class CashFlowService:
    @classmethod
    def generate(
        cls,
        db: Session,
        *,
        organization_id: int,
        date_from: date | datetime | None = None,
        date_to: date | datetime | None = None,
    ) -> dict[str, Any]:
        query = (
            db.query(ChartOfAccount, func.coalesce(func.sum(GeneralLedger.debit), 0), func.coalesce(func.sum(GeneralLedger.credit), 0))
            .join(GeneralLedger, GeneralLedger.account_id == ChartOfAccount.id)
            .filter(
                GeneralLedger.organization_id == organization_id,
                ChartOfAccount.is_bank_account.is_(True),
                GeneralLedger.deleted_at.is_(None),
            )
        )
        if date_from is not None:
            query = query.filter(GeneralLedger.posting_date >= date_from)
        if date_to is not None:
            query = query.filter(GeneralLedger.posting_date <= date_to)
        rows = query.group_by(ChartOfAccount.id).order_by(ChartOfAccount.account_code).all()
        accounts = []
        inflows = Decimal("0")
        outflows = Decimal("0")
        for account, debit, credit in rows:
            debit_amount = decimal_or_zero(debit)
            credit_amount = decimal_or_zero(credit)
            inflows += debit_amount
            outflows += credit_amount
            accounts.append(
                {
                    "account_id": account.id,
                    "account_code": account.account_code,
                    "account_name": account.name,
                    "cash_in": debit_amount,
                    "cash_out": credit_amount,
                    "net_cash_flow": quantize_money(debit_amount - credit_amount),
                }
            )
        return {
            "accounts": accounts,
            "cash_inflows": quantize_money(inflows),
            "cash_outflows": quantize_money(outflows),
            "net_cash_flow": quantize_money(inflows - outflows),
        }


def _account_balances(
    db: Session,
    organization_id: int,
    categories: set[str],
    date_from: date | datetime | None,
    date_to: date | datetime | None,
) -> list[dict[str, Any]]:
    query = (
        db.query(
            ChartOfAccount.id,
            ChartOfAccount.account_code,
            ChartOfAccount.name,
            AccountType.category,
            func.coalesce(func.sum(GeneralLedger.debit), 0).label("debit"),
            func.coalesce(func.sum(GeneralLedger.credit), 0).label("credit"),
        )
        .join(AccountType, AccountType.id == ChartOfAccount.account_type_id)
        .join(GeneralLedger, GeneralLedger.account_id == ChartOfAccount.id)
        .filter(
            ChartOfAccount.organization_id == organization_id,
            AccountType.category.in_(categories),
            GeneralLedger.deleted_at.is_(None),
        )
    )
    if date_from is not None:
        query = query.filter(GeneralLedger.posting_date >= date_from)
    if date_to is not None:
        query = query.filter(GeneralLedger.posting_date <= date_to)
    rows = query.group_by(ChartOfAccount.id, AccountType.category).order_by(ChartOfAccount.account_code).all()
    return [
        {
            "account_id": row.id,
            "account_code": row.account_code,
            "account_name": row.name,
            "category": row.category,
            "debit": decimal_or_zero(row.debit),
            "credit": decimal_or_zero(row.credit),
        }
        for row in rows
    ]


class BudgetService(BaseFinanceService):
    repository = BudgetRepository
    entity_name = "Budget"
    required_fields = ("organization_id", "fiscal_year_id", "name")
    export_fields = ("id", "uuid", "organization_id", "company_id", "fiscal_year_id", "name", "total_amount", "consumed_amount", "status")

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> Budget:
        payload = normalize_payload(cls.repository.to_dict(data))
        lines_payload = [normalize_payload(line) for line in payload.pop("lines", [])]
        cls.prepare_payload(db, payload)
        for line in lines_payload:
            line["remaining_amount"] = quantize_money(decimal_or_zero(line.get("amount")) - decimal_or_zero(line.get("consumed_amount")))
        if not payload.get("total_amount") and lines_payload:
            payload["total_amount"] = quantize_money(sum(decimal_or_zero(line.get("amount")) for line in lines_payload))
        cls.validate_payload(db, payload)
        cls.ensure_unique(db, payload)
        budget = Budget(**payload)
        if user_id:
            budget.created_by = user_id
        db.add(budget)
        db.flush()
        for line_payload in lines_payload:
            line = BudgetLine(budget_id=budget.id, **line_payload)
            if user_id:
                line.created_by = user_id
            db.add(line)
        db.commit()
        db.refresh(budget)
        return budget

    @classmethod
    def update(cls, db: Session, item_id: int, data: Any, user_id: int | None = None) -> Budget:
        budget = cls.get(db, item_id)
        payload = normalize_payload(cls.repository.to_dict(data, exclude_unset=True))
        lines_payload = payload.pop("lines", None)
        cls.prepare_payload(db, payload, item=budget)
        cls.validate_payload(db, payload, item=budget)
        cls.ensure_unique(db, payload, item=budget, exclude_id=item_id)
        for key, value in payload.items():
            setattr(budget, key, value)
        if lines_payload is not None:
            for line in list(budget.lines):
                db.delete(line)
            db.flush()
            for raw_line in lines_payload:
                line_payload = normalize_payload(raw_line)
                line_payload["remaining_amount"] = quantize_money(
                    decimal_or_zero(line_payload.get("amount")) - decimal_or_zero(line_payload.get("consumed_amount"))
                )
                db.add(BudgetLine(budget_id=budget.id, **line_payload))
            budget.total_amount = quantize_money(sum(decimal_or_zero(line.amount) for line in budget.lines))
        if user_id:
            budget.updated_by = user_id
        db.commit()
        db.refresh(budget)
        return budget

    @classmethod
    def validate_budget(
        cls,
        db: Session,
        *,
        organization_id: int,
        account_id: int,
        amount: Decimal,
        cost_center_id: int | None = None,
        fiscal_period_id: int | None = None,
    ) -> dict[str, Any]:
        query = (
            db.query(BudgetLine)
            .join(Budget)
            .filter(
                Budget.organization_id == organization_id,
                BudgetLine.account_id == account_id,
                Budget.deleted_at.is_(None),
                BudgetLine.deleted_at.is_(None),
            )
        )
        if cost_center_id is not None:
            query = query.filter(BudgetLine.cost_center_id == cost_center_id)
        if fiscal_period_id is not None:
            query = query.filter(BudgetLine.fiscal_period_id == fiscal_period_id)
        line = query.first()
        if not line:
            return {"valid": True, "warning": "No budget line configured"}
        remaining = decimal_or_zero(line.remaining_amount)
        return {"valid": remaining >= amount, "remaining_amount": remaining, "requested_amount": amount}


class BankService(BaseFinanceService):
    repository = BankAccountRepository
    entity_name = "Bank account"
    required_fields = ("organization_id", "account_id", "bank_name", "account_name", "account_number")
    scoped_unique_fields = ("account_number",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "bank_name", "account_name", "account_number", "current_balance", "status")

    @classmethod
    def reconcile(
        cls,
        db: Session,
        *,
        bank_transaction_id: int,
        journal_entry_id: int | None,
        reconciled_amount: Decimal | None,
        user_id: int | None = None,
    ) -> BankTransaction:
        transaction = db.query(BankTransaction).filter(BankTransaction.id == bank_transaction_id, BankTransaction.deleted_at.is_(None)).first()
        if not transaction:
            raise HTTPException(status_code=404, detail={"success": False, "message": "Bank transaction not found"})
        transaction.journal_entry_id = journal_entry_id
        transaction.reconciled_amount = reconciled_amount or transaction.amount
        transaction.is_reconciled = True
        transaction.reconciled_at = utc_now()
        transaction.status = "reconciled"
        transaction.updated_by = user_id
        db.commit()
        db.refresh(transaction)
        return transaction


class BankTransactionService(BaseFinanceService):
    repository = BankTransactionRepository
    entity_name = "Bank transaction"
    required_fields = ("organization_id", "bank_account_id", "transaction_date", "transaction_type", "amount")
    export_fields = ("id", "uuid", "organization_id", "bank_account_id", "transaction_date", "reference", "transaction_type", "amount", "status")


class PaymentAllocationService(BaseFinanceService):
    repository = PaymentAllocationRepository
    entity_name = "Payment allocation"
    required_fields = ("organization_id", "amount")
    export_fields = ("id", "uuid", "organization_id", "company_id", "payment_id", "invoice_id", "vendor_bill_id", "expense_id", "amount", "status")

    @classmethod
    def validate_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        super().validate_payload(db, payload, item)
        target_fields = ("invoice_id", "vendor_bill_id", "expense_id")
        target_count = sum(1 for field in target_fields if payload.get(field, getattr(item, field, None) if item else None))
        if target_count != 1:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Allocate payment to exactly one target"})


class ExpenseCategoryService(BaseFinanceService):
    repository = ExpenseCategoryRepository
    entity_name = "Expense category"
    required_fields = ("organization_id", "code", "name")
    scoped_unique_fields = ("code",)
    export_fields = ("id", "uuid", "organization_id", "code", "name", "account_id", "status")


class ExpenseService(BaseFinanceService):
    repository = ExpenseRepository
    entity_name = "Expense"
    required_fields = ("organization_id", "expense_category_id")
    scoped_unique_fields = ("expense_number",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "expense_number", "expense_date", "vendor_name", "total_amount", "paid_amount", "status")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db
        if not payload.get("expense_number") and item is None:
            payload["expense_number"] = generate_identifier("EXP", str(payload.get("organization_id") or "ORG"))
        if payload.get("expense_date") is None and item is None:
            payload["expense_date"] = utc_now()
        subtotal = payload.get("subtotal")
        tax_total = payload.get("tax_total")
        if subtotal is not None or tax_total is not None:
            payload["total_amount"] = quantize_money(decimal_or_zero(subtotal) + decimal_or_zero(tax_total))


class VendorBillService(BaseFinanceService):
    repository = VendorBillRepository
    entity_name = "Vendor bill"
    required_fields = ("organization_id", "bill_number")
    scoped_unique_fields = ("bill_number",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "supplier_id", "bill_number", "bill_date", "total_amount", "balance_due", "status")

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db, item
        if payload.get("bill_date") is None:
            payload["bill_date"] = utc_now()
        subtotal = decimal_or_zero(payload.get("subtotal"))
        tax_total = decimal_or_zero(payload.get("tax_total"))
        discount_total = decimal_or_zero(payload.get("discount_total"))
        if any(value is not None for value in (payload.get("subtotal"), payload.get("tax_total"), payload.get("discount_total"))):
            payload["total_amount"] = quantize_money(max(subtotal + tax_total - discount_total, Decimal("0")))
            payload["balance_due"] = quantize_money(max(payload["total_amount"] - decimal_or_zero(payload.get("paid_amount")), Decimal("0")))


class VendorCreditNoteService(BaseFinanceService):
    repository = VendorCreditNoteRepository
    entity_name = "Vendor credit note"
    required_fields = ("organization_id", "credit_note_number")
    scoped_unique_fields = ("credit_note_number",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "supplier_id", "credit_note_number", "amount", "tax_amount", "status")


class CustomerCreditNoteService(BaseFinanceService):
    repository = CustomerCreditNoteRepository
    entity_name = "Customer credit note"
    required_fields = ("organization_id", "credit_note_number")
    scoped_unique_fields = ("credit_note_number",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "customer_id", "credit_note_number", "amount", "tax_amount", "status")


class DebitNoteService(BaseFinanceService):
    repository = DebitNoteRepository
    entity_name = "Debit note"
    required_fields = ("organization_id", "debit_note_number")
    scoped_unique_fields = ("debit_note_number",)
    export_fields = ("id", "uuid", "organization_id", "company_id", "debit_note_number", "amount", "tax_amount", "status")


class RecurringJournalService(BaseFinanceService):
    repository = RecurringJournalRepository
    entity_name = "Recurring journal"
    required_fields = ("organization_id", "name", "frequency", "start_date", "next_run_date")
    export_fields = ("id", "uuid", "organization_id", "company_id", "name", "frequency", "next_run_date", "last_run_date", "auto_post", "status")

    @classmethod
    def run_due(cls, db: Session, *, organization_id: int, run_date: date | None = None, user_id: int | None = None) -> dict[str, Any]:
        run_date = run_date or date.today()
        templates = (
            db.query(RecurringJournal)
            .filter(
                RecurringJournal.organization_id == organization_id,
                RecurringJournal.next_run_date <= run_date,
                RecurringJournal.status == "active",
                RecurringJournal.deleted_at.is_(None),
            )
            .all()
        )
        created: list[int] = []
        for template in templates:
            if not template.payload:
                continue
            data = JournalEntryCreate(**template.payload, status="Posted" if template.auto_post else "Draft")
            created.append(JournalService.create(db, data, user_id).id)
            template.last_run_date = run_date
        db.commit()
        return {"created": len(created), "ids": created}


class TaxService(BaseFinanceService):
    repository = TaxRateRepository
    entity_name = "Tax rate"
    required_fields = ("organization_id", "code", "name", "tax_type", "rate")
    scoped_unique_fields = ("code",)
    export_fields = ("id", "uuid", "organization_id", "code", "name", "tax_type", "rate", "country", "region", "status")

    @classmethod
    def calculate(cls, amount: Decimal, rate: Decimal, inclusive: bool = False) -> dict[str, Decimal]:
        amount = decimal_or_zero(amount)
        rate = decimal_or_zero(rate)
        if inclusive:
            taxable = amount / (Decimal("1") + rate / Decimal("100"))
            tax = amount - taxable
            total = amount
        else:
            taxable = amount
            tax = amount * rate / Decimal("100")
            total = amount + tax
        return {"taxable_amount": quantize_money(taxable), "tax_amount": quantize_money(tax), "total_amount": quantize_money(total)}

    @classmethod
    def calculate_group(cls, db: Session, *, tax_group_id: int, amount: Decimal, inclusive: bool = False) -> dict[str, Any]:
        group = db.query(TaxGroup).filter(TaxGroup.id == tax_group_id, TaxGroup.deleted_at.is_(None)).first()
        if not group:
            raise HTTPException(status_code=404, detail={"success": False, "message": "Tax group not found"})
        rates = db.query(TaxRate).filter(TaxRate.id.in_(group.tax_rate_ids or []), TaxRate.deleted_at.is_(None)).all()
        total_tax = Decimal("0")
        lines = []
        for rate in rates:
            result = cls.calculate(amount, rate.rate, inclusive=inclusive)
            total_tax += result["tax_amount"]
            lines.append({"tax_rate_id": rate.id, "code": rate.code, "rate": rate.rate, **result})
        return {"tax_group_id": tax_group_id, "tax_lines": lines, "tax_amount": quantize_money(total_tax)}


class TaxGroupService(BaseFinanceService):
    repository = TaxGroupRepository
    entity_name = "Tax group"
    required_fields = ("organization_id", "code", "name")
    scoped_unique_fields = ("code",)
    export_fields = ("id", "uuid", "organization_id", "code", "name", "tax_rate_ids", "status")


class PaymentTermService(BaseFinanceService):
    repository = PaymentTermRepository
    entity_name = "Payment term"
    required_fields = ("organization_id", "code", "name")
    scoped_unique_fields = ("code",)
    export_fields = ("id", "uuid", "organization_id", "code", "name", "days", "discount_days", "discount_percent", "status")


class PaymentScheduleService(BaseFinanceService):
    repository = PaymentScheduleRepository
    entity_name = "Payment schedule"
    required_fields = ("organization_id", "due_date", "amount")
    export_fields = ("id", "uuid", "organization_id", "payment_term_id", "invoice_id", "vendor_bill_id", "due_date", "amount", "paid_amount", "status")


class AssetCategoryService(BaseFinanceService):
    repository = AssetCategoryRepository
    entity_name = "Asset category"
    required_fields = ("organization_id", "code", "name", "useful_life_months")
    scoped_unique_fields = ("code",)
    export_fields = ("id", "uuid", "organization_id", "code", "name", "useful_life_months", "depreciation_method", "status")


class AssetService(BaseFinanceService):
    repository = AssetRepository
    entity_name = "Asset"
    required_fields = ("organization_id", "asset_category_id", "name", "acquisition_date", "acquisition_cost", "useful_life_months")
    scoped_unique_fields = ("asset_number",)
    export_fields = (
        "id",
        "uuid",
        "organization_id",
        "company_id",
        "asset_number",
        "name",
        "acquisition_date",
        "acquisition_cost",
        "accumulated_depreciation",
        "book_value",
        "status",
    )

    @classmethod
    def prepare_payload(cls, db: Session, payload: dict[str, Any], item: Any | None = None) -> None:
        del db
        if not payload.get("asset_number") and item is None:
            payload["asset_number"] = generate_identifier("AST", str(payload.get("organization_id") or "ORG"))
        cost = decimal_or_zero(payload.get("acquisition_cost", getattr(item, "acquisition_cost", None) if item else None))
        accumulated = decimal_or_zero(payload.get("accumulated_depreciation", getattr(item, "accumulated_depreciation", None) if item else None))
        if payload.get("book_value") is None and cost:
            payload["book_value"] = quantize_money(max(cost - accumulated, Decimal("0")))


class DepreciationService(BaseFinanceService):
    repository = DepreciationEntryRepository
    entity_name = "Depreciation entry"
    required_fields = ("organization_id", "asset_id", "depreciation_date", "amount")
    export_fields = ("id", "uuid", "organization_id", "asset_id", "fiscal_period_id", "depreciation_date", "amount", "book_value", "status")

    @classmethod
    def calculate_monthly(cls, asset: Asset) -> Decimal:
        depreciable = decimal_or_zero(asset.acquisition_cost) - decimal_or_zero(asset.salvage_value)
        if asset.useful_life_months <= 0:
            raise HTTPException(status_code=400, detail={"success": False, "message": "Asset useful life must be positive"})
        return quantize_money(max(depreciable / Decimal(asset.useful_life_months), Decimal("0")))

    @classmethod
    def create(cls, db: Session, data: Any, user_id: int | None = None) -> DepreciationEntry:
        entry = super().create(db, data, user_id)
        asset = db.query(Asset).filter(Asset.id == entry.asset_id).first()
        if asset:
            asset.accumulated_depreciation = entry.accumulated_depreciation
            asset.book_value = entry.book_value
            asset.updated_by = user_id
            db.commit()
            db.refresh(entry)
        return entry

    @classmethod
    def depreciate_asset(
        cls,
        db: Session,
        *,
        asset_id: int,
        depreciation_date: date,
        fiscal_period_id: int | None = None,
        user_id: int | None = None,
    ) -> DepreciationEntry:
        asset = db.query(Asset).filter(Asset.id == asset_id, Asset.deleted_at.is_(None)).first()
        if not asset:
            raise HTTPException(status_code=404, detail={"success": False, "message": "Asset not found"})
        amount = cls.calculate_monthly(asset)
        accumulated = quantize_money(decimal_or_zero(asset.accumulated_depreciation) + amount)
        book_value = quantize_money(max(decimal_or_zero(asset.acquisition_cost) - accumulated, Decimal("0")))
        data = {
            "organization_id": asset.organization_id,
            "asset_id": asset.id,
            "fiscal_period_id": fiscal_period_id,
            "depreciation_date": depreciation_date,
            "amount": amount,
            "accumulated_depreciation": accumulated,
            "book_value": book_value,
            "status": "posted",
        }
        return cls.create(db, data, user_id)


class ClosingService(BaseFinanceService):
    repository = FinancialClosingRepository
    entity_name = "Financial closing"
    required_fields = ("organization_id", "closing_type")
    export_fields = ("id", "uuid", "organization_id", "company_id", "fiscal_year_id", "fiscal_period_id", "closing_type", "closing_date", "status")

    @classmethod
    def close_period(cls, db: Session, *, fiscal_period_id: int, user_id: int | None = None) -> FinancialClosing:
        period = db.query(FiscalPeriod).filter(FiscalPeriod.id == fiscal_period_id, FiscalPeriod.deleted_at.is_(None)).first()
        if not period:
            raise HTTPException(status_code=404, detail={"success": False, "message": "Fiscal period not found"})
        period.status = "Closed"
        period.locked_at = utc_now()
        period.locked_by = user_id
        closing = FinancialClosing(
            organization_id=period.organization_id,
            fiscal_year_id=period.fiscal_year_id,
            fiscal_period_id=period.id,
            closing_type="Period",
            status="Closed",
            closed_by=user_id,
            created_by=user_id,
        )
        db.add(closing)
        db.commit()
        db.refresh(closing)
        return closing

    @classmethod
    def close_year(cls, db: Session, *, fiscal_year_id: int, user_id: int | None = None) -> FinancialClosing:
        fiscal_year = db.query(FiscalYear).filter(FiscalYear.id == fiscal_year_id, FiscalYear.deleted_at.is_(None)).first()
        if not fiscal_year:
            raise HTTPException(status_code=404, detail={"success": False, "message": "Fiscal year not found"})
        fiscal_year.status = "Closed"
        fiscal_year.closed_at = utc_now()
        fiscal_year.closed_by = user_id
        closing = FinancialClosing(
            organization_id=fiscal_year.organization_id,
            company_id=fiscal_year.company_id,
            fiscal_year_id=fiscal_year.id,
            closing_type="Year",
            status="Closed",
            closed_by=user_id,
            created_by=user_id,
        )
        db.add(closing)
        db.commit()
        db.refresh(closing)
        return closing


class AuditService(BaseFinanceService):
    repository = AuditLogRepository
    entity_name = "Audit log"
    required_fields = ("organization_id", "entity_type", "action")
    export_fields = ("id", "uuid", "organization_id", "user_id", "entity_type", "entity_id", "action", "occurred_at")

    @classmethod
    def log(
        cls,
        db: Session,
        *,
        organization_id: int,
        entity_type: str,
        action: str,
        user_id: int | None = None,
        entity_id: int | None = None,
        old_values: dict[str, Any] | None = None,
        new_values: dict[str, Any] | None = None,
        description: str | None = None,
    ) -> AuditLog:
        entry = AuditLog(
            organization_id=organization_id,
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            old_values=old_values,
            new_values=new_values,
            description=description,
            created_by=user_id,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry


class AccountingService:
    @classmethod
    def post_invoice(
        cls,
        db: Session,
        *,
        invoice_id: int,
        receivable_account_id: int,
        revenue_account_id: int,
        tax_account_id: int | None = None,
        user_id: int | None = None,
    ) -> JournalEntry:
        invoice = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.deleted_at.is_(None)).first()
        if not invoice:
            raise HTTPException(status_code=404, detail={"success": False, "message": "Invoice not found"})
        lines = [
            JournalEntryLineCreate(account_id=receivable_account_id, debit=invoice.grand_total, credit=0, description="Accounts receivable"),
            JournalEntryLineCreate(account_id=revenue_account_id, debit=0, credit=invoice.subtotal, description="Invoice revenue"),
        ]
        if tax_account_id and decimal_or_zero(invoice.tax_total):
            lines.append(JournalEntryLineCreate(account_id=tax_account_id, debit=0, credit=invoice.tax_total, description="Output tax"))
        journal = JournalEntryCreate(
            organization_id=invoice.organization_id,
            company_id=invoice.company_id,
            currency_id=None,
            entry_number=generate_identifier("INV-JE", invoice.invoice_number),
            entry_date=invoice.invoice_date,
            source_type="invoice",
            source_id=invoice.id,
            description=f"Invoice posting {invoice.invoice_number}",
            status="Posted",
            lines=lines,
        )
        return JournalService.create(db, journal, user_id)

    @classmethod
    def post_order(
        cls,
        db: Session,
        *,
        order_id: int,
        receivable_account_id: int,
        revenue_account_id: int,
        tax_account_id: int | None = None,
        user_id: int | None = None,
    ) -> JournalEntry:
        invoice = (
            db.query(Invoice)
            .filter(Invoice.order_id == order_id, Invoice.deleted_at.is_(None))
            .order_by(Invoice.invoice_date.desc())
            .first()
        )
        if not invoice:
            raise HTTPException(status_code=404, detail={"success": False, "message": "No invoice found for order"})
        return cls.post_invoice(
            db,
            invoice_id=invoice.id,
            receivable_account_id=receivable_account_id,
            revenue_account_id=revenue_account_id,
            tax_account_id=tax_account_id,
            user_id=user_id,
        )

    @classmethod
    def post_inventory_valuation(
        cls,
        db: Session,
        *,
        organization_id: int,
        inventory_account_id: int,
        cogs_account_id: int,
        amount: Decimal,
        source_type: str = "inventory_valuation",
        source_id: int | None = None,
        user_id: int | None = None,
    ) -> JournalEntry:
        journal = JournalEntryCreate(
            organization_id=organization_id,
            entry_number=generate_identifier("COGS", str(source_id or organization_id)),
            entry_date=utc_now(),
            source_type=source_type,
            source_id=source_id,
            description="Inventory valuation and COGS posting",
            status="Posted",
            lines=[
                JournalEntryLineCreate(account_id=cogs_account_id, debit=amount, credit=0, description="Cost of goods sold"),
                JournalEntryLineCreate(account_id=inventory_account_id, debit=0, credit=amount, description="Inventory reduction"),
            ],
        )
        return JournalService.create(db, journal, user_id)

    @staticmethod
    def calculate_cogs(quantity: int, unit_cost: Decimal) -> Decimal:
        return quantize_money(Decimal(quantity) * decimal_or_zero(unit_cost))
