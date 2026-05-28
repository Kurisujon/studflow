"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/theme/ThemeProvider";
import {
  appearanceModes,
  themeColors,
  type AppearanceMode,
  type ThemeColor,
} from "@/lib/theme/theme-colors";

const APPEARANCE_LABELS: Record<AppearanceMode, string> = {
  light: "Light",
  dark: "Dark",
};

function PaintIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.4 2.6 21.4 5.6" />
      <path d="m14 7 3-3a2.1 2.1 0 0 1 3 3l-3 3" />
      <path d="M9.5 11.5 14 7l3 3-4.5 4.5" />
      <path d="M4 20c2.5 0 4.5-.7 5.8-2.1 1.2-1.2 1.4-2.9.4-3.9s-2.7-.8-3.9.4C4.9 15.7 4.2 17.5 4 20Z" />
    </svg>
  );
}

export function ThemeSettings() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { appearance, themeColor, setAppearance, setThemeColor } = useTheme();

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        aria-label="Open theme settings"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          border: "1px solid var(--theme-border)",
          backgroundColor: open ? "var(--theme-soft)" : "var(--card)",
          color: open ? "var(--theme-primary)" : "var(--foreground)",
          cursor: "pointer",
          boxShadow: open ? "0 10px 24px var(--theme-shadow)" : undefined,
        }}
      >
        <PaintIcon size={17} />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Theme settings"
          style={{
            position: "absolute",
            top: "calc(100% + 0.6rem)",
            right: 0,
            width: "min(320px, calc(100vw - 2rem))",
            padding: "1rem",
            borderRadius: "20px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--popover)",
            color: "var(--popover-foreground)",
            boxShadow: "0 22px 56px rgba(17,17,16,0.18)",
            zIndex: 100,
          }}
        >
          <div style={{ display: "grid", gap: "0.85rem" }}>
            <section>
              <p
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                  marginBottom: "0.55rem",
                }}
              >
                Appearance
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.4rem" }}>
                {appearanceModes.map((mode) => {
                  const selected = appearance === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setAppearance(mode)}
                      style={{
                        minHeight: "36px",
                        borderRadius: "12px",
                        border: selected ? "1px solid var(--theme-primary)" : "1px solid var(--border)",
                        backgroundColor: selected ? "var(--theme-soft)" : "var(--card)",
                        color: selected ? "var(--theme-primary)" : "var(--foreground)",
                        fontSize: "0.84rem",
                        fontWeight: 650,
                        cursor: "pointer",
                      }}
                    >
                      {APPEARANCE_LABELS[mode]}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <p
                style={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                  marginBottom: "0.55rem",
                }}
              >
                Theme color
              </p>
              <div style={{ display: "grid", gap: "0.38rem" }}>
                {(Object.keys(themeColors) as ThemeColor[]).map((colorKey) => {
                  const color = themeColors[colorKey];
                  const selected = themeColor === colorKey;
                  return (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setThemeColor(colorKey)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.7rem",
                        minHeight: "38px",
                        padding: "0.45rem 0.55rem",
                        borderRadius: "12px",
                        border: selected ? "1px solid var(--theme-primary)" : "1px solid transparent",
                        backgroundColor: selected ? "var(--theme-soft)" : "transparent",
                        color: "var(--foreground)",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                        <span
                          aria-hidden="true"
                          style={{
                            width: "0.85rem",
                            height: "0.85rem",
                            borderRadius: "999px",
                            backgroundColor: color.primary,
                            boxShadow: `0 0 0 3px ${color.soft}`,
                          }}
                        />
                        <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{color.name}</span>
                      </span>
                      {selected ? <CheckCircle2 size={15} color="var(--theme-primary)" /> : null}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
