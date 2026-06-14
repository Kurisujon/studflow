"""Add quiz_attempts

Revision ID: 20260614_0001
Revises: 20260528_0001
Create Date: 2026-06-14 11:30:00.000000
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision = "20260614_0001"
down_revision = "20260528_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "quiz_attempts",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("document_id", sa.Uuid(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("total_questions", sa.Integer(), nullable=False),
        sa.Column("incorrect_question_ids", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_quiz_attempts_document_id"), "quiz_attempts", ["document_id"], unique=False)
    op.create_index(op.f("ix_quiz_attempts_id"), "quiz_attempts", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_quiz_attempts_id"), table_name="quiz_attempts")
    op.drop_index(op.f("ix_quiz_attempts_document_id"), table_name="quiz_attempts")
    op.drop_table("quiz_attempts")
