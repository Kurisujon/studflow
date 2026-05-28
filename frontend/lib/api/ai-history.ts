import { API_BASE_URL } from "@/lib/api";
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

  if (!response.ok) throw new Error("Failed to fetch AI history.");
  return response.json();
}

export type CreateAIHistoryPayload = {
  source: AIHistoryItem["source"];
  sourceText: string;
  noteContent?: string;
  question: string;
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

  if (!response.ok) throw new Error("Failed to save AI history.");
  return response.json();
}
