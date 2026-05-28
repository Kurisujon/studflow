"use client";

import { AnimatePresence, motion } from "framer-motion";

import { AIStudyAssistantPanel } from "@/components/study/AIStudyAssistantPanel";
import { NotesPanel } from "@/components/study/NotesPanel";
import type { AIToolMode, StudyAIContext, StudyBubbleTab, StudyNote } from "@/types/annotations";

export function StudySidePanel({
  open,
  documentId,
  activeTab,
  onTabChange,
  selectedText,
  aiContext,
  assistantInitialQuestion,
  aiMode,
  notes,
  deletedNotes,
  focusedNoteId,
  noteComposerValue,
  selectedNoteText,
  onNoteComposerChange,
  onSaveNote,
  onDeleteNote,
  onRestoreNote,
  onForceDeleteNote,
  onJumpToText,
  onAskAINote,
}: {
  open: boolean;
  documentId: string;
  activeTab: StudyBubbleTab;
  onTabChange: (tab: StudyBubbleTab) => void;
  selectedText: string;
  aiContext: StudyAIContext;
  assistantInitialQuestion?: string;
  aiMode: AIToolMode;
  notes: StudyNote[];
  deletedNotes: StudyNote[];
  focusedNoteId: string | null;
  noteComposerValue: string;
  selectedNoteText: string;
  onNoteComposerChange: (value: string) => void;
  onSaveNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onRestoreNote: (noteId: string) => void;
  onForceDeleteNote: (noteId: string) => void;
  onJumpToText: (note: StudyNote) => void;
  onAskAINote: (note: StudyNote) => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          data-study-bubble="true"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            position: "fixed",
            right: "24px",
            top: "calc(var(--nav-height) + 24px)",
            width: "100%",
            maxWidth: "380px",
            maxHeight: "calc(100dvh - var(--nav-height) - 48px)",
            padding: "1.3rem",
            borderRadius: "24px",
            backgroundColor: "var(--card)",
            border: "1px solid var(--theme-border)",
            boxShadow: "0 22px 60px var(--theme-shadow)",
            overflowY: "auto",
            zIndex: 120,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--theme-primary)", marginBottom: "0.3rem" }}>
                Message Bubble
              </p>
              <h3 style={{ color: "var(--foreground)" }}>Study tools</h3>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => onTabChange("notes")}
              style={{
                minHeight: "40px",
                paddingInline: "16px",
                borderRadius: "999px",
                border: "1px solid var(--theme-border)",
                backgroundColor: activeTab === "notes" ? "var(--theme-primary)" : "var(--card)",
                color: activeTab === "notes" ? "var(--theme-on-primary)" : "var(--foreground)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Notes
            </button>
            <button
              type="button"
              onClick={() => onTabChange("ai")}
              style={{
                minHeight: "40px",
                paddingInline: "16px",
                borderRadius: "999px",
                border: "1px solid var(--theme-border)",
                backgroundColor: activeTab === "ai" ? "var(--theme-primary)" : "var(--card)",
                color: activeTab === "ai" ? "var(--theme-on-primary)" : "var(--foreground)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              AI
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "ai" ? (
              <motion.div key="ai" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18, ease: "easeOut" }}>
                <AIStudyAssistantPanel
                  documentId={documentId}
                  context={aiContext.source ? aiContext : { source: "selection", selectedText }}
                  initialQuestion={assistantInitialQuestion}
                  mode={aiMode}
                />
              </motion.div>
            ) : (
              <motion.div key="notes" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18, ease: "easeOut" }}>
                <NotesPanel
                  notes={notes}
                  deletedNotes={deletedNotes}
                  focusedNoteId={focusedNoteId}
                  composerValue={noteComposerValue}
                  selectedTextContext={selectedNoteText}
                  onComposerChange={onNoteComposerChange}
                  onSaveNote={onSaveNote}
                  onDeleteNote={onDeleteNote}
                  onRestoreNote={onRestoreNote}
                  onForceDeleteNote={onForceDeleteNote}
                  onJumpToText={onJumpToText}
                  onAskAI={onAskAINote}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
