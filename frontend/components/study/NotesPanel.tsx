"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { StudyNote } from "@/types/annotations";

function noteLabel(note: StudyNote) {
  return note.selectedText ? `“${note.selectedText}”` : "General note";
}

function canJumpToText(note: StudyNote) {
  return Boolean(note.annotationId && note.selectedText);
}

export function NotesPanel({
  notes,
  deletedNotes,
  focusedNoteId,
  composerValue,
  selectedTextContext,
  onComposerChange,
  onSaveNote,
  onDeleteNote,
  onRestoreNote,
  onForceDeleteNote,
  onJumpToText,
  onAskAI,
}: {
  notes: StudyNote[];
  deletedNotes: StudyNote[];
  focusedNoteId: string | null;
  composerValue: string;
  selectedTextContext: string;
  onComposerChange: (value: string) => void;
  onSaveNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onRestoreNote: (noteId: string) => void;
  onForceDeleteNote: (noteId: string) => void;
  onJumpToText: (note: StudyNote) => void;
  onAskAI: (note: StudyNote) => void;
}) {
  const [view, setView] = useState<"active" | "trash">("active");

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSaveNote();
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c2410c" }}>
          Notes
        </p>
        <div style={{ display: "flex", gap: "0.45rem" }}>
          <Button variant={view === "active" ? "default" : "outline"} size="sm" onClick={() => setView("active")} style={{ minHeight: "38px", minWidth: "78px", paddingInline: "14px", borderRadius: "999px" }}>
            Active
          </Button>
          <Button variant={view === "trash" ? "default" : "outline"} size="sm" onClick={() => setView("trash")} style={{ minHeight: "38px", minWidth: "78px", paddingInline: "14px", borderRadius: "999px" }}>
            Trash {deletedNotes.length > 0 ? `(${deletedNotes.length})` : ""}
          </Button>
        </div>
      </div>

      {view === "active" ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {notes.length === 0 ? (
            <div style={{ padding: "1rem", borderRadius: "18px", backgroundColor: "rgba(255,255,255,0.84)", border: "1px solid rgba(251,146,60,0.18)" }}>
              <p style={{ color: "#7c2d12" }}>No notes yet for this topic.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  if (canJumpToText(note)) onJumpToText(note);
                }}
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  borderRadius: "18px",
                  backgroundColor: focusedNoteId === note.id ? "rgba(254,243,199,0.94)" : "rgba(255,255,255,0.84)",
                  border: focusedNoteId === note.id ? "1px solid rgba(245,158,11,0.55)" : "1px solid rgba(251,146,60,0.18)",
                  cursor: canJumpToText(note) ? "pointer" : "default",
                  boxShadow: focusedNoteId === note.id ? "0 14px 32px rgba(245,158,11,0.12)" : undefined,
                }}
              >
                <p style={{ color: "#7c2d12", marginBottom: "0.4rem" }}>{noteLabel(note)}</p>
                <p style={{ color: "#3f2a14", marginBottom: "0.65rem" }}>{note.content}</p>
                <p style={{ color: "#9a3412", fontSize: "0.82rem", marginBottom: "0.7rem" }}>
                  Updated {new Date(note.updatedAt).toLocaleString()}
                </p>
                <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                  <Button variant="ghost" size="sm" onClick={(event) => { event.stopPropagation(); onAskAI(note); }} style={{ minHeight: "40px", paddingInline: "16px", borderRadius: "14px" }}>
                    Ask AI
                  </Button>
                  <Button variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); onDeleteNote(note.id); }} style={{ minHeight: "40px", paddingInline: "16px", borderRadius: "14px" }}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {deletedNotes.length === 0 ? (
            <div style={{ padding: "1rem", borderRadius: "18px", backgroundColor: "rgba(255,255,255,0.84)", border: "1px solid rgba(251,146,60,0.18)" }}>
              <p style={{ color: "#7c2d12" }}>Trash is empty.</p>
            </div>
          ) : (
            deletedNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  padding: "1rem",
                  borderRadius: "18px",
                  backgroundColor: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(120,113,108,0.2)",
                }}
              >
                <p style={{ color: "#7c2d12", marginBottom: "0.4rem" }}>{noteLabel(note)}</p>
                <p style={{ color: "#3f2a14", marginBottom: "0.65rem" }}>{note.content}</p>
                <p style={{ color: "#78716c", fontSize: "0.82rem", marginBottom: "0.7rem" }}>
                  Deleted {note.deletedAt ? new Date(note.deletedAt).toLocaleString() : "recently"}
                </p>
                <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
                  <Button variant="outline" size="sm" onClick={() => onRestoreNote(note.id)} style={{ minHeight: "40px", paddingInline: "16px", borderRadius: "14px" }}>
                    Restore
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onForceDeleteNote(note.id)} style={{ minHeight: "40px", paddingInline: "16px", borderRadius: "14px" }}>
                    Delete Forever
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "0.25rem",
          paddingTop: "0.9rem",
          borderTop: "1px solid rgba(249,115,22,0.12)",
          display: view === "active" ? "grid" : "none",
          gap: "0.6rem",
        }}
      >
        <p style={{ fontSize: "0.82rem", color: "#7c2d12" }}>
          {selectedTextContext
            ? `Write a note about: “${selectedTextContext}”`
            : "Write a note for this topic"}
        </p>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-end" }}>
          <textarea
            value={composerValue}
            onChange={(event) => onComposerChange(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Write a note..."
            style={{
              flex: 1,
              borderRadius: "16px",
              border: "1px solid rgba(251,146,60,0.18)",
              padding: "0.9rem",
              resize: "vertical",
              backgroundColor: "rgba(255,255,255,0.86)",
            }}
          />
          <Button onClick={onSaveNote} style={{ minHeight: "42px", paddingInline: "18px", borderRadius: "14px" }}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
