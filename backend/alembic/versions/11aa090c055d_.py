"""empty message

Revision ID: 11aa090c055d
Revises: 4e8a1b6c9d20, 8c2f71b4e0a1
Create Date: 2026-07-15 03:57:13.445481

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '11aa090c055d'
down_revision: Union[str, Sequence[str], None] = ('4e8a1b6c9d20', '8c2f71b4e0a1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
