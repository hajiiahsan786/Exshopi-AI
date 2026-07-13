from datetime import date, datetime
from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.api.v1.endpoints.finance_router_factory import create_finance_router
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas import finance as schemas
from app.schemas.crm_common import APIResponse
from app.security.finance_permissions import require_finance_permission
from app.services import finance_service as services
from app.services.inventory_service import build_xlsx, serialize_export_value


account_types_router = create_finance_router(
    service=services.AccountTypeService,
    create_schema=schemas.AccountTypeCreate,
    update_schema=schemas.AccountTypeUpdate,
    single_response=schemas.AccountTypeSingleResponse,
    list_response=schemas.AccountTypeListResponse,
    permission_prefix="finance.account-types",
    entity_label="Account types",
)

chart_of_accounts_router = create_finance_router(
    service=services.ChartOfAccountService,
    create_schema=schemas.ChartOfAccountCreate,
    update_schema=schemas.ChartOfAccountUpdate,
    single_response=schemas.ChartOfAccountSingleResponse,
    list_response=schemas.ChartOfAccountListResponse,
    permission_prefix="finance.chart-of-accounts",
    entity_label="Chart of accounts",
)

currencies_router = create_finance_router(
    service=services.CurrencyService,
    create_schema=schemas.CurrencyCreate,
    update_schema=schemas.CurrencyUpdate,
    single_response=schemas.CurrencySingleResponse,
    list_response=schemas.CurrencyListResponse,
    permission_prefix="finance.currencies",
    entity_label="Currencies",
)

exchange_rates_router = create_finance_router(
    service=services.ExchangeRateService,
    create_schema=schemas.ExchangeRateCreate,
    update_schema=schemas.ExchangeRateUpdate,
    single_response=schemas.ExchangeRateSingleResponse,
    list_response=schemas.ExchangeRateListResponse,
    permission_prefix="finance.exchange-rates",
    entity_label="Exchange rates",
)

fiscal_years_router = create_finance_router(
    service=services.FiscalYearService,
    create_schema=schemas.FiscalYearCreate,
    update_schema=schemas.FiscalYearUpdate,
    single_response=schemas.FiscalYearSingleResponse,
    list_response=schemas.FiscalYearListResponse,
    permission_prefix="finance.fiscal-years",
    entity_label="Fiscal years",
)

fiscal_periods_router = create_finance_router(
    service=services.FiscalPeriodService,
    create_schema=schemas.FiscalPeriodCreate,
    update_schema=schemas.FiscalPeriodUpdate,
    single_response=schemas.FiscalPeriodSingleResponse,
    list_response=schemas.FiscalPeriodListResponse,
    permission_prefix="finance.fiscal-periods",
    entity_label="Fiscal periods",
)

cost_centers_router = create_finance_router(
    service=services.CostCenterService,
    create_schema=schemas.CostCenterCreate,
    update_schema=schemas.CostCenterUpdate,
    single_response=schemas.CostCenterSingleResponse,
    list_response=schemas.CostCenterListResponse,
    permission_prefix="finance.cost-centers",
    entity_label="Cost centers",
)

journal_entries_router = create_finance_router(
    service=services.JournalService,
    create_schema=schemas.JournalEntryCreate,
    update_schema=schemas.JournalEntryUpdate,
    single_response=schemas.JournalEntrySingleResponse,
    list_response=schemas.JournalEntryListResponse,
    permission_prefix="finance.journal-entries",
    entity_label="Journal entries",
)

general_ledger_router = create_finance_router(
    service=services.LedgerService,
    create_schema=schemas.GeneralLedgerCreate,
    update_schema=schemas.GeneralLedgerUpdate,
    single_response=schemas.GeneralLedgerSingleResponse,
    list_response=schemas.GeneralLedgerListResponse,
    permission_prefix="finance.general-ledger",
    entity_label="General ledger",
)

budgets_router = create_finance_router(
    service=services.BudgetService,
    create_schema=schemas.BudgetCreate,
    update_schema=schemas.BudgetUpdate,
    single_response=schemas.BudgetSingleResponse,
    list_response=schemas.BudgetListResponse,
    permission_prefix="finance.budgets",
    entity_label="Budgets",
)

bank_accounts_router = create_finance_router(
    service=services.BankService,
    create_schema=schemas.BankAccountCreate,
    update_schema=schemas.BankAccountUpdate,
    single_response=schemas.BankAccountSingleResponse,
    list_response=schemas.BankAccountListResponse,
    permission_prefix="finance.bank-accounts",
    entity_label="Bank accounts",
)

bank_transactions_router = create_finance_router(
    service=services.BankTransactionService,
    create_schema=schemas.BankTransactionCreate,
    update_schema=schemas.BankTransactionUpdate,
    single_response=schemas.BankTransactionSingleResponse,
    list_response=schemas.BankTransactionListResponse,
    permission_prefix="finance.bank-transactions",
    entity_label="Bank transactions",
)

expense_categories_router = create_finance_router(
    service=services.ExpenseCategoryService,
    create_schema=schemas.ExpenseCategoryCreate,
    update_schema=schemas.ExpenseCategoryUpdate,
    single_response=schemas.ExpenseCategorySingleResponse,
    list_response=schemas.ExpenseCategoryListResponse,
    permission_prefix="finance.expense-categories",
    entity_label="Expense categories",
)

expenses_router = create_finance_router(
    service=services.ExpenseService,
    create_schema=schemas.ExpenseCreate,
    update_schema=schemas.ExpenseUpdate,
    single_response=schemas.ExpenseSingleResponse,
    list_response=schemas.ExpenseListResponse,
    permission_prefix="finance.expenses",
    entity_label="Expenses",
)

vendor_bills_router = create_finance_router(
    service=services.VendorBillService,
    create_schema=schemas.VendorBillCreate,
    update_schema=schemas.VendorBillUpdate,
    single_response=schemas.VendorBillSingleResponse,
    list_response=schemas.VendorBillListResponse,
    permission_prefix="finance.vendor-bills",
    entity_label="Vendor bills",
)

vendor_credit_notes_router = create_finance_router(
    service=services.VendorCreditNoteService,
    create_schema=schemas.VendorCreditNoteCreate,
    update_schema=schemas.VendorCreditNoteUpdate,
    single_response=schemas.VendorCreditNoteSingleResponse,
    list_response=schemas.VendorCreditNoteListResponse,
    permission_prefix="finance.vendor-credit-notes",
    entity_label="Vendor credit notes",
)

customer_credit_notes_router = create_finance_router(
    service=services.CustomerCreditNoteService,
    create_schema=schemas.CustomerCreditNoteCreate,
    update_schema=schemas.CustomerCreditNoteUpdate,
    single_response=schemas.CustomerCreditNoteSingleResponse,
    list_response=schemas.CustomerCreditNoteListResponse,
    permission_prefix="finance.customer-credit-notes",
    entity_label="Customer credit notes",
)

debit_notes_router = create_finance_router(
    service=services.DebitNoteService,
    create_schema=schemas.DebitNoteCreate,
    update_schema=schemas.DebitNoteUpdate,
    single_response=schemas.DebitNoteSingleResponse,
    list_response=schemas.DebitNoteListResponse,
    permission_prefix="finance.debit-notes",
    entity_label="Debit notes",
)

payment_allocations_router = create_finance_router(
    service=services.PaymentAllocationService,
    create_schema=schemas.PaymentAllocationCreate,
    update_schema=schemas.PaymentAllocationUpdate,
    single_response=schemas.PaymentAllocationSingleResponse,
    list_response=schemas.PaymentAllocationListResponse,
    permission_prefix="finance.payment-allocations",
    entity_label="Payment allocations",
)

recurring_journals_router = create_finance_router(
    service=services.RecurringJournalService,
    create_schema=schemas.RecurringJournalCreate,
    update_schema=schemas.RecurringJournalUpdate,
    single_response=schemas.RecurringJournalSingleResponse,
    list_response=schemas.RecurringJournalListResponse,
    permission_prefix="finance.recurring-journals",
    entity_label="Recurring journals",
)

tax_rates_router = create_finance_router(
    service=services.TaxService,
    create_schema=schemas.TaxRateCreate,
    update_schema=schemas.TaxRateUpdate,
    single_response=schemas.TaxRateSingleResponse,
    list_response=schemas.TaxRateListResponse,
    permission_prefix="finance.taxes",
    entity_label="Tax rates",
)

tax_groups_router = create_finance_router(
    service=services.TaxGroupService,
    create_schema=schemas.TaxGroupCreate,
    update_schema=schemas.TaxGroupUpdate,
    single_response=schemas.TaxGroupSingleResponse,
    list_response=schemas.TaxGroupListResponse,
    permission_prefix="finance.tax-groups",
    entity_label="Tax groups",
)

payment_terms_router = create_finance_router(
    service=services.PaymentTermService,
    create_schema=schemas.PaymentTermCreate,
    update_schema=schemas.PaymentTermUpdate,
    single_response=schemas.PaymentTermSingleResponse,
    list_response=schemas.PaymentTermListResponse,
    permission_prefix="finance.payment-terms",
    entity_label="Payment terms",
)

payment_schedules_router = create_finance_router(
    service=services.PaymentScheduleService,
    create_schema=schemas.PaymentScheduleCreate,
    update_schema=schemas.PaymentScheduleUpdate,
    single_response=schemas.PaymentScheduleSingleResponse,
    list_response=schemas.PaymentScheduleListResponse,
    permission_prefix="finance.payment-schedules",
    entity_label="Payment schedules",
)

asset_categories_router = create_finance_router(
    service=services.AssetCategoryService,
    create_schema=schemas.AssetCategoryCreate,
    update_schema=schemas.AssetCategoryUpdate,
    single_response=schemas.AssetCategorySingleResponse,
    list_response=schemas.AssetCategoryListResponse,
    permission_prefix="finance.asset-categories",
    entity_label="Asset categories",
)

assets_router = create_finance_router(
    service=services.AssetService,
    create_schema=schemas.AssetCreate,
    update_schema=schemas.AssetUpdate,
    single_response=schemas.AssetSingleResponse,
    list_response=schemas.AssetListResponse,
    permission_prefix="finance.assets",
    entity_label="Assets",
)

depreciation_router = create_finance_router(
    service=services.DepreciationService,
    create_schema=schemas.DepreciationEntryCreate,
    update_schema=schemas.DepreciationEntryUpdate,
    single_response=schemas.DepreciationEntrySingleResponse,
    list_response=schemas.DepreciationEntryListResponse,
    permission_prefix="finance.depreciation",
    entity_label="Depreciation",
)

financial_closing_router = create_finance_router(
    service=services.ClosingService,
    create_schema=schemas.FinancialClosingCreate,
    update_schema=schemas.FinancialClosingUpdate,
    single_response=schemas.FinancialClosingSingleResponse,
    list_response=schemas.FinancialClosingListResponse,
    permission_prefix="finance.financial-closing",
    entity_label="Financial closing",
)

audit_logs_router = create_finance_router(
    service=services.AuditService,
    create_schema=schemas.AuditLogCreate,
    update_schema=schemas.AuditLogUpdate,
    single_response=schemas.AuditLogSingleResponse,
    list_response=schemas.AuditLogListResponse,
    permission_prefix="finance.audit-logs",
    entity_label="Audit logs",
)


@journal_entries_router.post("/{item_id}/post", response_model=schemas.JournalEntrySingleResponse)
def post_journal_entry(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.journal-entries.update", "finance.manage")),
):
    item = services.JournalService.post(db, item_id, current_user.id)
    return APIResponse(message="Journal entry posted successfully", data=item)


@journal_entries_router.post("/{item_id}/reverse", response_model=schemas.JournalEntrySingleResponse)
def reverse_journal_entry(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.journal-entries.update", "finance.manage")),
):
    item = services.JournalService.reverse(db, item_id, current_user.id)
    return APIResponse(message="Journal entry reversed successfully", data=item)


@bank_transactions_router.post("/{item_id}/reconcile", response_model=schemas.BankTransactionSingleResponse)
def reconcile_bank_transaction(
    item_id: int,
    journal_entry_id: int | None = Query(default=None),
    reconciled_amount: Decimal | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.bank-transactions.update", "finance.manage")),
):
    item = services.BankService.reconcile(
        db,
        bank_transaction_id=item_id,
        journal_entry_id=journal_entry_id,
        reconciled_amount=reconciled_amount,
        user_id=current_user.id,
    )
    return APIResponse(message="Bank transaction reconciled successfully", data=item)


@depreciation_router.post("/assets/{asset_id}/run", response_model=schemas.DepreciationEntrySingleResponse)
def run_asset_depreciation(
    asset_id: int,
    depreciation_date: date,
    fiscal_period_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.depreciation.create", "finance.manage")),
):
    item = services.DepreciationService.depreciate_asset(
        db,
        asset_id=asset_id,
        depreciation_date=depreciation_date,
        fiscal_period_id=fiscal_period_id,
        user_id=current_user.id,
    )
    return APIResponse(message="Asset depreciation posted successfully", data=item)


@financial_closing_router.post("/periods/{fiscal_period_id}/close", response_model=schemas.FinancialClosingSingleResponse)
def close_fiscal_period(
    fiscal_period_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.financial-closing.create", "finance.manage")),
):
    item = services.ClosingService.close_period(db, fiscal_period_id=fiscal_period_id, user_id=current_user.id)
    return APIResponse(message="Fiscal period closed successfully", data=item)


@financial_closing_router.post("/years/{fiscal_year_id}/close", response_model=schemas.FinancialClosingSingleResponse)
def close_fiscal_year(
    fiscal_year_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.financial-closing.create", "finance.manage")),
):
    item = services.ClosingService.close_year(db, fiscal_year_id=fiscal_year_id, user_id=current_user.id)
    return APIResponse(message="Fiscal year closed successfully", data=item)


@tax_rates_router.get("/calculate/amount")
def calculate_tax(
    amount: Decimal = Query(ge=0),
    rate: Decimal = Query(ge=0, le=100),
    inclusive: bool = Query(default=False),
    current_user: User = Depends(require_finance_permission("finance.taxes.read", "finance.manage")),
):
    del current_user
    return APIResponse(message="Tax calculated successfully", data=services.TaxService.calculate(amount, rate, inclusive))


@currencies_router.get("/convert/amount")
def convert_currency(
    organization_id: int,
    amount: Decimal,
    from_currency_id: int,
    to_currency_id: int,
    conversion_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.currencies.read", "finance.manage")),
):
    del current_user
    result = services.CurrencyService.convert(
        db,
        organization_id=organization_id,
        amount=amount,
        from_currency_id=from_currency_id,
        to_currency_id=to_currency_id,
        conversion_date=conversion_date,
    )
    return APIResponse(message="Currency converted successfully", data=result)


trial_balance_router = APIRouter()
profit_loss_router = APIRouter()
balance_sheet_router = APIRouter()
cash_flow_router = APIRouter()


def _export_report(report_name: str, data: dict[str, Any], export_format: str) -> Response | APIResponse:
    if export_format == "json":
        return APIResponse(message=f"{report_name} generated successfully", data=data)
    rows = data.get("items") or data.get("revenue") or data.get("assets") or data.get("accounts") or []
    if not rows:
        rows = [data]
    fields = tuple(rows[0].keys()) if rows and isinstance(rows[0], dict) else ("value",)
    if export_format == "xlsx":
        return Response(
            content=build_xlsx(rows, fields),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{report_name}.xlsx"'},
        )
    output = []
    output.append(",".join(fields))
    for row in rows:
        output.append(",".join(serialize_export_value(row.get(field)) for field in fields))
    return Response(
        content="\n".join(output),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{report_name}.csv"'},
    )


@trial_balance_router.get("/")
def trial_balance(
    organization_id: int,
    fiscal_period_id: int | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    export_format: str = Query(default="json", alias="format", pattern="^(json|csv|xlsx)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.reports.read", "finance.manage")),
):
    del current_user
    data = services.TrialBalanceService.generate(
        db,
        organization_id=organization_id,
        fiscal_period_id=fiscal_period_id,
        date_from=date_from,
        date_to=date_to,
    )
    return _export_report("trial-balance", data, export_format)


@profit_loss_router.get("/")
def profit_loss(
    organization_id: int,
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    export_format: str = Query(default="json", alias="format", pattern="^(json|csv|xlsx)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.reports.read", "finance.manage")),
):
    del current_user
    data = services.ProfitLossService.generate(db, organization_id=organization_id, date_from=date_from, date_to=date_to)
    return _export_report("profit-loss", data, export_format)


@balance_sheet_router.get("/")
def balance_sheet(
    organization_id: int,
    as_of: datetime | None = Query(default=None),
    export_format: str = Query(default="json", alias="format", pattern="^(json|csv|xlsx)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.reports.read", "finance.manage")),
):
    del current_user
    data = services.BalanceSheetService.generate(db, organization_id=organization_id, as_of=as_of)
    return _export_report("balance-sheet", data, export_format)


@cash_flow_router.get("/")
def cash_flow(
    organization_id: int,
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    export_format: str = Query(default="json", alias="format", pattern="^(json|csv|xlsx)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_finance_permission("finance.reports.read", "finance.manage")),
):
    del current_user
    data = services.CashFlowService.generate(db, organization_id=organization_id, date_from=date_from, date_to=date_to)
    return _export_report("cash-flow", data, export_format)


FINANCE_ROUTERS = (
    (account_types_router, "/account-types", ["Account Types"]),
    (chart_of_accounts_router, "/chart-of-accounts", ["Chart Of Accounts"]),
    (journal_entries_router, "/journal-entries", ["Journal Entries"]),
    (general_ledger_router, "/general-ledger", ["General Ledger"]),
    (fiscal_years_router, "/fiscal-years", ["Fiscal Years"]),
    (fiscal_periods_router, "/fiscal-periods", ["Fiscal Periods"]),
    (currencies_router, "/currencies", ["Currencies"]),
    (exchange_rates_router, "/exchange-rates", ["Exchange Rates"]),
    (cost_centers_router, "/cost-centers", ["Cost Centers"]),
    (budgets_router, "/budgets", ["Budgets"]),
    (bank_accounts_router, "/bank-accounts", ["Bank Accounts"]),
    (bank_transactions_router, "/bank-transactions", ["Bank Transactions"]),
    (expense_categories_router, "/expense-categories", ["Expense Categories"]),
    (expenses_router, "/expenses", ["Expenses"]),
    (vendor_bills_router, "/vendor-bills", ["Vendor Bills"]),
    (vendor_credit_notes_router, "/vendor-credit-notes", ["Vendor Credit Notes"]),
    (customer_credit_notes_router, "/customer-credit-notes", ["Customer Credit Notes"]),
    (debit_notes_router, "/debit-notes", ["Debit Notes"]),
    (payment_allocations_router, "/payment-allocations", ["Payment Allocations"]),
    (recurring_journals_router, "/recurring-journals", ["Recurring Journals"]),
    (tax_rates_router, "/tax-rates", ["Tax Rates"]),
    (tax_groups_router, "/tax-groups", ["Tax Groups"]),
    (payment_terms_router, "/payment-terms", ["Payment Terms"]),
    (payment_schedules_router, "/payment-schedules", ["Payment Schedules"]),
    (asset_categories_router, "/asset-categories", ["Asset Categories"]),
    (assets_router, "/assets", ["Assets"]),
    (depreciation_router, "/depreciation", ["Depreciation"]),
    (trial_balance_router, "/trial-balance", ["Trial Balance"]),
    (profit_loss_router, "/profit-loss", ["Profit & Loss"]),
    (balance_sheet_router, "/balance-sheet", ["Balance Sheet"]),
    (cash_flow_router, "/cash-flow", ["Cash Flow"]),
    (financial_closing_router, "/financial-closing", ["Financial Closing"]),
    (audit_logs_router, "/audit-logs", ["Audit Logs"]),
)
