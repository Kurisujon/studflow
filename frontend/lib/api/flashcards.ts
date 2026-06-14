import { API_BASE_URL, buildAPIError } from "@/lib/api";
import type { StudyFlashcard } from "@/lib/types";

export type CreateFlashcardPayload = {
  front: string;
  back: string;
};

export async function createFlashcard(
  documentId: string,
  payload: CreateFlashcardPayload,
  authToken: string | null,
): Promise<StudyFlashcard> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/flashcards`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildAPIError(response, "Failed to save flashcard");
  }

  return response.json();
}
