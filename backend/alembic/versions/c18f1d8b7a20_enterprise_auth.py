"""Enterprise authentication and authorization

Revision ID: c18f1d8b7a20
Revises: 434fec88a749
Create Date: 2026-07-13 18:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c18f1d8b7a20"
down_revision: Union[str, Sequence[str], None] = "434fec88a749"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROLE_NAMES = [
    "Admin",
    "Owner",
    "CEO",
    "Manager",
    "HR",
    "Sales",
    "Finance",
    "Employee",
    "Customer",
]

PERMISSION_NAMES = [
    "users.create",
    "users.read",
    "users.update",
    "users.delete",
    "employees.*",
    "customers.*",
    "crm.*",
    "inventory.*",
    "finance.*",
    "marketing.*",
    "ai.*",
    "settings.*",
]


def upgrade() -> None:
    op.add_column("users", sa.Column("uuid", sa.String(length=36), nullable=True))
    op.add_column("users", sa.Column("phone", sa.String(length=50), nullable=True))
    op.add_column("users", sa.Column("role_id", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("organization_id", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("company_id", sa.Integer(), nullable=True))
    op.add_column(
        "users",
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("users", sa.Column("last_login", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "users",
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
    )
    op.add_column("users", sa.Column("email_verification_token_hash", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("email_verification_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("password_reset_token_hash", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("password_reset_expires_at", sa.DateTime(timezone=True), nullable=True))

    op.execute(
        "UPDATE users SET uuid = md5(random()::text || clock_timestamp()::text) WHERE uuid IS NULL"
    )
    op.alter_column("users", "uuid", nullable=False)
    op.create_index(op.f("ix_users_uuid"), "users", ["uuid"], unique=True)

    op.alter_column("roles", "name", existing_type=sa.String(), nullable=False)
    op.alter_column("permissions", "name", existing_type=sa.String(), nullable=False)
    op.create_unique_constraint("uq_roles_name", "roles", ["name"])
    op.create_unique_constraint("uq_permissions_name", "permissions", ["name"])

    roles_table = sa.table(
        "roles",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("description", sa.String),
    )
    permissions_table = sa.table(
        "permissions",
        sa.column("id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("description", sa.String),
    )

    for role_name in ROLE_NAMES:
        op.execute(
            roles_table.insert().values(
                name=role_name,
                description=f"{role_name} role",
            )
        )

    for permission_name in PERMISSION_NAMES:
        op.execute(
            permissions_table.insert().values(
                name=permission_name,
                description=f"Allows {permission_name}",
            )
        )

    op.execute(
        "UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'Owner' LIMIT 1) WHERE role_id IS NULL"
    )
    op.alter_column("users", "role_id", nullable=False)
    op.create_foreign_key("fk_users_role_id_roles", "users", "roles", ["role_id"], ["id"])
    op.create_foreign_key(
        "fk_users_organization_id_organizations",
        "users",
        "organizations",
        ["organization_id"],
        ["id"],
    )
    op.create_foreign_key("fk_users_company_id_companies", "users", "companies", ["company_id"], ["id"])

    op.create_table(
        "role_permissions",
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("permission_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["permission_id"], ["permissions.id"]),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"]),
        sa.PrimaryKeyConstraint("role_id", "permission_id"),
    )

    op.execute(
        """
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT roles.id, permissions.id
        FROM roles
        CROSS JOIN permissions
        WHERE roles.name IN ('Admin', 'Owner')
        """
    )

    op.create_table(
        "auth_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_jti", sa.String(length=64), nullable=False),
        sa.Column("token_type", sa.String(length=20), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_auth_tokens_id"), "auth_tokens", ["id"], unique=False)
    op.create_index(op.f("ix_auth_tokens_token_jti"), "auth_tokens", ["token_jti"], unique=True)
    op.create_index(op.f("ix_auth_tokens_user_id"), "auth_tokens", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_auth_tokens_user_id"), table_name="auth_tokens")
    op.drop_index(op.f("ix_auth_tokens_token_jti"), table_name="auth_tokens")
    op.drop_index(op.f("ix_auth_tokens_id"), table_name="auth_tokens")
    op.drop_table("auth_tokens")
    op.drop_table("role_permissions")
    op.drop_constraint("fk_users_company_id_companies", "users", type_="foreignkey")
    op.drop_constraint("fk_users_organization_id_organizations", "users", type_="foreignkey")
    op.drop_constraint("fk_users_role_id_roles", "users", type_="foreignkey")
    op.drop_constraint("uq_permissions_name", "permissions", type_="unique")
    op.drop_constraint("uq_roles_name", "roles", type_="unique")
    op.drop_index(op.f("ix_users_uuid"), table_name="users")
    op.drop_column("users", "password_reset_expires_at")
    op.drop_column("users", "password_reset_token_hash")
    op.drop_column("users", "email_verification_expires_at")
    op.drop_column("users", "email_verification_token_hash")
    op.drop_column("users", "updated_at")
    op.drop_column("users", "last_login")
    op.drop_column("users", "is_verified")
    op.drop_column("users", "company_id")
    op.drop_column("users", "organization_id")
    op.drop_column("users", "role_id")
    op.drop_column("users", "phone")
    op.drop_column("users", "uuid")
