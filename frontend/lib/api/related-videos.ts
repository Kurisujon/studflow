import { API_BASE_URL } from "@/lib/api";

export interface RelatedVideo {
  id: string;
  title: string;
  channelTitle: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  relevanceReason: string;
  publishedAt: string;
}

interface RelatedVideosResponse {
  videos: RelatedVideo[];
}

export async function getRelatedVideos(documentId: string): Promise<RelatedVideo[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/documents/${documentId}/related-videos`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as RelatedVideosResponse;
  return payload.videos ?? [];
}
