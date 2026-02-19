"""security policy fields

Revision ID: 6b648b3fb0b6
Revises: a1356824591a
Create Date: (mantém o seu)

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "6b648b3fb0b6"
down_revision = "a1356824591a"
branch_labels = None
depends_on = None


def upgrade():
    # Postgres: adiciona somente se não existir (evita DuplicateColumn)
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloqueado_ate TIMESTAMP")
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha_atualizada_em TIMESTAMP")
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS aceitou_termos BOOLEAN DEFAULT FALSE")
    op.execute("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS aceitou_termos_em TIMESTAMP")


def downgrade():
    op.execute("ALTER TABLE usuarios DROP COLUMN IF EXISTS aceitou_termos_em")
    op.execute("ALTER TABLE usuarios DROP COLUMN IF EXISTS aceitou_termos")
    op.execute("ALTER TABLE usuarios DROP COLUMN IF EXISTS senha_atualizada_em")
    op.execute("ALTER TABLE usuarios DROP COLUMN IF EXISTS bloqueado_ate")
