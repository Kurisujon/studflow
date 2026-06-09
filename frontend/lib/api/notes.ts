import { API_BASE_URL, buildAPIError } from "@/lib/api";
import type { Annotation } from "@/types/annotations";
import type { CreateAnnotationPayload } from "@/lib/api/annotations";

function authHeaders(authToken: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

export async function getNotes(
  documentId: string,
  authToken: string | null,
  includeDeleted = false,
): Promise<Annotation[]> {
  const params = includeDeleted ? "?include_deleted=true" : "";
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/notes${params}`, {
    headers: authHeaders(authToken),
  });

  if (!response.ok) throw await buildAPIError(response, "Failed to fetch notes");
  return response.json();
}

export async function createNote(
  documentId: string,
  payload: CreateAnnotationPayload,
  authToken: string | null,
): Promise<Annotation> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/notes`, {
    method: "POST",
    headers: authHeaders(authToken),
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw await buildAPIError(response, "Failed to create note");
  return response.json();
}

export async function softDeleteNote(noteId: string, authToken: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}`, {
    method: "DELETE",
    headers: authHeaders(authToken),
  });

  if (!response.ok) throw await buildAPIError(response, "Failed to move note to trash");
}

export async function restoreNote(noteId: string, authToken: string | null): Promise<Annotation> {
  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}/restore`, {
    method: "POST",
    headers: authHeaders(authToken),
  });

  if (!response.ok) throw await buildAPIError(response, "Failed to restore note");
  return response.json();
}

export async function forceDeleteNote(noteId: string, authToken: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/notes/${noteId}/force`, {
    method: "DELETE",
    headers: authHeaders(authToken),
  });

  if (!response.ok) throw await buildAPIError(response, "Failed to permanently delete note");
}
