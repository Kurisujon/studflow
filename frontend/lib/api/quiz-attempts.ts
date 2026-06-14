import { API_BASE_URL, buildAPIError } from "@/lib/api";
import type { QuizAttemptSummary } from "@/lib/types";

function authHeaders(authToken: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

export async function getQuizAttempts(
  documentId: string,
  authToken: string | null,
): Promise<QuizAttemptSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/quiz-attempts`, {
    headers: authHeaders(authToken),
  });

  if (!response.ok) {
    throw await buildAPIError(response, "Failed to fetch quiz attempts");
  }

  return response.json();
}

export type CreateQuizAttemptPayload = {
  score: number;
  totalQuestions: number;
  incorrectQuestionIds: string[];
};

export async function createQuizAttempt(
  documentId: string,
  payload: CreateQuizAttemptPayload,
  authToken: string | null,
): Promise<QuizAttemptSummary> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/quiz-attempts`, {
    method: "POST",
    headers: authHeaders(authToken),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildAPIError(response, "Failed to save quiz attempt");
  }

  return response.json();
}
