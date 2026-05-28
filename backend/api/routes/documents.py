from __future__ import annotations

import json
import uuid
from datetime import datetime
from typing import Literal, cast

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from pydantic import BaseModel, Field, model_validator
from sqlmodel import Session, select

from core.database import engine
from core.auth import get_current_user, CurrentUser
from models.tables import (
    Document,
    DocumentChunk,
    DocumentStatus,
    Flashcard,
    AIHistory,
    Quiz,
    QuizQuestion,
    Summary,
    StudyAnnotation,
)
from services.ai_service import ComprehensiveSummary, explain_selection

router = APIRouter()


class DocumentListItem(BaseModel):
    id: uuid.UUID
    filename: str
    status: str
    created_at: datetime
    updated_at: datetime
    page_count: int | None
    summary_ready: bool
    flashcard_count: int
    quiz_ready: bool


class DocumentStatusResponse(BaseModel):
    document_id: uuid.UUID
    status: str
    processing_stage: str
    page_count: int | None = None
    summary_ready: bool
    flashcard_count: int
    quiz_ready: bool


class FlashcardResponse(BaseModel):
    id: uuid.UUID
    front: str
    back: str
    order_index: int


class QuizQuestionResponse(BaseModel):
    id: uuid.UUID
    question: str
    options: list[str]
    correct_answer_index: int
    explanation: str
    order_index: int


class StudyDocumentResponse(BaseModel):
    id: uuid.UUID
    filename: str
    status: str
    created_at: datetime
    summary: str | None
    summary_data: dict | None
    flashcards: list[FlashcardResponse]
    quiz: list[QuizQuestionResponse]


class DocumentChunkResponse(BaseModel):
    id: uuid.UUID
    order_index: int
    content: str


class ExplainSelectionRequest(BaseModel):
    highlighted_text: str
    question: str | None = None
    documentId: uuid.UUID | None = None
    noteContent: str | None = None
    source: Literal["selection", "note", "general"] = "selection"
    mode: Literal["ask-ai", "simplify", "define-term"] = "ask-ai"


class ExplainSelectionResponse(BaseModel):
    historyId: uuid.UUID | None = None
    selectedText: str
    simplifiedExplanation: str
    beginnerExplanation: str
    example: str
    relatedTerms: list[str]
    suggestedFlashcard: dict


class AnnotationResponse(BaseModel):
    id: uuid.UUID
    documentId: str
    blockId: str
    selectedText: str
    startOffset: int
    endOffset: int
    type: Literal["highlight", "underline", "note"]
    color: str | None = None
    underlineColor: str | None = None
    noteContent: str | None = None
    deletedAt: datetime | None = None
    createdAt: datetime
    updatedAt: datetime


class CreateAnnotationRequest(BaseModel):
    blockId: str = Field(min_length=1)
    selectedText: str
    startOffset: int = Field(ge=0)
    endOffset: int = Field(ge=0)
    type: Literal["highlight", "underline", "note"]
    color: Literal["blue", "yellow", "green", "pink", "purple"] | None = None
    underlineColor: Literal["blue", "yellow", "green", "pink", "purple", "neutral"] | None = None
    noteContent: str | None = None

    @model_validator(mode="after")
    def validate_annotation_payload(self) -> "CreateAnnotationRequest":
        if self.type in {"highlight", "underline"} and self.startOffset >= self.endOffset:
            raise ValueError("Annotation endOffset must be greater than startOffset.")
        if self.type == "highlight" and not self.color:
            raise ValueError("Highlight annotations require a color.")
        if self.type == "underline" and not self.underlineColor:
            raise ValueError("Underline annotations require an underlineColor.")
        if self.type == "note" and not (self.noteContent or "").strip():
            raise ValueError("Note annotations require noteContent.")
        return self


class UpdateAnnotationRequest(BaseModel):
    color: Literal["blue", "yellow", "green", "pink", "purple"] | None = None
    underlineColor: Literal["blue", "yellow", "green", "pink", "purple", "neutral"] | None = None
    noteContent: str | None = None


class AIHistoryResponse(BaseModel):
    id: uuid.UUID
    documentId: str
    source: Literal["selection", "note", "general"]
    sourceText: str
    noteContent: str | None = None
    question: str
    mode: Literal["ask-ai", "simplify", "define-term"]
    answer: str
    createdAt: datetime


class CreateAIHistoryRequest(BaseModel):
    source: Literal["selection", "note", "general"]
    sourceText: str = ""
    noteContent: str | None = None
    question: str = Field(min_length=1)
    mode: Literal["ask-ai", "simplify", "define-term"]
    answer: str = Field(min_length=1)


def _get_owned_document(
    session: Session,
    document_id: uuid.UUID,
    current_user: CurrentUser,
) -> Document:
    document = session.exec(
        select(Document)
        .where(Document.id == document_id)
        .where(Document.clerk_user_id == current_user.clerk_user_id)
    ).first()

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    return document


def _get_owned_annotation(
    session: Session,
    annotation_id: uuid.UUID,
    current_user: CurrentUser,
) -> StudyAnnotation:
    annotation = session.exec(
        select(StudyAnnotation).where(StudyAnnotation.id == annotation_id)
    ).first()

    if annotation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found.",
        )

    document = session.exec(
        select(Document)
        .where(Document.id == annotation.document_id)
        .where(Document.clerk_user_id == current_user.clerk_user_id)
    ).first()

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Annotation not found.",
        )

    return annotation


def _to_annotation_response(annotation: StudyAnnotation) -> AnnotationResponse:
    annotation_type = cast(Literal["highlight", "underline", "note"], annotation.type)

    return AnnotationResponse(
        id=annotation.id,
        documentId=str(annotation.document_id),
        blockId=annotation.block_id,
        selectedText=annotation.selected_text,
        startOffset=annotation.start_offset,
        endOffset=annotation.end_offset,
        type=annotation_type,
        color=annotation.color,
        underlineColor=annotation.underline_color,
        noteContent=annotation.note_content,
        deletedAt=annotation.deleted_at,
        createdAt=annotation.created_at,
        updatedAt=annotation.updated_at,
    )


def _to_ai_history_response(history: AIHistory) -> AIHistoryResponse:
    source = cast(Literal["selection", "note", "general"], history.source)
    mode = cast(Literal["ask-ai", "simplify", "define-term"], history.mode)

    return AIHistoryResponse(
        id=history.id,
        documentId=str(history.document_id),
        source=source,
        sourceText=history.source_text,
        noteContent=history.note_content,
        question=history.question,
        mode=mode,
        answer=history.answer,
        createdAt=history.created_at,
    )


def _infer_processing_stage(document: Document, summary: Summary | None, flashcard_count: int, quiz: Quiz | None) -> str:
    if document.status == DocumentStatus.PENDING:
        return "QUEUED"
    if document.status == DocumentStatus.FAILED:
        return "FAILED"
    if document.status == DocumentStatus.COMPLETED:
        return "COMPLETED"
    if summary is None:
        return "EXTRACTING_TEXT"
    if flashcard_count == 0:
        return "GENERATING_FLASHCARDS"
    if quiz is None:
        return "GENERATING_QUIZ"
    return "FINALIZING"


def _parse_summary_payload(content: str | None) -> ComprehensiveSummary | None:
    if not content:
        return None

    try:
        return ComprehensiveSummary.model_validate_json(content)
    except Exception:
        return None


def _format_summary_text(summary: ComprehensiveSummary | None) -> str | None:
    if summary is None:
        return None

    sections = [summary.overall_overview]
    for section in summary.detailed_sections:
        sections.append(section.topic_title)
        sections.extend(f"- {point}" for point in section.key_points)
        if section.important_terms_and_definitions:
            sections.append("Important terms:")
            sections.extend(
                f"- {term}" for term in section.important_terms_and_definitions
            )

    return "\n".join(sections)


@router.get("/documents", response_model=list[DocumentListItem])
def list_documents(current_user: CurrentUser = Depends(get_current_user)) -> list[DocumentListItem]:
    with Session(engine) as session:
        documents = session.exec(
            select(Document)
            .where(Document.clerk_user_id == current_user.clerk_user_id)
            .order_by(Document.created_at.desc())
        ).all()

        items: list[DocumentListItem] = []

        for document in documents:
            summary = session.exec(
                select(Summary).where(Summary.document_id == document.id)
            ).first()
            flashcard_count = len(
                session.exec(
                    select(Flashcard).where(Flashcard.document_id == document.id)
                ).all()
            )
            quiz = session.exec(
                select(Quiz).where(Quiz.document_id == document.id)
            ).first()

            items.append(
                DocumentListItem(
                    id=document.id,
                    filename=document.filename,
                    status=document.status.value,
                    created_at=document.created_at,
                    updated_at=document.updated_at,
                    page_count=document.page_count,
                    summary_ready=summary is not None,
                    flashcard_count=flashcard_count,
                    quiz_ready=quiz is not None,
                )
            )

        return items


@router.get("/documents/{document_id}/status", response_model=DocumentStatusResponse)
def get_document_status(document_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user)) -> DocumentStatusResponse:
    with Session(engine) as session:
        document = session.exec(
            select(Document)
            .where(Document.id == document_id)
            .where(Document.clerk_user_id == current_user.clerk_user_id)
        ).first()

        if document is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        summary = session.exec(
            select(Summary).where(Summary.document_id == document_id)
        ).first()
        flashcards = session.exec(
            select(Flashcard).where(Flashcard.document_id == document_id)
        ).all()
        quiz = session.exec(
            select(Quiz).where(Quiz.document_id == document_id)
        ).first()

        return DocumentStatusResponse(
            document_id=document.id,
            status=document.status.value,
            processing_stage=_infer_processing_stage(
                document,
                summary,
                len(flashcards),
                quiz,
            ),
            page_count=document.page_count,
            summary_ready=summary is not None,
            flashcard_count=len(flashcards),
            quiz_ready=quiz is not None,
        )


@router.get("/documents/{document_id}/study", response_model=StudyDocumentResponse)
def get_study_document(document_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user)) -> StudyDocumentResponse:
    with Session(engine) as session:
        document = session.exec(
            select(Document)
            .where(Document.id == document_id)
            .where(Document.clerk_user_id == current_user.clerk_user_id)
        ).first()

        if document is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        summary = session.exec(
            select(Summary).where(Summary.document_id == document_id)
        ).first()
        flashcards = session.exec(
            select(Flashcard)
            .where(Flashcard.document_id == document_id)
            .order_by(Flashcard.order_index.asc())
        ).all()
        quiz = session.exec(
            select(Quiz).where(Quiz.document_id == document_id)
        ).first()
        quiz_questions: list[QuizQuestion] = []

        if quiz is not None:
            quiz_questions = session.exec(
                select(QuizQuestion)
                .where(QuizQuestion.quiz_id == quiz.id)
                .order_by(QuizQuestion.order_index.asc())
            ).all()

        summary_payload = _parse_summary_payload(summary.content if summary else None)

        return StudyDocumentResponse(
            id=document.id,
            filename=document.filename,
            status=document.status.value,
            created_at=document.created_at,
            summary=_format_summary_text(summary_payload),
            summary_data=summary_payload.model_dump() if summary_payload else None,
            flashcards=[
                FlashcardResponse(
                    id=flashcard.id,
                    front=flashcard.front,
                    back=flashcard.back,
                    order_index=flashcard.order_index,
                )
                for flashcard in flashcards
            ],
            quiz=[
                QuizQuestionResponse(
                    id=question.id,
                    question=question.question,
                    options=json.loads(question.options),
                    correct_answer_index=question.correct_answer_index,
                    explanation=question.explanation,
                    order_index=question.order_index,
                )
                for question in quiz_questions
            ],
        )


@router.get("/documents/{document_id}/chunks", response_model=list[DocumentChunkResponse])
def get_document_chunks(document_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user)) -> list[DocumentChunkResponse]:
    with Session(engine) as session:
        document = session.exec(
            select(Document)
            .where(Document.id == document_id)
            .where(Document.clerk_user_id == current_user.clerk_user_id)
        ).first()

        if document is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        chunks = session.exec(
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document_id)
            .order_by(DocumentChunk.order_index.asc())
        ).all()

        return [
            DocumentChunkResponse(
                id=chunk.id,
                order_index=chunk.order_index,
                content=chunk.content,
            )
            for chunk in chunks
        ]


@router.post("/ai/explain-selection", response_model=ExplainSelectionResponse)
def explain_study_selection(payload: ExplainSelectionRequest, current_user: CurrentUser = Depends(get_current_user)) -> ExplainSelectionResponse:
    highlighted_text = payload.highlighted_text.strip()
    note_content = (payload.noteContent or "").strip()

    if not highlighted_text and not note_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Study text or note content is required.",
        )

    with Session(engine) as session:
        document: Document | None = None
        if payload.documentId is not None:
            document = _get_owned_document(session, payload.documentId, current_user)

        explanation = explain_selection(
            highlighted_text=highlighted_text,
            note_content=note_content,
            source=payload.source,
            user_question=(payload.question or "").strip(),
        )

        history_id: uuid.UUID | None = None
        if document is not None:
            history = AIHistory(
                document_id=document.id,
                source=payload.source,
                source_text=highlighted_text,
                note_content=note_content or None,
                question=(payload.question or "Explain this clearly and simply for a student.").strip(),
                mode=payload.mode,
                answer=explanation.simplified_explanation,
                created_at=datetime.utcnow(),
            )
            session.add(history)
            session.commit()
            session.refresh(history)
            history_id = history.id

        return ExplainSelectionResponse(
            historyId=history_id,
            selectedText=explanation.selected_text,
            simplifiedExplanation=explanation.simplified_explanation,
            beginnerExplanation=explanation.beginner_explanation,
            example=explanation.example,
            relatedTerms=explanation.related_terms,
            suggestedFlashcard=explanation.suggested_flashcard.model_dump(),
        )


class RelatedVideoResponse(BaseModel):
    id: uuid.UUID
    title: str
    channelTitle: str
    videoId: str
    url: str
    thumbnailUrl: str
    description: str
    relevanceReason: str
    publishedAt: str

class RelatedVideosListResponse(BaseModel):
    videos: list[RelatedVideoResponse]


@router.get("/documents/{document_id}/related-videos", response_model=RelatedVideosListResponse)
def get_related_videos(document_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user)) -> RelatedVideosListResponse:
    from models.tables import RelatedVideo
    with Session(engine) as session:
        document = session.exec(
            select(Document)
            .where(Document.id == document_id)
            .where(Document.clerk_user_id == current_user.clerk_user_id)
        ).first()

        if document is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )

        videos = session.exec(
            select(RelatedVideo)
            .where(RelatedVideo.document_id == document_id)
            .order_by(RelatedVideo.created_at.asc())
        ).all()

        return RelatedVideosListResponse(
            videos=[
                RelatedVideoResponse(
                    id=v.id,
                    title=v.title,
                    channelTitle=v.channel_title,
                    videoId=v.video_id,
                    url=v.url,
                    thumbnailUrl=v.thumbnail_url,
                    description=v.description,
                    relevanceReason=v.relevance_reason,
                    publishedAt=v.published_at,
                )
                for v in videos
            ]
        )


@router.get("/documents/{document_id}/annotations", response_model=list[AnnotationResponse])
def get_annotations(
    document_id: uuid.UUID,
    include_deleted: bool = Query(default=False),
    current_user: CurrentUser = Depends(get_current_user),
) -> list[AnnotationResponse]:
    with Session(engine) as session:
        _get_owned_document(session, document_id, current_user)

        statement = select(StudyAnnotation).where(StudyAnnotation.document_id == document_id)
        if not include_deleted:
            statement = statement.where(StudyAnnotation.deleted_at.is_(None))  # type: ignore[attr-defined]

        annotations = session.exec(statement.order_by(StudyAnnotation.created_at.asc())).all()

        return [_to_annotation_response(annotation) for annotation in annotations]


@router.get("/documents/{document_id}/notes", response_model=list[AnnotationResponse])
def get_notes(
    document_id: uuid.UUID,
    include_deleted: bool = Query(default=False),
    current_user: CurrentUser = Depends(get_current_user),
) -> list[AnnotationResponse]:
    with Session(engine) as session:
        _get_owned_document(session, document_id, current_user)

        statement = (
            select(StudyAnnotation)
            .where(StudyAnnotation.document_id == document_id)
            .where(StudyAnnotation.type == "note")
        )
        if not include_deleted:
            statement = statement.where(StudyAnnotation.deleted_at.is_(None))  # type: ignore[attr-defined]

        notes = session.exec(statement.order_by(StudyAnnotation.updated_at.desc())).all()
        return [_to_annotation_response(note) for note in notes]


@router.post("/documents/{document_id}/annotations", response_model=AnnotationResponse)
def create_annotation(document_id: uuid.UUID, payload: CreateAnnotationRequest, current_user: CurrentUser = Depends(get_current_user)) -> AnnotationResponse:
    with Session(engine) as session:
        _get_owned_document(session, document_id, current_user)

        now = datetime.utcnow()

        if payload.type in {"highlight", "underline"}:
            overlapping_statement = (
                select(StudyAnnotation)
                .where(StudyAnnotation.document_id == document_id)
                .where(StudyAnnotation.block_id == payload.blockId)
                .where(StudyAnnotation.type == payload.type)
                .where(StudyAnnotation.deleted_at.is_(None))  # type: ignore[attr-defined]
                .where(StudyAnnotation.start_offset < payload.endOffset)
                .where(StudyAnnotation.end_offset > payload.startOffset)
            )
            overlapping_annotations = session.exec(overlapping_statement).all()
            exact_annotation = next(
                (
                    annotation
                    for annotation in overlapping_annotations
                    if annotation.start_offset == payload.startOffset
                    and annotation.end_offset == payload.endOffset
                ),
                None,
            )

            if exact_annotation and len(overlapping_annotations) == 1:
                exact_annotation.selected_text = payload.selectedText
                if payload.type == "highlight":
                    exact_annotation.color = payload.color
                if payload.type == "underline":
                    exact_annotation.underline_color = payload.underlineColor
                exact_annotation.updated_at = now
                session.add(exact_annotation)
                session.commit()
                session.refresh(exact_annotation)
                return _to_annotation_response(exact_annotation)

            for overlapping_annotation in overlapping_annotations:
                session.delete(overlapping_annotation)

        annotation = StudyAnnotation(
            document_id=document_id,
            block_id=payload.blockId,
            selected_text=payload.selectedText,
            start_offset=payload.startOffset,
            end_offset=payload.endOffset,
            type=payload.type,
            color=payload.color,
            underline_color=payload.underlineColor,
            note_content=payload.noteContent.strip() if payload.noteContent else None,
            created_at=now,
            updated_at=now,
        )
        session.add(annotation)
        session.commit()
        session.refresh(annotation)

        return _to_annotation_response(annotation)


@router.post("/documents/{document_id}/notes", response_model=AnnotationResponse)
def create_note(document_id: uuid.UUID, payload: CreateAnnotationRequest, current_user: CurrentUser = Depends(get_current_user)) -> AnnotationResponse:
    if payload.type != "note":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only note annotations can be created through this endpoint.",
        )
    return create_annotation(document_id, payload, current_user)


@router.patch("/annotations/{annotation_id}", response_model=AnnotationResponse)
def update_annotation(annotation_id: uuid.UUID, payload: UpdateAnnotationRequest, current_user: CurrentUser = Depends(get_current_user)) -> AnnotationResponse:
    with Session(engine) as session:
        annotation = _get_owned_annotation(session, annotation_id, current_user)

        if payload.color is not None:
            annotation.color = payload.color
        if payload.underlineColor is not None:
            annotation.underline_color = payload.underlineColor
        if payload.noteContent is not None:
            annotation.note_content = payload.noteContent.strip()

        annotation.updated_at = datetime.utcnow()
        session.add(annotation)
        session.commit()
        session.refresh(annotation)

        return _to_annotation_response(annotation)


@router.patch("/notes/{note_id}", response_model=AnnotationResponse)
def update_note(note_id: uuid.UUID, payload: UpdateAnnotationRequest, current_user: CurrentUser = Depends(get_current_user)) -> AnnotationResponse:
    with Session(engine) as session:
        note = _get_owned_annotation(session, note_id, current_user)
        if note.type != "note":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found.",
            )
        if payload.noteContent is not None:
            note.note_content = payload.noteContent.strip()
        note.updated_at = datetime.utcnow()
        session.add(note)
        session.commit()
        session.refresh(note)
        return _to_annotation_response(note)


@router.delete(
    "/notes/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    response_model=None,
)
def soft_delete_note(note_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user)) -> Response:
    with Session(engine) as session:
        note = _get_owned_annotation(session, note_id, current_user)
        if note.type != "note":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found.",
            )
        now = datetime.utcnow()
        note.deleted_at = now
        note.updated_at = now
        session.add(note)
        session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/notes/{note_id}/restore", response_model=AnnotationResponse)
def restore_note(note_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user)) -> AnnotationResponse:
    with Session(engine) as session:
        note = _get_owned_annotation(session, note_id, current_user)
        if note.type != "note":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found.",
            )
        note.deleted_at = None
        note.updated_at = datetime.utcnow()
        session.add(note)
        session.commit()
        session.refresh(note)
        return _to_annotation_response(note)


@router.delete(
    "/notes/{note_id}/force",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    response_model=None,
)
def force_delete_note(note_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user)) -> Response:
    with Session(engine) as session:
        note = _get_owned_annotation(session, note_id, current_user)
        if note.type != "note":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found.",
            )
        session.delete(note)
        session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/documents/{document_id}/ai-history", response_model=list[AIHistoryResponse])
def get_ai_history(document_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user)) -> list[AIHistoryResponse]:
    with Session(engine) as session:
        _get_owned_document(session, document_id, current_user)
        history_items = session.exec(
            select(AIHistory)
            .where(AIHistory.document_id == document_id)
            .order_by(AIHistory.created_at.desc())
        ).all()
        return [_to_ai_history_response(history) for history in history_items]


@router.post("/documents/{document_id}/ai-history", response_model=AIHistoryResponse)
def create_ai_history(document_id: uuid.UUID, payload: CreateAIHistoryRequest, current_user: CurrentUser = Depends(get_current_user)) -> AIHistoryResponse:
    with Session(engine) as session:
        document = _get_owned_document(session, document_id, current_user)
        history = AIHistory(
            document_id=document.id,
            source=payload.source,
            source_text=payload.sourceText,
            note_content=payload.noteContent,
            question=payload.question,
            mode=payload.mode,
            answer=payload.answer,
            created_at=datetime.utcnow(),
        )
        session.add(history)
        session.commit()
        session.refresh(history)
        return _to_ai_history_response(history)


@router.delete(
    "/annotations/{annotation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    response_model=None,
)
def delete_annotation(annotation_id: uuid.UUID, current_user: CurrentUser = Depends(get_current_user)) -> Response:
    with Session(engine) as session:
        annotation = _get_owned_annotation(session, annotation_id, current_user)
        session.delete(annotation)
        session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
