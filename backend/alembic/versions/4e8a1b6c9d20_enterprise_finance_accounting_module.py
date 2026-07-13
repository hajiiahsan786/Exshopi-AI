"""Enterprise finance and accounting module

Revision ID: 4e8a1b6c9d20
Revises: 3d7a0e5c2b11
Create Date: 2026-07-13 23:55:00.000000

"""

from typing import Sequence, Union

from alembic import op

from app.database.base import Base
import app.models  # noqa: F401


revision: str = "4e8a1b6c9d20"
down_revision: Union[str, Sequence[str], None] = "3d7a0e5c2b11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


FINANCE_TABLES = [
    "account_types",
    "currencies",
    "chart_of_accounts",
    "fiscal_years",
    "fiscal_periods",
    "exchange_rates",
    "cost_centers",
    "journal_entries",
    "tax_rates",
    "journal_entry_lines",
    "general_ledger",
    "budgets",
    "budget_lines",
    "bank_accounts",
    "bank_transactions",
    "expense_categories",
    "payment_terms",
    "expenses",
    "vendor_bills",
    "vendor_credit_notes",
    "customer_credit_notes",
    "debit_notes",
    "payment_allocations",
    "recurring_journals",
    "tax_groups",
    "payment_schedules",
    "asset_categories",
    "assets",
    "depreciation_entries",
    "financial_closings",
    "audit_logs",
]


FINANCE_RESOURCES = [
    "account-types",
    "chart-of-accounts",
    "journal-entries",
    "general-ledger",
    "fiscal-years",
    "fiscal-periods",
    "currencies",
    "exchange-rates",
    "cost-centers",
    "budgets",
    "bank-accounts",
    "bank-transactions",
    "expenses",
    "vendor-bills",
    "vendor-credit-notes",
    "customer-credit-notes",
    "debit-notes",
    "payment-allocations",
    "recurring-journals",
    "taxes",
    "tax-groups",
    "payment-terms",
    "payment-schedules",
    "assets",
    "depreciation",
    "financial-closing",
    "audit-logs",
    "reports",
]

FINANCE_PERMISSIONS = [
    "finance.create",
    "finance.read",
    "finance.update",
    "finance.delete",
    "finance.manage",
    "finance.*",
]

for resource in FINANCE_RESOURCES:
    FINANCE_PERMISSIONS.extend(
        [
            f"finance.{resource}.create",
            f"finance.{resource}.read",
            f"finance.{resource}.update",
            f"finance.{resource}.delete",
            f"finance.{resource}.manage",
            f"finance.{resource}.*",
        ]
    )


def upgrade() -> None:
    bind = op.get_bind()
    Base.metadata.create_all(bind=bind, tables=[Base.metadata.tables[name] for name in FINANCE_TABLES], checkfirst=True)

    for permission_name in FINANCE_PERMISSIONS:
        op.execute(
            f"""
            INSERT INTO permissions (name, description)
            VALUES ('{permission_name}', 'Allows {permission_name}')
            ON CONFLICT (name) DO NOTHING
            """
        )

    permission_names = "', '".join(FINANCE_PERMISSIONS)
    op.execute(
        f"""
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles.id, permissions.id
        FROM roles
        CROSS JOIN permissions
        WHERE roles.name IN ('Admin', 'Owner')
          AND permissions.name IN ('{permission_names}')
        ON CONFLICT DO NOTHING
        """
    )


def downgrade() -> None:
    permission_names = "', '".join(FINANCE_PERMISSIONS)
    op.execute(
        f"""
        DELETE FROM role_permissions
        USING permissions
        WHERE role_permissions.permission_id = permissions.id
          AND permissions.name IN ('{permission_names}')
        """
    )
    op.execute(f"DELETE FROM permissions WHERE name IN ('{permission_names}')")

    bind = op.get_bind()
    Base.metadata.drop_all(bind=bind, tables=[Base.metadata.tables[name] for name in FINANCE_TABLES], checkfirst=True)
