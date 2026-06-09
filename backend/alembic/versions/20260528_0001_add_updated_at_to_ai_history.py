"""Add updated_at to ai_history

Revision ID: 20260528_0001
Revises: 20260526_0002
Create Date: 2026-05-28 09:15:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260528_0001"
down_revision = "20260526_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "ai_history",
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.execute("UPDATE ai_history SET updated_at = created_at WHERE updated_at IS NULL")
    op.alter_column("ai_history", "updated_at", nullable=False)


def downgrade() -> None:
    op.drop_column("ai_history", "updated_at")
