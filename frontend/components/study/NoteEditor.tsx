"use client";

import { Button } from "@/components/ui/button";

type NoteEditorProps = {
  selectedText: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export function NoteEditor({
  selectedText,
  value,
  onChange,
  onSave,
  onCancel,
  onDelete,
}: NoteEditorProps) {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div
        style={{
          padding: "1rem",
          borderRadius: "18px",
          backgroundColor: "var(--card)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--theme-primary)",
            marginBottom: "0.45rem",
          }}
        >
          Selected Text
        </p>
        <p style={{ color: "var(--muted-foreground)" }}>“{selectedText}”</p>
      </div>

      <label style={{ display: "grid", gap: "0.45rem" }}>
        <span
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--theme-primary)",
          }}
        >
          Note
        </span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={6}
          placeholder="Write your note here..."
          style={{
            width: "100%",
            borderRadius: "16px",
            border: "1px solid var(--theme-border)",
            padding: "0.95rem",
            resize: "vertical",
            backgroundColor: "var(--card)",
            color: "var(--foreground)",
          }}
        />
      </label>

      <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
        <Button
          variant="outline"
          onClick={onCancel}
          style={{ minHeight: "42px", paddingInline: "16px", borderRadius: "14px" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          style={{ minHeight: "42px", paddingInline: "18px", borderRadius: "14px" }}
        >
          Save Note
        </Button>
        {onDelete ? (
          <Button
            variant="ghost"
            onClick={onDelete}
            style={{ minHeight: "42px", paddingInline: "16px", borderRadius: "14px" }}
          >
            Delete Note
          </Button>
        ) : null}
      </div>
    </div>
  );
}
