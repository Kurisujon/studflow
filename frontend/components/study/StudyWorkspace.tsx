"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FlashcardStudy } from "@/components/flashcard-study";
import { QuizStudy } from "@/components/quiz-study";
import { SummaryStudy } from "@/components/summary-study";
import { Button } from "@/components/ui/button";
import type { StudyDocument } from "@/lib/types";

type StudyTab = "summary" | "flashcards" | "quiz";

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable)
  );
}

export function StudyWorkspace({
  document,
  initialTab,
}: {
  document: StudyDocument;
  initialTab: string;
}) {
  const router = useRouter();
  const currentTab: StudyTab =
    initialTab === "flashcards" || initialTab === "quiz" ? initialTab : "summary";

  function navigateToTab(tab: StudyTab) {
    if (tab === currentTab) {
      return;
    }

    router.push(`/dashboard/study/${document.id}?tab=${tab}`);
  }

  useEffect(() => {
    function handleStudyTabShortcuts(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isTypingTarget(event.target) ||
        currentTab === "quiz"
      ) {
        return;
      }

      if (event.key === "1") {
        event.preventDefault();
        navigateToTab("summary");
        return;
      }

      if (event.key === "2") {
        event.preventDefault();
        navigateToTab("flashcards");
        return;
      }

      if (event.key === "3") {
        event.preventDefault();
        navigateToTab("quiz");
      }
    }

    window.addEventListener("keydown", handleStudyTabShortcuts);
    return () => {
      window.removeEventListener("keydown", handleStudyTabShortcuts);
    };
  }, [currentTab]);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { key: "summary" as const, label: "Summary" },
          { key: "flashcards" as const, label: "Flashcards" },
          { key: "quiz" as const, label: "Quiz" },
        ].map((item) => (
          <Button
            key={item.key}
            variant={currentTab === item.key ? "default" : "outline"}
            size="lg"
            onClick={() => navigateToTab(item.key)}
            style={{
              minHeight: "42px",
              paddingInline: "18px",
              borderRadius: "999px",
              color: currentTab === item.key ? "var(--theme-on-primary)" : "var(--foreground)",
              backgroundColor: currentTab === item.key ? "var(--theme-primary)" : "var(--card)",
              border: currentTab === item.key ? "1px solid var(--theme-primary)" : "1px solid var(--border)",
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div
        style={{
          padding: "2rem",
          border: "1px solid var(--theme-border)",
          borderRadius: "28px",
          background: "color-mix(in srgb, var(--card) 92%, var(--theme-soft))",
          boxShadow: "0 22px 60px var(--theme-shadow)",
        }}
      >
        {currentTab === "flashcards" ? (
          <FlashcardStudy flashcards={document.flashcards} />
        ) : null}

        {currentTab === "quiz" ? (
          <QuizStudy questions={document.quiz} />
        ) : null}

        {currentTab === "summary" ? (
          <SummaryStudy documentId={document.id} summary={document.summary_data} />
        ) : null}
      </div>
    </>
  );
}
