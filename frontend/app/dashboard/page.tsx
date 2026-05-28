import { DashboardDocumentCard } from "@/components/dashboard-document-card";
import { fetchDocuments } from "@/lib/server-api";

export default async function DashboardPage() {
  const documents = await fetchDocuments();

  return (
    <section
      style={{
        minHeight: "calc(100dvh - var(--nav-height))",
        padding: "2rem 1.5rem 3rem",
        background:
          "radial-gradient(circle at top left, var(--theme-shadow), transparent 24%), linear-gradient(180deg, var(--background), color-mix(in srgb, var(--background) 82%, var(--theme-soft)))",
      }}
    >
      <div className="container">
        <div
          style={{
            marginBottom: "1.75rem",
            maxWidth: "760px",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--theme-primary)",
              marginBottom: "0.75rem",
            }}
          >
            Dashboard
          </p>
          <h1 style={{ marginBottom: "0.75rem" }}>Your study materials, organized.</h1>
          <p>
            Review completed documents, continue active recall, or jump back into the quiz.
          </p>
        </div>

        {documents.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              border: "1px solid var(--theme-border)",
              borderRadius: "24px",
              background: "color-mix(in srgb, var(--card) 92%, var(--theme-soft))",
            }}
          >
            <p>No study documents have been uploaded yet.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {documents.map((document) => (
              <DashboardDocumentCard key={document.id} document={document} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
