"""add related video published at

Revision ID: 20260526_0001
Revises: a6eef9f78ea8
Create Date: 2026-05-26

"""

from typing import Sequence, Union

import sqlalchemy as sa
import sqlmodel
from alembic import op


revision: str = "20260526_0001"
down_revision: Union[str, None] = "a6eef9f78ea8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "related_videos",
        sa.Column(
            "published_at",
            sqlmodel.sql.sqltypes.AutoString(),
            nullable=False,
            server_default="",
        ),
    )
    op.alter_column("related_videos", "published_at", server_default=None)


def downgrade() -> None:
    op.drop_column("related_videos", "published_at")
