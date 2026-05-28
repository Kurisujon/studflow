"use client";

import { MessageSquareText } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FloatingNotesButton({
  count,
  onClick,
  behindDrawer = false,
}: {
  count: number;
  onClick: () => void;
  behindDrawer?: boolean;
}) {
  return (
    <Button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      data-study-bubble-head="true"
      style={{
        position: "fixed",
        right: "20px",
        top: "128px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "52px",
        height: "52px",
        borderRadius: "18px",
        boxShadow: "0 16px 38px var(--theme-shadow)",
        zIndex: behindDrawer ? 60 : 79,
        background: "linear-gradient(180deg, var(--card), var(--theme-soft))",
        border: "1px solid var(--theme-border)",
        color: "var(--foreground)",
      }}
      aria-label="Open study tools"
      title="Open study tools"
    >
      <MessageSquareText size={18} />
      <span
        style={{
          position: "absolute",
          top: "-4px",
          right: "-4px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "1.25rem",
          height: "1.25rem",
          borderRadius: "999px",
          backgroundColor: "var(--theme-primary)",
          color: "var(--theme-on-primary)",
          fontSize: "0.72rem",
          fontWeight: 600,
          border: "1px solid rgba(255,255,255,0.22)",
        }}
      >
        {count}
      </span>
    </Button>
  );
}
