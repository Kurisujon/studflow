from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

AIHistorySource = Literal["selection", "highlight", "underline", "note", "general"]
AIHistoryMode = Literal["ask-ai", "simplify", "define-term"]


class AIHistoryResponse(BaseModel):
    id: uuid.UUID
    documentId: str
    source: AIHistorySource
    sourceText: str | None = None
    noteContent: str | None = None
    question: str | None = None
    mode: AIHistoryMode
    answer: str
    createdAt: datetime
    updatedAt: datetime


class AIHistoryListResponse(BaseModel):
    history: list[AIHistoryResponse]


class CreateAIHistoryRequest(BaseModel):
    source: AIHistorySource
    sourceText: str | None = None
    noteContent: str | None = None
    question: str | None = None
    mode: AIHistoryMode
    answer: str = Field(min_length=1)

    @model_validator(mode="after")
    def normalize_fields(self) -> "CreateAIHistoryRequest":
        self.sourceText = (self.sourceText or "").strip() or None
        self.noteContent = (self.noteContent or "").strip() or None
        self.question = (self.question or "").strip() or None
        self.answer = self.answer.strip()
        if not self.answer:
            raise ValueError("answer is required.")
        return self
