"""Enterprise CRM module

Revision ID: 7b3f2a9c4d12
Revises: c18f1d8b7a20
Create Date: 2026-07-13 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7b3f2a9c4d12"
down_revision: Union[str, Sequence[str], None] = "c18f1d8b7a20"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


CRM_PERMISSIONS = [
    "crm.manage",
    "customers.read",
    "customers.create",
    "customers.update",
    "customers.delete",
    "leads.read",
    "leads.create",
    "leads.update",
    "leads.delete",
    "contacts.read",
    "contacts.create",
    "contacts.update",
    "contacts.delete",
    "opportunities.read",
    "opportunities.create",
    "opportunities.update",
    "opportunities.delete",
    "activities.read",
    "activities.create",
    "activities.update",
    "activities.delete",
    "tasks.read",
    "tasks.create",
    "tasks.update",
    "tasks.delete",
]


def audit_columns() -> list[sa.Column]:
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("updated_by", sa.Integer(), nullable=True),
        sa.Column("deleted_by", sa.Integer(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    ]


def audit_fks(table_name: str) -> list[sa.ForeignKeyConstraint]:
    return [
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], name=f"fk_{table_name}_created_by_users"),
        sa.ForeignKeyConstraint(["updated_by"], ["users.id"], name=f"fk_{table_name}_updated_by_users"),
        sa.ForeignKeyConstraint(["deleted_by"], ["users.id"], name=f"fk_{table_name}_deleted_by_users"),
    ]


def upgrade() -> None:
    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("uuid", sa.String(length=36), nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=True),
        sa.Column("customer_code", sa.String(length=50), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("mobile", sa.String(length=50), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("industry", sa.String(length=150), nullable=True),
        sa.Column("customer_type", sa.String(length=50), nullable=False, server_default="individual"),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("assigned_to", sa.Integer(), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("notes", sa.Text(), nullable=True),
        *audit_columns(),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], name="fk_customers_organization_id"),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], name="fk_customers_company_id"),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"], name="fk_customers_assigned_to"),
        *audit_fks("customers"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("customer_code", name="uq_customers_customer_code"),
        sa.UniqueConstraint("uuid", name="uq_customers_uuid"),
    )
    op.create_index("ix_customers_deleted_at", "customers", ["deleted_at"])
    op.create_index("ix_customers_email", "customers", ["email"])
    op.create_index("ix_customers_phone", "customers", ["phone"])
    op.create_index("ix_customers_status", "customers", ["status"])
    op.create_index("ix_customers_organization_id", "customers", ["organization_id"])
    op.create_index("ix_customers_company_id", "customers", ["company_id"])

    op.create_table(
        "leads",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("uuid", sa.String(length=36), nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("lead_number", sa.String(length=50), nullable=False),
        sa.Column("full_name", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("company", sa.String(length=150), nullable=True),
        sa.Column("position", sa.String(length=150), nullable=True),
        sa.Column("source", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="new"),
        sa.Column("priority", sa.String(length=50), nullable=False, server_default="medium"),
        sa.Column("estimated_value", sa.Numeric(14, 2), nullable=True),
        sa.Column("assigned_to", sa.Integer(), nullable=True),
        sa.Column("next_followup", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        *audit_columns(),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], name="fk_leads_organization_id"),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"], name="fk_leads_assigned_to"),
        *audit_fks("leads"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("lead_number", name="uq_leads_lead_number"),
        sa.UniqueConstraint("uuid", name="uq_leads_uuid"),
    )
    op.create_index("ix_leads_deleted_at", "leads", ["deleted_at"])
    op.create_index("ix_leads_email", "leads", ["email"])
    op.create_index("ix_leads_phone", "leads", ["phone"])
    op.create_index("ix_leads_company", "leads", ["company"])
    op.create_index("ix_leads_status", "leads", ["status"])
    op.create_index("ix_leads_organization_id", "leads", ["organization_id"])

    op.create_table(
        "contacts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("uuid", sa.String(length=36), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("department", sa.String(length=150), nullable=True),
        sa.Column("position", sa.String(length=150), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.false()),
        *audit_columns(),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], name="fk_contacts_customer_id"),
        *audit_fks("contacts"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_contacts_uuid"),
    )
    op.create_index("ix_contacts_customer_id", "contacts", ["customer_id"])
    op.create_index("ix_contacts_email", "contacts", ["email"])
    op.create_index("ix_contacts_phone", "contacts", ["phone"])
    op.create_index("ix_contacts_deleted_at", "contacts", ["deleted_at"])

    op.create_table(
        "opportunities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("uuid", sa.String(length=36), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("pipeline", sa.String(length=100), nullable=False, server_default="default"),
        sa.Column("stage", sa.String(length=50), nullable=False, server_default="New Lead"),
        sa.Column("probability", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("expected_revenue", sa.Numeric(14, 2), nullable=True),
        sa.Column("expected_close_date", sa.Date(), nullable=True),
        sa.Column("owner", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="open"),
        *audit_columns(),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], name="fk_opportunities_customer_id"),
        sa.ForeignKeyConstraint(["owner"], ["users.id"], name="fk_opportunities_owner"),
        *audit_fks("opportunities"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_opportunities_uuid"),
    )
    op.create_index("ix_opportunities_customer_id", "opportunities", ["customer_id"])
    op.create_index("ix_opportunities_stage", "opportunities", ["stage"])
    op.create_index("ix_opportunities_status", "opportunities", ["status"])
    op.create_index("ix_opportunities_deleted_at", "opportunities", ["deleted_at"])

    op.create_table(
        "activities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("uuid", sa.String(length=36), nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=True),
        sa.Column("lead_id", sa.Integer(), nullable=True),
        sa.Column("contact_id", sa.Integer(), nullable=True),
        sa.Column("opportunity_id", sa.Integer(), nullable=True),
        sa.Column("activity_type", sa.String(length=50), nullable=False),
        sa.Column("subject", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("activity_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("owner", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="planned"),
        *audit_columns(),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], name="fk_activities_organization_id"),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], name="fk_activities_customer_id"),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], name="fk_activities_lead_id"),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"], name="fk_activities_contact_id"),
        sa.ForeignKeyConstraint(["opportunity_id"], ["opportunities.id"], name="fk_activities_opportunity_id"),
        sa.ForeignKeyConstraint(["owner"], ["users.id"], name="fk_activities_owner"),
        *audit_fks("activities"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_activities_uuid"),
    )
    op.create_index("ix_activities_activity_at", "activities", ["activity_at"])
    op.create_index("ix_activities_customer_id", "activities", ["customer_id"])
    op.create_index("ix_activities_lead_id", "activities", ["lead_id"])
    op.create_index("ix_activities_status", "activities", ["status"])
    op.create_index("ix_activities_deleted_at", "activities", ["deleted_at"])

    op.create_table(
        "crm_tasks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("uuid", sa.String(length=36), nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=True),
        sa.Column("lead_id", sa.Integer(), nullable=True),
        sa.Column("contact_id", sa.Integer(), nullable=True),
        sa.Column("opportunity_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("assigned_to", sa.Integer(), nullable=False),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reminder_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="open"),
        sa.Column("priority", sa.String(length=50), nullable=False, server_default="medium"),
        *audit_columns(),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], name="fk_crm_tasks_organization_id"),
        sa.ForeignKeyConstraint(["customer_id"], ["customers.id"], name="fk_crm_tasks_customer_id"),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], name="fk_crm_tasks_lead_id"),
        sa.ForeignKeyConstraint(["contact_id"], ["contacts.id"], name="fk_crm_tasks_contact_id"),
        sa.ForeignKeyConstraint(["opportunity_id"], ["opportunities.id"], name="fk_crm_tasks_opportunity_id"),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"], name="fk_crm_tasks_assigned_to"),
        *audit_fks("crm_tasks"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uuid", name="uq_crm_tasks_uuid"),
    )
    op.create_index("ix_crm_tasks_assigned_to", "crm_tasks", ["assigned_to"])
    op.create_index("ix_crm_tasks_customer_id", "crm_tasks", ["customer_id"])
    op.create_index("ix_crm_tasks_due_date", "crm_tasks", ["due_date"])
    op.create_index("ix_crm_tasks_status", "crm_tasks", ["status"])
    op.create_index("ix_crm_tasks_deleted_at", "crm_tasks", ["deleted_at"])

    for permission in CRM_PERMISSIONS:
        op.execute(
            sa.text(
                """
                INSERT INTO permissions (name, description)
                SELECT :name, :description
                WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = :name)
                """
            ).bindparams(name=permission, description=f"Allows {permission}")
        )

    op.execute(
        """
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles.id, permissions.id
        FROM roles
        CROSS JOIN permissions
        WHERE roles.name IN ('Admin', 'Owner')
          AND permissions.name IN (
            'crm.manage',
            'customers.read', 'customers.create', 'customers.update', 'customers.delete',
            'leads.read', 'leads.create', 'leads.update', 'leads.delete',
            'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete',
            'opportunities.read', 'opportunities.create', 'opportunities.update', 'opportunities.delete',
            'activities.read', 'activities.create', 'activities.update', 'activities.delete',
            'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete'
          )
          AND NOT EXISTS (
            SELECT 1 FROM role_permissions rp
            WHERE rp.role_id = roles.id AND rp.permission_id = permissions.id
          )
        """
    )


def downgrade() -> None:
    op.execute(
        """
        DELETE FROM role_permissions
        USING permissions
        WHERE role_permissions.permission_id = permissions.id
          AND permissions.name IN (
            'crm.manage',
            'customers.read', 'customers.create', 'customers.update', 'customers.delete',
            'leads.read', 'leads.create', 'leads.update', 'leads.delete',
            'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete',
            'opportunities.read', 'opportunities.create', 'opportunities.update', 'opportunities.delete',
            'activities.read', 'activities.create', 'activities.update', 'activities.delete',
            'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete'
          )
        """
    )
    op.execute(
        """
        DELETE FROM permissions
        WHERE name IN (
            'crm.manage',
            'customers.read', 'customers.create', 'customers.update', 'customers.delete',
            'leads.read', 'leads.create', 'leads.update', 'leads.delete',
            'contacts.read', 'contacts.create', 'contacts.update', 'contacts.delete',
            'opportunities.read', 'opportunities.create', 'opportunities.update', 'opportunities.delete',
            'activities.read', 'activities.create', 'activities.update', 'activities.delete',
            'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete'
        )
        """
    )

    op.drop_table("crm_tasks")
    op.drop_table("activities")
    op.drop_table("opportunities")
    op.drop_table("contacts")
    op.drop_table("leads")
    op.drop_table("customers")
