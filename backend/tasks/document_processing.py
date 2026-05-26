from __future__ import annotations

import uuid
import logging

from sqlmodel import Session, select

from core.celery_app import celery_app
from core.database import engine
from models.tables import Document, DocumentStatus
from services.ai_service import (
    AIServiceError,
    generate_flashcards,
    generate_quiz,
    generate_summary,
    extract_youtube_search_query,
)
from services.document_processing import (
    DocumentProcessingError,
    chunk_text,
    extract_docx_text,
    extract_pdf_text,
)
from services.documents import (
    save_document_chunks,
    save_flashcards,
    save_quiz,
    save_summary,
    save_related_videos,
    update_document_status,
)
from services.youtube_service import search_related_videos
from services.storage import StorageServiceError, download_file_from_storage

logger = logging.getLogger(__name__)


@celery_app.task(name="tasks.process_document_task")
def process_document_task(document_id: str) -> dict[str, int | str]:
    with Session(engine) as session:
        statement = select(Document).where(Document.id == uuid.UUID(document_id))
        document = session.exec(statement).first()

        if document is None:
            raise ValueError(f"Document {document_id} was not found.")

        update_document_status(
            session=session,
            document=document,
            status=DocumentStatus.PROCESSING,
        )

        try:
            file_bytes = download_file_from_storage(document.file_url)
            filename = document.filename.lower()

            if filename.endswith(".pdf"):
                extracted_text, page_count = extract_pdf_text(file_bytes)
            elif filename.endswith(".docx"):
                extracted_text, page_count = extract_docx_text(file_bytes)
            else:
                raise DocumentProcessingError("Unsupported document type for processing.")

            chunks = chunk_text(extracted_text, chunk_size=2000, overlap=200)

            if not chunks:
                raise DocumentProcessingError("No extractable text chunks were produced.")

            update_document_status(
                session=session,
                document=document,
                status=DocumentStatus.PROCESSING,
                page_count=page_count,
            )

            save_document_chunks(
                session=session,
                document_id=document.id,
                chunks=chunks,
            )

            summary = generate_summary(chunks)
            save_summary(
                session=session,
                document_id=document.id,
                summary=summary,
            )

            flashcards = generate_flashcards(chunks)
            save_flashcards(
                session=session,
                document_id=document.id,
                flashcards=flashcards,
            )

            quiz_questions = generate_quiz(chunks)
            save_quiz(
                session=session,
                document_id=document.id,
                questions=quiz_questions,
            )

            try:
                youtube_query = extract_youtube_search_query(summary.overall_overview)
                videos = search_related_videos(youtube_query.search_query, max_results=3)
                if videos:
                    save_related_videos(
                        session=session,
                        document_id=document.id,
                        videos=videos,
                        relevance_reason=f"Recommended because this document discusses {youtube_query.main_topic}."
                    )
            except Exception as exc:
                logger.warning("Skipping YouTube related videos: %s", exc)

            update_document_status(
                session=session,
                document=document,
                status=DocumentStatus.COMPLETED,
                page_count=page_count,
            )
        except (StorageServiceError, DocumentProcessingError, AIServiceError, Exception) as exc:
            update_document_status(
                session=session,
                document=document,
                status=DocumentStatus.FAILED,
            )
            raise exc

    return {
        "document_id": document_id,
        "status": DocumentStatus.COMPLETED.value,
        "chunk_count": len(chunks),
        "page_count": page_count,
    }
