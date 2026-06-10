import { StudyWorkspace } from "@/components/study/StudyWorkspace";
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

        <StudyWorkspace document={document} initialTab={tab} />
      </div>
    </section>
  );
}
