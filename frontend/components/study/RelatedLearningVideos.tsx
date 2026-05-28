"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { FloatingVideoPlayer } from "@/components/study/FloatingVideoPlayer";
import { getRelatedVideos, type RelatedVideo } from "@/lib/api/related-videos";
import { useAuth } from "@clerk/nextjs";

export function RelatedLearningVideos({ documentId }: { documentId: string }) {
  const [videos, setVideos] = useState<RelatedVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<RelatedVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchVideos() {
      try {
        const token = await getToken();
        setVideos(await getRelatedVideos(documentId, token));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    void fetchVideos();
  }, [documentId, getToken]);

  if (loading || error || videos.length === 0) {
    return null;
  }

  return (
    <>
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
            <article
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
              <button
                type="button"
                aria-label={`Play ${video.title} inside Studflow`}
                onClick={() => setActiveVideo(video)}
                style={{
                  position: "relative",
                  width: "100%",
                  paddingTop: "56.25%",
                  border: 0,
                  cursor: "pointer",
                  background: "transparent",
                }}
              >
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
              </button>
              <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <button
                  type="button"
                  onClick={() => setActiveVideo(video)}
                  style={{
                    border: 0,
                    padding: 0,
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
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
                </button>
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
                <button
                  type="button"
                  onClick={() => setActiveVideo(video)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: "38px",
                    borderRadius: "10px",
                    border: "1px solid #22c55e",
                    color: "#166534",
                    backgroundColor: "transparent",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Watch here
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeVideo ? (
          <FloatingVideoPlayer
            video={activeVideo}
            onClose={() => setActiveVideo(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
