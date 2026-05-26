"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { AnnotatableTextBlock } from "@/components/study/AnnotatableTextBlock";
import { FloatingNotesButton } from "@/components/study/FloatingNotesButton";
import { RelatedLearningVideos } from "@/components/study/RelatedLearningVideos";
import { StudySidePanel } from "@/components/study/StudySidePanel";
import { Button } from "@/components/ui/button";
import { deleteAnnotation, saveAnnotation } from "@/lib/api/annotations";
import type { StudyDocument } from "@/lib/types";
import type {
  AIToolMode,
  Annotation,
  AnnotationColor,
  SelectionState,
  StudyBubbleTab,
  StudyNote,
  TextSelectionPayload,
  UnderlineColor,
} from "@/types/annotations";

type SummaryData = NonNullable<StudyDocument["summary_data"]>;

const STORAGE_KEY_PREFIX = "distill-summary-annotations-v4";

const HIGHLIGHT_COLORS: AnnotationColor[] = [
  "blue",
  "yellow",
  "green",
  "pink",
  "purple",
];

function storageKey(documentId: string) {
  return `${STORAGE_KEY_PREFIX}:${documentId}`;
}

function formatTerm(term: string) {
  const separator = term.includes(":") ? ":" : term.includes(" - ") ? " - " : null;
  if (!separator) return { label: term, definition: "" };
  const [label, ...rest] = term.split(separator);
  return { label: label.trim(), definition: rest.join(separator).trim() };
}

function makeAnnotation(
  documentId: string,
  selection: SelectionState,
  type: "highlight" | "underline" | "note",
  color?: AnnotationColor | UnderlineColor,
  noteContent?: string,
): Annotation {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    documentId,
    selectedText: selection.selectedText,
    startOffset: selection.startOffset,
    endOffset: selection.endOffset,
    blockId: selection.blockId,
    type,
    color: type === "highlight" && color !== "neutral" ? color : undefined,
    underlineColor: type === "underline" ? color ?? "blue" : undefined,
    noteContent,
    createdAt: now,
    updatedAt: now,
  };
}

export function InteractiveSummaryReader({
  documentId,
  summary,
}: {
  documentId: string;
  summary: SummaryData | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [pendingSelection, setPendingSelection] = useState<SelectionState | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeBubbleTab, setActiveBubbleTab] = useState<StudyBubbleTab>("notes");
  const [assistantInitialQuestion, setAssistantInitialQuestion] = useState("");
  const [aiMode, setAiMode] = useState<AIToolMode>("ask-ai");
  const [aiContextText, setAiContextText] = useState("");
  const [activeHighlightColor] = useState<AnnotationColor>("blue");
  const [underlineColorMode, setUnderlineColorMode] = useState(false);
  const [noteComposerValue, setNoteComposerValue] = useState("");
  const [noteContextText, setNoteContextText] = useState("");
  const [pulseAnnotationId, setPulseAnnotationId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectionPopoverRef = useRef<HTMLDivElement | null>(null);

  function handleTextSelection(payload: TextSelectionPayload) {
    const state: SelectionState = {
      blockId: payload.blockId,
      selectedText: payload.selectedText,
      startOffset: payload.startOffset,
      endOffset: payload.endOffset,
      x: payload.rect.left + payload.rect.width / 2,
      y: payload.rect.top,
    };
    setSelectionState(state);
    setPendingSelection(state);
  }

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(documentId));
      if (raw) {
        setAnnotations(JSON.parse(raw) as Annotation[]);
      }
    } catch {
      setAnnotations([]);
    }
  }, [documentId]);

  useEffect(() => {
    window.localStorage.setItem(storageKey(documentId), JSON.stringify(annotations));
  }, [annotations, documentId]);

  useEffect(() => {
    function handleDocumentPointerDown(event: PointerEvent) {
      const target = event.target as Node;

      const clickedInsideSelectionPopover =
        selectionPopoverRef.current?.contains(target) ?? false;
      const clickedInsideMessageBubble =
        target instanceof HTMLElement &&
        Boolean(target.closest("[data-study-bubble-head]"));
      const clickedInsideStudyBubblePanel =
        target instanceof HTMLElement &&
        Boolean(target.closest("[data-study-bubble]"));

      if (clickedInsideSelectionPopover || clickedInsideMessageBubble || clickedInsideStudyBubblePanel) {
        return;
      }

      if (pendingSelection) {
        clearPendingSelection();
      }

      if (drawerOpen) {
        setDrawerOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        clearPendingSelection();
        setDrawerOpen(false);
      }
    }

    function handleShortcuts(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.altKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        setDrawerOpen((current) => !current);
      }
    }

    window.addEventListener("pointerdown", handleDocumentPointerDown);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("keydown", handleShortcuts);
    return () => {
      window.removeEventListener("pointerdown", handleDocumentPointerDown);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("keydown", handleShortcuts);
    };
  }, [drawerOpen, pendingSelection]);

  if (!summary || summary.detailed_sections.length === 0) {
    return <p>No summary available yet.</p>;
  }

  const sections = summary.detailed_sections;
  const activeSection = sections[activeIndex];
  const progress = ((activeIndex + 1) / sections.length) * 100;
  const pendingSelectionForBlock = (blockId: string) =>
    pendingSelection?.blockId === blockId
      ? {
          startOffset: pendingSelection.startOffset,
          endOffset: pendingSelection.endOffset,
        }
      : null;

  const topicAnnotations = annotations.filter((annotation) => {
    return (
      annotation.blockId === `overview-${activeIndex}` ||
      annotation.blockId === `title-${activeIndex}` ||
      annotation.blockId.startsWith(`point-${activeIndex}-`) ||
      annotation.blockId.startsWith(`term-${activeIndex}-`)
    );
  });

  const topicNotes = notes.filter((note) => note.topicIndex === activeIndex || note.topicIndex === undefined);

  function commit(next: Annotation[]) {
    setAnnotations(next);
  }

  function clearPendingSelection() {
    window.getSelection()?.removeAllRanges();
    setSelectionState(null);
    setPendingSelection(null);
    setUnderlineColorMode(false);
  }

  function saveHighlight(color: AnnotationColor) {
    if (!pendingSelection) return;

    const existing = annotations.find(
      (annotation) =>
        annotation.type === "highlight" &&
        annotation.blockId === pendingSelection.blockId &&
        annotation.startOffset === pendingSelection.startOffset &&
        annotation.endOffset === pendingSelection.endOffset,
    );

    if (existing && existing.color === color) {
      commit(annotations.filter((annotation) => annotation.id !== existing.id));
      void deleteAnnotation(existing.id);
      clearPendingSelection();
      return;
    }

    const created = makeAnnotation(documentId, pendingSelection, "highlight", color);
    commit([
      ...annotations.filter(
        (annotation) =>
          !(
            annotation.type === "highlight" &&
            annotation.blockId === pendingSelection.blockId &&
            annotation.startOffset === pendingSelection.startOffset &&
            annotation.endOffset === pendingSelection.endOffset
          ),
      ),
      created,
    ]);
    void saveAnnotation(created);
    clearPendingSelection();
  }

  function saveUnderline(color: UnderlineColor) {
    if (!pendingSelection) return;

    const existing = annotations.find(
      (annotation) =>
        annotation.type === "underline" &&
        annotation.blockId === pendingSelection.blockId &&
        annotation.startOffset === pendingSelection.startOffset &&
        annotation.endOffset === pendingSelection.endOffset,
    );

    if (existing && existing.underlineColor === color) {
      commit(annotations.filter((annotation) => annotation.id !== existing.id));
      void deleteAnnotation(existing.id);
      clearPendingSelection();
      return;
    }

    const created = makeAnnotation(documentId, pendingSelection, "underline", color);
    commit([
      ...annotations.filter(
        (annotation) =>
          !(
            annotation.type === "underline" &&
            annotation.blockId === pendingSelection.blockId &&
            annotation.startOffset === pendingSelection.startOffset &&
            annotation.endOffset === pendingSelection.endOffset
          ),
      ),
      created,
    ]);
    void saveAnnotation(created);
    clearPendingSelection();
  }

  function saveNote() {
    if (!noteComposerValue.trim()) return;

    const now = new Date().toISOString();
    const selected = selectionState ?? pendingSelection;
    const note: StudyNote = {
      id: crypto.randomUUID(),
      annotationId: selected ? crypto.randomUUID() : undefined,
      documentId,
      topicIndex: activeIndex,
      selectedText: selected?.selectedText,
      content: noteComposerValue.trim(),
      createdAt: now,
      updatedAt: now,
    };

    setNotes((current) => [...current, note]);

    if (selected) {
      const noteAnnotation = makeAnnotation(
        documentId,
        selected,
        "note",
        undefined,
        note.content,
      );
      noteAnnotation.id = note.annotationId ?? noteAnnotation.id;
      commit([...annotations, noteAnnotation]);
      void saveAnnotation(noteAnnotation);
    }

    setNoteComposerValue("");
    setNoteContextText("");
    clearPendingSelection();
  }

  function deleteNote(noteId: string) {
    const note = notes.find((item) => item.id === noteId);
    setNotes((current) => current.filter((item) => item.id !== noteId));
    if (note?.annotationId) {
      commit(annotations.filter((annotation) => annotation.id !== note.annotationId));
      void deleteAnnotation(note.annotationId);
    }
  }

  function jumpToText(note: StudyNote) {
    if (!note.annotationId) return;
    const element = rootRef.current?.querySelector<HTMLElement>(
      `[data-annotation-id="${note.annotationId}"]`,
    );
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    setPulseAnnotationId(note.annotationId);
    window.setTimeout(() => setPulseAnnotationId(null), 1200);
  }

  function renderPoint(point: string, index: number) {
    const blockId = `point-${activeIndex}-${index}`;
    const blockAnnotations = topicAnnotations.filter((annotation) => annotation.blockId === blockId);
    const pulse = blockAnnotations.some((annotation) => annotation.id === pulseAnnotationId);
    return (
      <AnnotatableTextBlock
        key={`${activeSection.topic_title}-point-${index}`}
        as="li"
        blockId={blockId}
        text={point}
        annotations={blockAnnotations}
        pendingSelection={pendingSelectionForBlock(blockId)}
        pulse={pulse}
        onSelection={handleTextSelection}
      />
    );
  }

  function renderTerm(term: string, index: number) {
    const blockId = `term-${activeIndex}-${index}`;
    const blockAnnotations = topicAnnotations.filter((annotation) => annotation.blockId === blockId);
    const pulse = blockAnnotations.some((annotation) => annotation.id === pulseAnnotationId);
    const formatted = formatTerm(term);
    const text = formatted.definition ? `${formatted.label}: ${formatted.definition}` : formatted.label;
    return (
      <AnnotatableTextBlock
        key={`${activeSection.topic_title}-term-${index}`}
        as="li"
        blockId={blockId}
        text={text}
        annotations={blockAnnotations}
        pendingSelection={pendingSelectionForBlock(blockId)}
        pulse={pulse}
        termLabelEnd={formatted.label.length}
        onSelection={handleTextSelection}
      />
    );
  }

  function openNotesFromPendingSelection() {
    if (!pendingSelection) return;
    setSelectionState(pendingSelection);
    setNoteContextText(pendingSelection.selectedText);
    setDrawerOpen(true);
    setActiveBubbleTab("notes");
  }

  function openAIFromPendingSelection(mode: AIToolMode) {
    if (!pendingSelection) return;
    setSelectionState(pendingSelection);
    setAiContextText(pendingSelection.selectedText);
    setDrawerOpen(true);
    setActiveBubbleTab("ai");
    setAiMode(mode);
    setAssistantInitialQuestion(
      mode === "simplify"
        ? "Explain this in simpler terms."
        : mode === "define-term"
          ? "Define this term clearly and explain how it is used in this study topic."
          : "",
    );
  }

  function handleBubbleHeadClick() {
    setDrawerOpen((current) => {
      const next = !current;
      if (next) {
        setSelectionState(null);
        setPendingSelection(null);
        setNoteContextText("");
        setAiContextText("");
        setNoteComposerValue("");
      } else {
        setSelectionState(null);
        setPendingSelection(null);
        setNoteContextText("");
        setAiContextText("");
        setNoteComposerValue("");
      }
      return next;
    });
  }

  return (
    <section style={{ width: "100%", display: "block" }}>
      <div
        ref={rootRef}
        style={{ cursor: "text" }}
      >
        <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
          <div
            style={{
              padding: "1.4rem",
              borderRadius: "24px",
              background:
                "linear-gradient(135deg, rgba(255,247,237,0.95), rgba(255,255,255,0.96))",
              border: "1px solid rgba(251, 191, 36, 0.25)",
              boxShadow: "0 18px 48px rgba(245, 158, 11, 0.08)",
            }}
          >
            <p
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#b45309",
                marginBottom: "0.55rem",
              }}
            >
              Overall Overview
            </p>
            <AnnotatableTextBlock
              as="p"
              blockId={`overview-${activeIndex}`}
              text={summary.overall_overview}
              annotations={topicAnnotations.filter(
                (annotation) => annotation.blockId === `overview-${activeIndex}`,
              )}
              pendingSelection={pendingSelectionForBlock(`overview-${activeIndex}`)}
              onSelection={handleTextSelection}
              style={{
                fontFamily: '"Geist", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                fontSize: "1.05rem",
                lineHeight: 1.85,
                color: "#3f2a14",
              }}
            />
          </div>
          
          <RelatedLearningVideos documentId={documentId} />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <p
              style={{
                fontSize: "0.82rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#9a3412",
              }}
            >
              Topic {activeIndex + 1} of {sections.length}
            </p>
            <div
              style={{
                flex: 1,
                minWidth: "180px",
                maxWidth: "320px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: "rgba(251,191,36,0.18)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #f59e0b, #f97316, #ef4444)",
                }}
              />
            </div>
          </div>
        </div>

        <article
          style={{
            maxWidth: "760px",
            marginInline: "auto",
            padding: "2rem",
            borderRadius: "30px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,250,240,0.94))",
            border: "1px solid rgba(249,115,22,0.18)",
            boxShadow: "0 24px 64px rgba(249,115,22,0.08)",
          }}
        >
          <p
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#c2410c",
              marginBottom: "0.7rem",
            }}
          >
            Detailed Topic
          </p>
          <AnnotatableTextBlock
            as="h2"
            blockId={`title-${activeIndex}`}
            text={activeSection.topic_title}
            annotations={topicAnnotations.filter(
              (annotation) => annotation.blockId === `title-${activeIndex}`,
            )}
            pendingSelection={pendingSelectionForBlock(`title-${activeIndex}`)}
            onSelection={handleTextSelection}
            style={{
              fontFamily: '"Geist", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.2,
              fontWeight: 700,
              color: "#2f1c0f",
              marginBottom: "1.3rem",
            }}
          />

          <div style={{ display: "grid", gap: "1.4rem" }}>
            <div>
              <p
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#ea580c",
                  marginBottom: "0.85rem",
                }}
              >
                Key Points
              </p>
              <AnimatePresence mode="wait">
                <motion.ul
                  key={`topic-points-${activeIndex}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  style={{
                    display: "grid",
                    gap: "0.85rem",
                    paddingLeft: "1.2rem",
                    fontFamily: '"Geist", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                    fontSize: "1.04rem",
                    lineHeight: 1.9,
                    color: "#3f2a14",
                  }}
                >
                  {activeSection.key_points.map(renderPoint)}
                </motion.ul>
              </AnimatePresence>
            </div>

            {activeSection.important_terms_and_definitions.length > 0 ? (
              <div
                style={{
                  padding: "1.2rem 1.25rem",
                  borderRadius: "22px",
                  background:
                    "linear-gradient(135deg, rgba(255,237,213,0.92), rgba(255,255,255,0.96))",
                  border: "1px solid rgba(251,146,60,0.22)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#c2410c",
                    marginBottom: "0.85rem",
                  }}
                >
                  Important Terms and Definitions
                </p>
                <AnimatePresence mode="wait">
                  <motion.ul
                    key={`topic-terms-${activeIndex}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                      display: "grid",
                      gap: "0.7rem",
                      paddingLeft: 0,
                      listStyle: "none",
                      fontFamily: '"Geist", "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
                      fontSize: "1rem",
                      lineHeight: 1.8,
                      color: "#4a2d1c",
                    }}
                  >
                    {activeSection.important_terms_and_definitions.map(renderTerm)}
                  </motion.ul>
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        </article>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1rem",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flex: 1, justifyContent: "flex-start" }}>
            <Button
              variant="outline"
              disabled={activeIndex === 0}
              onClick={() => setActiveIndex((current) => current - 1)}
              style={{ minHeight: "42px", minWidth: "148px", paddingInline: "18px", borderRadius: "14px" }}
            >
              Previous Topic
            </Button>
          </div>
          <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
            <Button
              disabled={activeIndex === sections.length - 1}
              onClick={() => setActiveIndex((current) => current + 1)}
              style={{ minHeight: "42px", minWidth: "128px", paddingInline: "18px", borderRadius: "14px" }}
            >
              Next Topic
            </Button>
          </div>

          <FloatingNotesButton
            count={notes.length}
            behindDrawer={drawerOpen}
            onClick={handleBubbleHeadClick}
          />
        </div>

        <AnimatePresence>
          {pendingSelection ? (
            <motion.div
              ref={selectionPopoverRef}
              data-highlight-popover="true"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              style={{
                position: "fixed",
                top: pendingSelection.y,
                left:
                  typeof window !== "undefined"
                    ? Math.min(Math.max(pendingSelection.x, 220), window.innerWidth - 220)
                    : pendingSelection.x,
                transform: "translateX(-50%)",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.55rem 0.65rem",
                borderRadius: "16px",
                backgroundColor: "rgba(28,25,23,0.96)",
                boxShadow: "0 16px 34px rgba(17,17,16,0.24)",
              }}
            >
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => saveHighlight(color)}
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "999px",
                    border:
                      activeHighlightColor === color
                        ? "2px solid rgba(255,255,255,0.95)"
                        : "1px solid rgba(255,255,255,0.45)",
                    backgroundColor:
                      color === "blue"
                        ? "#60a5fa"
                        : color === "yellow"
                          ? "#facc15"
                          : color === "green"
                            ? "#34d399"
                            : color === "pink"
                              ? "#fb7185"
                              : "#c084fc",
                    cursor: "pointer",
                  }}
                />
              ))}
              <div style={{ position: "relative" }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setUnderlineColorMode((current) => !current)}
                  style={{ minHeight: "36px", paddingInline: "14px", borderRadius: "12px" }}
                >
                  Underline
                </Button>
                {underlineColorMode ? (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: "0.4rem",
                      padding: "0.45rem 0.5rem",
                      borderRadius: "14px",
                      backgroundColor: "rgba(28,25,23,0.96)",
                      boxShadow: "0 14px 32px rgba(17,17,16,0.24)",
                    }}
                  >
                    {[...HIGHLIGHT_COLORS, "neutral" as const].map((color) => (
                      <button
                        key={`u-${color}`}
                        type="button"
                        onClick={() => saveUnderline(color)}
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "999px",
                          border: "1px solid rgba(255,255,255,0.45)",
                          backgroundColor:
                            color === "blue"
                              ? "#60a5fa"
                              : color === "yellow"
                                ? "#facc15"
                                : color === "green"
                                  ? "#34d399"
                                  : color === "pink"
                                    ? "#fb7185"
                                    : color === "purple"
                                      ? "#c084fc"
                                      : "#525252",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={openNotesFromPendingSelection}
                style={{ minHeight: "36px", paddingInline: "14px", borderRadius: "12px" }}
              >
                Add to Note
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openAIFromPendingSelection("ask-ai")}
                style={{ minHeight: "36px", paddingInline: "14px", borderRadius: "12px" }}
              >
                Ask AI
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearPendingSelection}
                style={{
                  minHeight: "36px",
                  paddingInline: "14px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backgroundColor: "transparent",
                  color: "#e5e7eb",
                }}
              >
                Cancel
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <StudySidePanel
        open={drawerOpen}
        activeTab={activeBubbleTab}
        onTabChange={setActiveBubbleTab}
        selectedText={aiContextText || selectionState?.selectedText || pendingSelection?.selectedText || ""}
        assistantInitialQuestion={assistantInitialQuestion}
        aiMode={aiMode}
        notes={topicNotes}
        noteComposerValue={noteComposerValue}
        selectedNoteText={noteContextText || selectionState?.selectedText || pendingSelection?.selectedText || ""}
        onNoteComposerChange={setNoteComposerValue}
        onSaveNote={saveNote}
        onDeleteNote={deleteNote}
        onJumpToText={jumpToText}
        onAskAINote={(note) => {
          setDrawerOpen(true);
          setActiveBubbleTab("ai");
          setAiMode("ask-ai");
          setAiContextText(note.selectedText ?? "");
          setSelectionState(
            note.annotationId
              ? (() => {
                  const annotation = annotations.find((item) => item.id === note.annotationId);
                  return annotation
                    ? {
                        blockId: annotation.blockId,
                        selectedText: annotation.selectedText,
                        startOffset: annotation.startOffset,
                        endOffset: annotation.endOffset,
                        x: 0,
                        y: 0,
                      }
                    : null;
                })()
              : null,
          );
        }}
      />
    </section>
  );
}
