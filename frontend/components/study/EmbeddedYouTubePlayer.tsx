import React from "react";

export type EmbeddedYouTubePlayerProps = {
  videoId: string;
  title: string;
};

export function EmbeddedYouTubePlayer({ videoId, title }: EmbeddedYouTubePlayerProps) {
  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      title={title}
      className="aspect-video w-full rounded-2xl"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}
