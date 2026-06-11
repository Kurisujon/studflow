import Link from "next/link";

const HERO_FEATURES = [
  { icon: "◈", label: "1 Summary" },
  { icon: "⬡", label: "15 Flashcards" },
  { icon: "◇", label: "10-Question Quiz" },
] as const;

function UploadIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      style={{ width: "1.5rem", height: "1.5rem", color: "var(--theme-primary)" }}
    >
      <path
        d="M12 16V5m0 0-4 4m4-4 4 4M5 16.5v1.25A1.25 1.25 0 0 0 6.25 19h11.5A1.25 1.25 0 0 0 19 17.75V16.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <section
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100dvh - var(--nav-height))",
        padding: "4rem 1.5rem",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gap: "2rem",
          alignItems: "center",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <span
            style={{
              display: "inline-block",
              padding: "0.25rem 0.875rem",
              borderRadius: "99px",
              border: "1px solid var(--distill-border)",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--distill-text-muted)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "1.75rem",
            }}
          >
            Powered by Gemini AI
          </span>

          <h1
            style={{
              maxWidth: "720px",
              marginBottom: "1.25rem",
            }}
          >
            Turn any document into an{" "}
            <span style={{ color: "var(--distill-text-muted)" }}>
              active study session.
            </span>
          </h1>

          <p
            style={{
              maxWidth: "560px",
              fontSize: "1.0625rem",
              marginBottom: "2rem",
              color: "var(--distill-text-secondary)",
            }}
          >
            Upload a PDF or DOCX. Studflow generates a concise summary, 15
            flashcards, and a 10-question quiz in a focused study workflow.
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              marginBottom: "2.5rem",
            }}
          >
            <Link href="/upload" className="btn-primary" id="hero-upload-cta">
              Upload a Document
            </Link>
            <Link href="/dashboard" className="btn-ghost" id="hero-dashboard-link">
              View Dashboard
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            {HERO_FEATURES.map(({ icon, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "var(--distill-text-muted)",
                }}
              >
                <span style={{ fontSize: "0.9rem" }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/dashboard/upload"
          aria-label="Go to upload page"
          style={{
            display: "block",
            width: "100%",
            maxWidth: "520px",
            justifySelf: "center",
            padding: "1.5rem",
            borderRadius: "28px",
            border: "1px solid var(--theme-border)",
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--card) 95%, var(--theme-soft)), var(--card))",
            boxShadow: "0 20px 50px var(--theme-shadow)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1rem",
              borderRadius: "20px",
              border: "1px solid color-mix(in srgb, var(--theme-border) 65%, var(--border))",
              backgroundColor: "color-mix(in srgb, var(--card) 90%, var(--theme-soft))",
            }}
          >
            <div
              style={{
                width: "3rem",
                height: "3rem",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                backgroundColor: "var(--theme-soft)",
                border: "1px solid color-mix(in srgb, var(--theme-border) 75%, var(--border))",
              }}
            >
              <UploadIcon />
            </div>

            <div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "0.4rem",
                }}
              >
                Drop your study file here
              </h2>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--distill-text-secondary)",
                }}
              >
                PDF and DOCX supported
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--distill-text-muted)",
                }}
              >
                Start from a clean upload flow without leaving the homepage.
              </span>
              <span
                className="btn-primary"
                style={{
                  minWidth: "132px",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                Choose file
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
