"use client";

import { useEffect, useState } from "react";

import { getRelatedVideos, type RelatedVideo } from "@/lib/api/related-videos";

export function RelatedLearningVideos({ documentId }: { documentId: string }) {
  const [videos, setVideos] = useState<RelatedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setVideos(await getRelatedVideos(documentId));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    void fetchVideos();
  }, [documentId]);

  if (loading || error || videos.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        padding: "1.4rem",
        borderRadius: "24px",
        background: "linear-gradient(135deg, rgba(240,253,244,0.8), rgba(255,255,255,0.96))",
        border: "1px solid rgba(74, 222, 128, 0.25)",
        boxShadow: "0 18px 48px rgba(34, 197, 94, 0.08)",
        marginBottom: "1.5rem",
      }}
    >
      <p
        style={{
          fontSize: "0.72rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#166534",
          marginBottom: "1rem",
        }}
      >
        Related Learning Videos
      </p>
      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.2rem",
        }}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "white",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease",
            }}
          >
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#e2e8f0",
                  }}
                />
              )}
            </div>
            <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1 }}>
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: "#1e293b",
                  marginBottom: "0.25rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {video.title}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.5rem" }}>
                {video.channelTitle}
              </p>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#475569",
                  lineHeight: 1.4,
                  marginBottom: "1rem",
                  flex: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {video.relevanceReason}
              </p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  minHeight: "38px",
                  borderRadius: "10px",
                  border: "1px solid #22c55e",
                  color: "#166534",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Watch on YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
