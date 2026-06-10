"use client";

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  ExternalLink,
  GripHorizontal,
  Maximize2,
  Minus,
  RotateCcw,
  X,
} from "lucide-react";
import { motion, useDragControls, useMotionValue } from "framer-motion";

const DEFAULT_VIDEO_SIZE = { width: 520, height: 420 };
const MIN_VIDEO_SIZE = { width: 360, height: 280 };
const MAX_VIDEO_SIZE = { width: 900, height: 720 };
const VIDEO_PLAYER_SIZE_STORAGE_KEY = "studflow-floating-video-size";

type ResizeDirection =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

type RelatedVideo = {
  id: string;
  title: string;
  channelTitle: string;
  videoId: string;
  url: string;
  thumbnailUrl?: string;
  description?: string;
  relevanceReason?: string;
  publishedAt?: string;
};

type FloatingVideoPlayerProps = {
  video: RelatedVideo;
  onClose: () => void;
};

function stopDragStart(event: ReactPointerEvent<HTMLElement>) {
  event.stopPropagation();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampVideoSize(size: typeof DEFAULT_VIDEO_SIZE) {
  return {
    width: clamp(size.width, MIN_VIDEO_SIZE.width, MAX_VIDEO_SIZE.width),
    height: clamp(size.height, MIN_VIDEO_SIZE.height, MAX_VIDEO_SIZE.height),
  };
}

function hasDirection(direction: ResizeDirection, side: "top" | "right" | "bottom" | "left") {
  return direction.split("-").includes(side);
}

function isVideoSize(value: unknown): value is typeof DEFAULT_VIDEO_SIZE {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.width === "number" &&
    typeof candidate.height === "number"
  );
}

function getInitialVideoSize() {
  if (typeof window === "undefined") {
    return DEFAULT_VIDEO_SIZE;
  }

  try {
    const stored = localStorage.getItem(VIDEO_PLAYER_SIZE_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_VIDEO_SIZE;
    }

    const parsed = JSON.parse(stored) as unknown;
    return isVideoSize(parsed) ? clampVideoSize(parsed) : DEFAULT_VIDEO_SIZE;
  } catch {
    localStorage.removeItem(VIDEO_PLAYER_SIZE_STORAGE_KEY);
    return DEFAULT_VIDEO_SIZE;
  }
}

export function FloatingVideoPlayer({
  video,
  onClose,
}: FloatingVideoPlayerProps) {
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [size, setSize] = useState(getInitialVideoSize);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = (
    direction: ResizeDirection,
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    event.stopPropagation();
    event.preventDefault();

    setIsResizing(true);
    const startPointerX = event.clientX;
    const startPointerY = event.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    const startMotionX = x.get();
    const startMotionY = y.get();

    const getResizeState = (clientX: number, clientY: number) => {
      const pointerDeltaX = clientX - startPointerX;
      const pointerDeltaY = clientY - startPointerY;
      const requestedWidth =
        startWidth +
        (hasDirection(direction, "right") ? pointerDeltaX : 0) -
        (hasDirection(direction, "left") ? pointerDeltaX : 0);
      const requestedHeight =
        startHeight +
        (hasDirection(direction, "bottom") ? pointerDeltaY : 0) -
        (hasDirection(direction, "top") ? pointerDeltaY : 0);
      const nextSize = clampVideoSize({
        width: requestedWidth,
        height: requestedHeight,
      });
      const widthDelta = nextSize.width - startWidth;
      const heightDelta = nextSize.height - startHeight;

      return {
        size: nextSize,
        x:
          hasDirection(direction, "right") && !hasDirection(direction, "left")
            ? startMotionX + widthDelta
            : startMotionX,
        y:
          hasDirection(direction, "bottom") && !hasDirection(direction, "top")
            ? startMotionY + heightDelta
            : startMotionY,
      };
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const next = getResizeState(moveEvent.clientX, moveEvent.clientY);
      setSize(next.size);
      x.set(next.x);
      y.set(next.y);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      const finalState = getResizeState(upEvent.clientX, upEvent.clientY);
      setIsResizing(false);
      setSize(finalState.size);
      x.set(finalState.x);
      y.set(finalState.y);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      localStorage.setItem(
        VIDEO_PLAYER_SIZE_STORAGE_KEY,
        JSON.stringify(finalState.size),
      );
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleResetSize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setSize(DEFAULT_VIDEO_SIZE);
    localStorage.removeItem(VIDEO_PLAYER_SIZE_STORAGE_KEY);
  };

  const renderResizeHandle = (
    direction: ResizeDirection,
    className: string,
    label: string,
  ) => (
    <button
      type="button"
      aria-label={label}
      className={`absolute z-20 bg-transparent transition-colors hover:bg-neutral-400/10 ${className}`}
      onPointerDown={(event) => startResize(direction, event)}
    />
  );

  return (
    <div ref={constraintsRef} className="pointer-events-none fixed inset-0 z-[99]">
      <motion.div
        drag={!isResizing}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0.05}
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="pointer-events-auto fixed inset-x-4 bottom-6 z-[100] max-w-[calc(100vw-2rem)] sm:inset-x-auto sm:right-6"
        style={isMinimized ? { x, y } : { width: size.width, height: size.height, x, y }}
      >
        {isMinimized ? (
          <div
            className="flex cursor-grab items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-2xl shadow-black/15 active:cursor-grabbing"
            onPointerDown={(event) => dragControls.start(event)}
          >
            <GripHorizontal className="h-4 w-4 shrink-0 text-neutral-400" />
            <div className="min-w-0 flex-1 pr-1">
              <p className="line-clamp-1 text-sm font-semibold leading-5 text-foreground">
                {video.title}
              </p>
              <p className="line-clamp-1 text-xs leading-4 text-muted-foreground">
                {video.channelTitle}
              </p>
            </div>
            <button
              type="button"
              aria-label="Restore video player"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onPointerDown={stopDragStart}
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Close video player"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onPointerDown={stopDragStart}
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--theme-border)] bg-card shadow-2xl shadow-black/15">
            {renderResizeHandle("top", "left-4 top-0 h-2 w-[calc(100%-2rem)] cursor-ns-resize", "Resize video player from top edge")}
            {renderResizeHandle("right", "right-0 top-4 h-[calc(100%-2rem)] w-2 cursor-ew-resize", "Resize video player from right edge")}
            {renderResizeHandle("bottom", "bottom-0 left-4 h-2 w-[calc(100%-2rem)] cursor-ns-resize", "Resize video player from bottom edge")}
            {renderResizeHandle("left", "left-0 top-4 h-[calc(100%-2rem)] w-2 cursor-ew-resize", "Resize video player from left edge")}
            {renderResizeHandle("top-left", "left-0 top-0 h-4 w-4 cursor-nwse-resize rounded-tl-3xl", "Resize video player from top-left corner")}
            {renderResizeHandle("top-right", "right-0 top-0 h-4 w-4 cursor-nesw-resize rounded-tr-3xl", "Resize video player from top-right corner")}
            {renderResizeHandle("bottom-left", "bottom-0 left-0 h-4 w-4 cursor-nesw-resize rounded-bl-3xl", "Resize video player from bottom-left corner")}
            {renderResizeHandle("bottom-right", "bottom-0 right-0 h-4 w-4 cursor-nwse-resize rounded-br-3xl", "Resize video player from bottom-right corner")}

            <div
              className="relative z-10 flex cursor-grab items-center justify-between gap-3 border-b border-border px-4 py-3 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <GripHorizontal className="h-4 w-4 shrink-0 text-neutral-400" />
              <div className="min-w-0 flex-1 pr-1">
                <p className="line-clamp-1 text-sm font-semibold leading-5 text-foreground">
                  {video.title}
                </p>
                <p className="line-clamp-1 text-xs leading-4 text-muted-foreground">
                  {video.channelTitle}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Reset size"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onPointerDown={handleResetSize}
                  onClick={(event) => event.preventDefault()}
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Minimize video player"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onPointerDown={stopDragStart}
                  onClick={() => setIsMinimized(true)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Close video player"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  onPointerDown={stopDragStart}
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative z-10 mx-3 mt-3 overflow-hidden rounded-2xl border border-[var(--theme-border)] bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                className="aspect-video w-full bg-black"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="relative z-10 mt-auto space-y-2 border-t border-border px-4 py-3 text-xs text-muted-foreground">
              {video.relevanceReason ? (
                <p className="line-clamp-2 leading-5 text-muted-foreground">
                  {video.relevanceReason}
                </p>
              ) : null}
              <div className="flex items-center justify-end gap-3">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Open on YouTube
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <Maximize2 className="pointer-events-none absolute bottom-2 right-2 h-3.5 w-3.5 rotate-90 text-neutral-300" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
