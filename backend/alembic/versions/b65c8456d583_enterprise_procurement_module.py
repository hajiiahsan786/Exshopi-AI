"""enterprise procurement module

Revision ID: b65c8456d583
Revises: 4e8a1b6c9d20
Create Date: 2026-07-13 18:38:24.319199

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b65c8456d583'
down_revision: Union[str, Sequence[str], None] = '4e8a1b6c9d20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
