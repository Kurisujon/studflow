import Link from "next/link";

import { FlashcardStudy } from "@/components/flashcard-study";
import { QuizStudy } from "@/components/quiz-study";
import { SummaryStudy } from "@/components/summary-study";
import { Button } from "@/components/ui/button";
import { fetchStudyDocument } from "@/lib/server-api";

type StudyPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function StudyPage({
  params,
  searchParams,
}: StudyPageProps) {
  const { id } = await params;
  const { tab = "summary" } = await searchParams;
  const document = await fetchStudyDocument(id);

  return (
    <section
      style={{
        minHeight: "calc(100dvh - var(--nav-height))",
        padding: "2rem 1.5rem 3rem",
        background:
          "radial-gradient(circle at top left, var(--theme-shadow), transparent 24%), radial-gradient(circle at top right, color-mix(in srgb, var(--theme-primary) 10%, transparent), transparent 20%), linear-gradient(180deg, var(--background), var(--theme-soft))",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--theme-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Study View
            </p>
            <h1 style={{ marginBottom: "0.35rem" }}>{document.filename}</h1>
            <p style={{ color: "var(--muted-foreground)" }}>Status: {document.status}</p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          {[
            { key: "summary", label: "Summary" },
            { key: "flashcards", label: "Flashcards" },
            { key: "quiz", label: "Quiz" },
          ].map((item) => (
            <Button
              key={item.key}
              nativeButton={false}
              render={<Link href={`/dashboard/study/${id}?tab=${item.key}`} />}
              variant={tab === item.key ? "default" : "outline"}
              size="lg"
              style={{
                minHeight: "42px",
                paddingInline: "18px",
                borderRadius: "999px",
                color: tab === item.key ? "var(--theme-on-primary)" : "var(--foreground)",
                backgroundColor: tab === item.key ? "var(--theme-primary)" : "var(--card)",
                border: tab === item.key ? "1px solid var(--theme-primary)" : "1px solid var(--border)",
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
          {tab === "flashcards" ? (
            <FlashcardStudy flashcards={document.flashcards} />
          ) : null}

          {tab === "quiz" ? (
            <QuizStudy questions={document.quiz} />
          ) : null}

          {tab !== "flashcards" && tab !== "quiz" ? (
            <SummaryStudy documentId={document.id} summary={document.summary_data} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
