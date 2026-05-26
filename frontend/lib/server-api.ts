import { API_BASE_URL } from "@/lib/api";
import type { DocumentListItem, StudyDocument } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";

async function fetchJSON<T>(path: string): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();
  
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return (await response.json()) as T;
}

export function fetchDocuments(): Promise<DocumentListItem[]> {
  return fetchJSON<DocumentListItem[]>("/api/documents");
}

export function fetchStudyDocument(id: string): Promise<StudyDocument> {
  return fetchJSON<StudyDocument>(`/api/documents/${id}/study`);
}
