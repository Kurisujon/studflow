"use client";

import type { CSSProperties, ReactNode } from "react";

import type {
  StudyAnnotation,
  TextSelectionPayload,
} from "@/types/annotations";

type AnnotatableElement = "span" | "p" | "h2" | "li";

const HIGHLIGHT_COLOR_MAP = {
  blue: "rgba(96,165,250,0.24)",
  yellow: "rgba(250,204,21,0.28)",
  green: "rgba(52,211,153,0.24)",
  pink: "rgba(251,113,133,0.22)",
  purple: "rgba(192,132,252,0.2)",
} satisfies Record<NonNullable<StudyAnnotation["color"]>, string>;

const UNDERLINE_COLOR_MAP = {
  blue: "#60a5fa",
  yellow: "#facc15",
  green: "#34d399",
  pink: "#fb7185",
  purple: "#a78bfa",
  neutral: "#525252",
} satisfies Record<NonNullable<StudyAnnotation["underlineColor"]>, string>;

export interface AnnotatableTextBlockProps {
  blockId: string;
  text: string;
  annotations: StudyAnnotation[];
  onSelection: (payload: TextSelectionPayload) => void;
  className?: string;
  as?: AnnotatableElement;
  style?: CSSProperties;
  pendingSelection?: { startOffset: number; endOffset: number } | null;
  pulse?: boolean;
  termLabelEnd?: number;
}

function annotationRangeKey(annotation: StudyAnnotation) {
  return `${annotation.blockId}:${annotation.startOffset}:${annotation.endOffset}`;
}

function getBlockForNode(node: Node | null) {
  if (!node) return null;
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;

  return element?.closest<HTMLElement>("[data-annotatable-block]") ?? null;
}

function getTextOffset(root: HTMLElement, node: Node, offset: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(candidate) {
      const parent = candidate.parentElement;
      if (parent?.closest("[data-annotation-marker]")) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let currentNode = walker.nextNode();
  let total = 0;

  while (currentNode) {
    const length = currentNode.textContent?.length ?? 0;
    if (currentNode === node) {
      return total + offset;
    }
    total += length;
    currentNode = walker.nextNode();
  }

  return total;
}

function renderTextWithOptionalTermLabel(
  text: string,
  startOffset: number,
  termLabelEnd?: number,
) {
  if (!termLabelEnd || startOffset >= termLabelEnd) {
    return text;
  }

  const endOffset = startOffset + text.length;
  if (endOffset <= 0) {
    return text;
  }

  const labelStart = Math.max(0, -startOffset);
  const labelEnd = Math.min(text.length, termLabelEnd - startOffset);
  const before = text.slice(0, labelStart);
  const label = text.slice(labelStart, labelEnd);
  const after = text.slice(labelEnd);

  return (
    <>
      {before}
      <strong style={{ color: "#9a3412" }}>{label}</strong>
      {after}
    </>
  );
}

function renderAnnotatedNodes({
  text,
  blockId,
  annotations,
  pendingSelection,
  termLabelEnd,
}: {
  text: string;
  blockId: string;
  annotations: StudyAnnotation[];
  pendingSelection?: { startOffset: number; endOffset: number } | null;
  termLabelEnd?: number;
}) {
  const grouped = new Map<
    string,
    {
      start: number;
      end: number;
      highlight?: StudyAnnotation;
      underline?: StudyAnnotation;
      note?: StudyAnnotation;
    }
  >();

  for (const annotation of annotations) {
    const key = annotationRangeKey(annotation);
    const current = grouped.get(key) ?? {
      start: annotation.startOffset,
      end: annotation.endOffset,
    };

    if (annotation.type === "highlight") current.highlight = annotation;
    if (annotation.type === "underline") current.underline = annotation;
    if (annotation.type === "note") current.note = annotation;

    grouped.set(key, current);
  }

  const ranges = [...grouped.values()].filter(
    (item) => item.start >= 0 && item.end <= text.length && item.start < item.end,
  );
  const breakpoints = new Set([0, text.length]);

  for (const item of ranges) {
    breakpoints.add(item.start);
    breakpoints.add(item.end);
  }

  if (
    pendingSelection &&
    pendingSelection.startOffset >= 0 &&
    pendingSelection.endOffset <= text.length &&
    pendingSelection.startOffset < pendingSelection.endOffset
  ) {
    breakpoints.add(pendingSelection.startOffset);
    breakpoints.add(pendingSelection.endOffset);
  }

  if (termLabelEnd && termLabelEnd > 0 && termLabelEnd < text.length) {
    breakpoints.add(termLabelEnd);
  }

  const orderedBreakpoints = [...breakpoints].sort((a, b) => a - b);
  const nodes: ReactNode[] = [];

  for (let index = 0; index < orderedBreakpoints.length - 1; index += 1) {
    const start = orderedBreakpoints[index];
    const end = orderedBreakpoints[index + 1];
    if (start === end) continue;

    const slice = text.slice(start, end);
    const item = ranges.find((range) => range.start <= start && range.end >= end);
    const isPending =
      pendingSelection !== null &&
      pendingSelection !== undefined &&
      pendingSelection.startOffset <= start &&
      pendingSelection.endOffset >= end;
    const style: CSSProperties = {};

    if (isPending) {
      style.background = "rgba(59,130,246,0.22)";
      style.borderRadius = "0.25rem";
    }

    if (item?.highlight?.color) {
      style.backgroundColor = HIGHLIGHT_COLOR_MAP[item.highlight.color];
      style.borderRadius = "0.3rem";
      style.padding = "0 0.08rem";
    }

    if (item?.underline?.underlineColor) {
      style.textDecorationLine = "underline";
      style.textDecorationColor = UNDERLINE_COLOR_MAP[item.underline.underlineColor];
      style.textDecorationThickness = "2px";
      style.textUnderlineOffset = "3px";
    }

    const content = renderTextWithOptionalTermLabel(slice, start, termLabelEnd);
    const annotationId = item?.note?.id ?? item?.highlight?.id ?? item?.underline?.id;
    const shouldRenderSpan = isPending || item || Object.keys(style).length > 0;

    if (!shouldRenderSpan) {
      nodes.push(<span key={`${start}-${end}`}>{content}</span>);
      continue;
    }

    nodes.push(
      <span
        key={`${start}-${end}`}
        data-annotation-id={annotationId}
        data-annotation-type={item?.note?.type ?? item?.highlight?.type ?? item?.underline?.type}
        data-annotatable-block={blockId}
        style={style}
      >
        {content}
        {item?.note && end === item.note.endOffset ? (
          <sup
            data-annotation-marker="true"
            data-note-id={item.note.id}
            style={{
              marginLeft: "0.22rem",
              color: "#c2410c",
              fontWeight: 700,
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            ●
          </sup>
        ) : null}
      </span>,
    );
  }

  return nodes;
}

export function AnnotatableTextBlock({
  blockId,
  text,
  annotations,
  onSelection,
  className,
  as = "span",
  style,
  pendingSelection,
  pulse,
  termLabelEnd,
}: AnnotatableTextBlockProps) {
  function captureSelection() {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const startBlock = getBlockForNode(range.startContainer);
    const endBlock = getBlockForNode(range.endContainer);

    if (
      !startBlock ||
      !endBlock ||
      startBlock !== endBlock ||
      startBlock.dataset.annotatableBlock !== blockId
    ) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const startOffset = getTextOffset(startBlock, range.startContainer, range.startOffset);
    const endOffset = getTextOffset(startBlock, range.endContainer, range.endOffset);

    if (startOffset === endOffset) return;

    onSelection({
      blockId,
      selectedText,
      startOffset: Math.min(startOffset, endOffset),
      endOffset: Math.max(startOffset, endOffset),
      rect: range.getBoundingClientRect(),
    });
  }

  const Component = as;
  return (
    <Component
      data-annotatable-block={blockId}
      className={className}
      onPointerUpCapture={() => window.setTimeout(captureSelection, 0)}
      onMouseUpCapture={() => window.setTimeout(captureSelection, 0)}
      style={{
        ...style,
        userSelect: "text",
        animation: pulse ? "notePulse 1s ease-out" : undefined,
      }}
    >
      {renderAnnotatedNodes({
        text,
        blockId,
        annotations,
        pendingSelection,
        termLabelEnd,
      })}
    </Component>
  );
}
