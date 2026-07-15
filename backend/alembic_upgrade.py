import alembic.config
import os

# Delete alembic SQLite DB if it exists so we start fresh
if os.path.exists('alembic.db'):
    os.remove('alembic.db')

alembic_args = [
    '--raiseerr',
    'upgrade', 'heads',
]
alembic.config.main(argv=alembic_args)
