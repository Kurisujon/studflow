"""Add note trash and AI history

Revision ID: 20260526_0002
Revises: 8f03cef40015
Create Date: 2026-05-26 18:40:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "20260526_0002"
down_revision = "8f03cef40015"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "study_annotations",
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "ai_history",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("document_id", sa.Uuid(), nullable=False),
        sa.Column("source", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("source_text", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("note_content", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("question", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("mode", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("answer", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ai_history_document_id"), "ai_history", ["document_id"], unique=False)
    op.create_index(op.f("ix_ai_history_id"), "ai_history", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_history_id"), table_name="ai_history")
    op.drop_index(op.f("ix_ai_history_document_id"), table_name="ai_history")
    op.drop_table("ai_history")
    op.drop_column("study_annotations", "deleted_at")
