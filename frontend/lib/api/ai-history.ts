import { API_BASE_URL, buildAPIError } from "@/lib/api";
import type { AIHistoryItem } from "@/types/annotations";

function authHeaders(authToken: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

export async function getAIHistory(
  documentId: string,
  authToken: string | null,
): Promise<AIHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/ai-history`, {
    headers: authHeaders(authToken),
  });

  if (!response.ok) throw await buildAPIError(response, "Failed to fetch AI history");

  const payload = (await response.json()) as
    | { history?: AIHistoryItem[] | null }
    | AIHistoryItem[]
    | null;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.history)) {
    return payload.history;
  }

  return [];
}

export type CreateAIHistoryPayload = {
  source: AIHistoryItem["source"];
  sourceText?: string;
  noteContent?: string;
  question?: string;
  mode: AIHistoryItem["mode"];
  answer: string;
};

export async function createAIHistory(
  documentId: string,
  payload: CreateAIHistoryPayload,
  authToken: string | null,
): Promise<AIHistoryItem> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/ai-history`, {
    method: "POST",
    headers: authHeaders(authToken),
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw await buildAPIError(response, "Failed to save AI history");
  return response.json();
}

export async function deleteAIHistory(
  historyId: string,
  authToken: string | null,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/ai-history/${historyId}`, {
    method: "DELETE",
    headers: authHeaders(authToken),
  });

  if (!response.ok) throw await buildAPIError(response, "Failed to delete AI history");
}
