import Link from "next/link";
import {
  CircleHelp,
  FileText,
  Layers,
  PlayCircle,
  Sparkles,
  StickyNote,
} from "lucide-react";

const HERO_FEATURES = [
  { icon: "◈", label: "1 Summary" },
  { icon: "⬡", label: "15 Flashcards" },
  { icon: "◇", label: "10-Question Quiz" },
] as const;

const SUPPORTED_FORMATS = ["PDF", "DOCX"] as const;
const UPCOMING_FORMATS = ["PPT soon", "TXT soon"] as const;
const FEATURE_CARDS = [
  {
    title: "Concise Summary",
    description:
      "Get the main ideas without reading the whole document line by line.",
    icon: FileText,
  },
  {
    title: "Flashcards",
    description: "Review key concepts with quick active-recall cards.",
    icon: Layers,
  },
  {
    title: "Quiz",
    description:
      "Test understanding with generated questions and instant scoring.",
    icon: CircleHelp,
  },
  {
    title: "Smart Notes",
    description:
      "Highlight phrases, add notes, and return to important parts later.",
    icon: StickyNote,
  },
  {
    title: "Ask AI",
    description:
      "Ask about confusing terms, selected text, or saved notes.",
    icon: Sparkles,
  },
  {
    title: "Related Videos",
    description:
      "Watch related learning videos without leaving the study page.",
    icon: PlayCircle,
  },
] as const;
const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Upload your file",
    description: "Add a PDF or DOCX from your study materials.",
  },
  {
    step: "02",
    title: "Let AI process it",
    description:
      "Studflow extracts the content and generates structured study materials.",
  },
  {
    step: "03",
    title: "Review actively",
    description:
      "Study with summaries, flashcards, quizzes, notes, AI help, and related videos.",
  },
] as const;
const FAQ_ITEMS = [
  {
    question: "What file types does Studflow support?",
    answer: "Studflow currently supports PDF and DOCX files.",
  },
  {
    question: "Does Studflow replace studying?",
    answer:
      "No. It helps you review faster, but you still need to understand and practice the material.",
  },
  {
    question: "Can I ask AI about my document?",
    answer:
      "Yes. You can ask AI about selected text, notes, or confusing terms.",
  },
  {
    question: "Can I watch related videos inside Studflow?",
    answer:
      "Yes. Related videos can be watched inside the study page using the embedded mini player.",
  },
  {
    question: "Are my notes saved?",
    answer:
      "Notes, highlights, and underlines are saved per document when you are logged in.",
  },
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

function WorkspacePreviewMock() {
  return (
    <div
      style={{
        padding: "1.25rem",
        borderRadius: "32px",
        border: "1px solid color-mix(in srgb, var(--theme-border) 65%, var(--border))",
        background:
          "radial-gradient(circle at top right, color-mix(in srgb, var(--theme-soft) 82%, transparent), transparent 34%), linear-gradient(180deg, color-mix(in srgb, var(--card) 95%, var(--theme-soft)), var(--card))",
        boxShadow: "0 22px 56px color-mix(in srgb, var(--theme-shadow) 80%, transparent)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        <div
          style={{
            padding: "1.2rem",
            borderRadius: "24px",
            border: "1px solid color-mix(in srgb, var(--theme-border) 60%, var(--border))",
            backgroundColor: "color-mix(in srgb, var(--card) 96%, var(--theme-soft))",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--theme-primary)",
                  marginBottom: "0.3rem",
                }}
              >
                Summary
              </p>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "var(--distill-text-muted)",
                }}
              >
                Biology review notes
              </p>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.45rem 0.7rem",
                borderRadius: "999px",
                border: "1px solid color-mix(in srgb, var(--theme-border) 75%, var(--border))",
                backgroundColor: "color-mix(in srgb, var(--theme-soft) 88%, var(--card))",
                color: "var(--theme-primary)",
                fontSize: "0.78rem",
                fontWeight: 500,
              }}
            >
              <FileText size={14} strokeWidth={1.8} />
              Key ideas
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "0.8rem",
            }}
          >
            <div
              style={{
                padding: "0.95rem",
                borderRadius: "18px",
                backgroundColor: "var(--card)",
                border: "1px solid color-mix(in srgb, var(--theme-border) 55%, var(--border))",
              }}
            >
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--distill-text-primary)",
                }}
              >
                Photosynthesis converts light energy into chemical energy stored
                in glucose.
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                borderRadius: "18px",
                backgroundColor: "color-mix(in srgb, var(--card) 96%, var(--theme-soft))",
                border: "1px solid color-mix(in srgb, var(--theme-border) 55%, var(--border))",
              }}
            >
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "var(--distill-text-secondary)",
                }}
              >
                Chlorophyll helps plants absorb light, and the{" "}
                <span
                  style={{
                    padding: "0.08rem 0.28rem",
                    borderRadius: "0.45rem",
                    backgroundColor: "color-mix(in srgb, var(--theme-soft) 88%, var(--card))",
                    color: "var(--distill-text-primary)",
                    boxShadow: "inset 0 -0.45rem 0 color-mix(in srgb, var(--theme-border) 55%, transparent)",
                  }}
                >
                  light-dependent reactions
                </span>{" "}
                start the energy transfer process.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  marginTop: "0.8rem",
                }}
              >
                <span
                  style={{
                    width: "0.55rem",
                    height: "0.55rem",
                    borderRadius: "999px",
                    backgroundColor: "var(--theme-primary)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--distill-text-muted)",
                  }}
                >
                  Note marker saved on this phrase
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.65rem",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.55rem 0.8rem",
                  borderRadius: "16px",
                  border: "1px solid color-mix(in srgb, var(--theme-border) 65%, var(--border))",
                  backgroundColor: "var(--card)",
                  color: "var(--distill-text-primary)",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                }}
              >
                <Layers size={14} strokeWidth={1.8} />
                15 flashcards
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.55rem 0.8rem",
                  borderRadius: "16px",
                  border: "1px solid color-mix(in srgb, var(--theme-border) 65%, var(--border))",
                  backgroundColor: "var(--card)",
                  color: "var(--distill-text-primary)",
                  fontSize: "0.82rem",
                  fontWeight: 500,
                }}
              >
                <CircleHelp size={14} strokeWidth={1.8} />
                10-question quiz
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderRadius: "22px",
              border: "1px solid color-mix(in srgb, var(--theme-border) 60%, var(--border))",
              backgroundColor: "color-mix(in srgb, var(--card) 97%, var(--theme-soft))",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  color: "var(--theme-primary)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                <Sparkles size={15} strokeWidth={1.8} />
                Ask AI
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--distill-text-muted)",
                }}
              >
                Mock preview
              </span>
            </div>

            <div
              style={{
                maxWidth: "260px",
                marginLeft: "auto",
                padding: "0.8rem 0.9rem",
                borderRadius: "18px 18px 8px 18px",
                backgroundColor: "color-mix(in srgb, var(--theme-soft) 90%, var(--card))",
                border: "1px solid color-mix(in srgb, var(--theme-border) 70%, var(--border))",
                color: "var(--distill-text-primary)",
                fontSize: "0.88rem",
                marginBottom: "0.65rem",
              }}
            >
              What do light-dependent reactions do first?
            </div>

            <div
              style={{
                maxWidth: "280px",
                padding: "0.85rem 0.95rem",
                borderRadius: "18px 18px 18px 8px",
                backgroundColor: "var(--card)",
                border: "1px solid color-mix(in srgb, var(--theme-border) 55%, var(--border))",
                color: "var(--distill-text-secondary)",
                fontSize: "0.88rem",
              }}
            >
              They capture light energy and begin converting it into usable
              chemical energy for the plant.
            </div>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "22px",
              border: "1px solid color-mix(in srgb, var(--theme-border) 60%, var(--border))",
              backgroundColor: "color-mix(in srgb, var(--card) 97%, var(--theme-soft))",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.7rem",
                marginBottom: "0.9rem",
              }}
            >
              <div
                style={{
                  width: "2.25rem",
                  height: "2.25rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  backgroundColor: "color-mix(in srgb, var(--theme-soft) 88%, var(--card))",
                  border: "1px solid color-mix(in srgb, var(--theme-border) 75%, var(--border))",
                  color: "var(--theme-primary)",
                  flexShrink: 0,
                }}
              >
                <StickyNote size={15} strokeWidth={1.8} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: "var(--distill-text-primary)",
                    marginBottom: "0.2rem",
                  }}
                >
                  Note saved
                </p>
                <p
                  style={{
                    fontSize: "0.84rem",
                    color: "var(--distill-text-secondary)",
                  }}
                >
                  Compare chlorophyll’s role with the Calvin cycle before the
                  next quiz attempt.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: "0.95rem",
                borderRadius: "18px",
                border: "1px solid color-mix(in srgb, var(--theme-border) 60%, var(--border))",
                backgroundColor: "var(--card)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  marginBottom: "0.7rem",
                }}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "2rem",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--theme-primary) 18%, var(--theme-soft)), color-mix(in srgb, var(--theme-border) 70%, var(--card)))",
                    border: "1px solid color-mix(in srgb, var(--theme-border) 60%, var(--border))",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--theme-primary)",
                    flexShrink: 0,
                  }}
                >
                  <PlayCircle size={15} strokeWidth={1.8} />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      color: "var(--distill-text-primary)",
                    }}
                  >
                    Related video
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--distill-text-muted)",
                    }}
                  >
                    Photosynthesis in 8 minutes
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--distill-text-secondary)",
                }}
              >
                Watch without leaving the study page when you need a quicker
                explanation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <div
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.9rem",
            paddingTop: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              flexWrap: "wrap",
            }}
          >
            {SUPPORTED_FORMATS.map((label) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "999px",
                  border: "1px solid color-mix(in srgb, var(--theme-border) 70%, var(--border))",
                  backgroundColor: "color-mix(in srgb, var(--card) 90%, var(--theme-soft))",
                  color: "var(--distill-text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                {label}
              </span>
            ))}
            {UPCOMING_FORMATS.map((label) => (
              <span
                key={label}
                aria-disabled="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "999px",
                  border: "1px dashed var(--distill-border)",
                  backgroundColor: "color-mix(in srgb, var(--background) 92%, var(--card))",
                  color: "var(--distill-text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <p
            style={{
              fontSize: "0.92rem",
              color: "var(--distill-text-secondary)",
            }}
          >
            Supports PDF and DOCX. More formats coming soon.
          </p>
        </div>

        <section
          aria-labelledby="homepage-features-title"
          style={{
            paddingTop: "1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "640px",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--theme-primary)",
                marginBottom: "0.65rem",
              }}
            >
              Study Outputs
            </p>
            <h2
              id="homepage-features-title"
              style={{
                marginBottom: "0.65rem",
              }}
            >
              What Studflow generates
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--distill-text-secondary)",
              }}
            >
              Everything is designed to help students understand faster, review
              better, and keep studying in one calm workspace.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {FEATURE_CARDS.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="homepage-feature-card"
                style={{
                  padding: "1.3rem",
                  borderRadius: "24px",
                  border: "1px solid color-mix(in srgb, var(--theme-border) 65%, var(--border))",
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--card) 95%, var(--theme-soft)), var(--card))",
                  boxShadow: "0 12px 34px color-mix(in srgb, var(--theme-shadow) 75%, transparent)",
                  transition:
                    "transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)",
                }}
              >
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "16px",
                    marginBottom: "1rem",
                    border: "1px solid color-mix(in srgb, var(--theme-border) 75%, var(--border))",
                    backgroundColor: "color-mix(in srgb, var(--card) 82%, var(--theme-soft))",
                    color: "var(--theme-primary)",
                  }}
                >
                  <Icon size={18} strokeWidth={1.8} />
                </div>

                <h3
                  style={{
                    fontSize: "1.05rem",
                    marginBottom: "0.5rem",
                    color: "var(--distill-text-primary)",
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--distill-text-secondary)",
                  }}
                >
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="homepage-how-it-works-title"
          style={{
            paddingTop: "1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "640px",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--theme-primary)",
                marginBottom: "0.65rem",
              }}
            >
              Workflow
            </p>
            <h2
              id="homepage-how-it-works-title"
              style={{
                marginBottom: "0.65rem",
              }}
            >
              How Studflow works
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--distill-text-secondary)",
              }}
            >
              The flow stays simple from upload to review, so first-time users
              know exactly what happens next.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {HOW_IT_WORKS_STEPS.map(({ step, title, description }) => (
              <article
                key={step}
                style={{
                  padding: "1.35rem",
                  borderRadius: "24px",
                  border: "1px solid color-mix(in srgb, var(--theme-border) 65%, var(--border))",
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--card) 95%, var(--theme-soft)), var(--card))",
                  boxShadow: "0 12px 30px color-mix(in srgb, var(--theme-shadow) 70%, transparent)",
                }}
              >
                <div
                  style={{
                    width: "2.8rem",
                    height: "2.8rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "999px",
                    marginBottom: "1rem",
                    border: "1px solid color-mix(in srgb, var(--theme-border) 80%, var(--border))",
                    backgroundColor: "color-mix(in srgb, var(--theme-soft) 88%, var(--card))",
                    color: "var(--theme-primary)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  {step}
                </div>

                <h3
                  style={{
                    fontSize: "1.05rem",
                    marginBottom: "0.55rem",
                    color: "var(--distill-text-primary)",
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--distill-text-secondary)",
                  }}
                >
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="homepage-workspace-preview-title"
          style={{
            paddingTop: "1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "720px",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--theme-primary)",
                marginBottom: "0.65rem",
              }}
            >
              Study Workspace
            </p>
            <h2
              id="homepage-workspace-preview-title"
              style={{
                marginBottom: "0.65rem",
              }}
            >
              Study with context, not clutter.
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--distill-text-secondary)",
              }}
            >
              Read, highlight, take notes, ask AI, and watch related videos in
              one focused workspace.
            </p>
          </div>

          <WorkspacePreviewMock />
        </section>

        <section
          aria-labelledby="homepage-faq-title"
          style={{
            paddingTop: "1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: "720px",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--theme-primary)",
                marginBottom: "0.65rem",
              }}
            >
              FAQ
            </p>
            <h2
              id="homepage-faq-title"
              style={{
                marginBottom: "0.65rem",
              }}
            >
              Common questions before you upload
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--distill-text-secondary)",
              }}
            >
              Short answers to the questions students usually ask before they
              start using Studflow.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1rem",
            }}
          >
            {FAQ_ITEMS.map(({ question, answer }) => (
              <article
                key={question}
                style={{
                  padding: "1.3rem",
                  borderRadius: "24px",
                  border: "1px solid color-mix(in srgb, var(--theme-border) 65%, var(--border))",
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--card) 95%, var(--theme-soft)), var(--card))",
                  boxShadow: "0 12px 30px color-mix(in srgb, var(--theme-shadow) 70%, transparent)",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    marginBottom: "0.8rem",
                    color: "var(--theme-primary)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  <CircleHelp size={15} strokeWidth={1.8} />
                  FAQ
                </div>

                <h3
                  style={{
                    fontSize: "1rem",
                    marginBottom: "0.55rem",
                    color: "var(--distill-text-primary)",
                  }}
                >
                  {question}
                </h3>

                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--distill-text-secondary)",
                  }}
                >
                  {answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="homepage-final-cta-title"
          style={{
            paddingTop: "1.5rem",
          }}
        >
          <div
            style={{
              padding: "2rem 1.5rem",
              borderRadius: "32px",
              border: "1px solid color-mix(in srgb, var(--theme-border) 65%, var(--border))",
              background:
                "radial-gradient(circle at top, color-mix(in srgb, var(--theme-soft) 78%, transparent), transparent 48%), linear-gradient(180deg, color-mix(in srgb, var(--card) 95%, var(--theme-soft)), var(--card))",
              boxShadow: "0 18px 44px color-mix(in srgb, var(--theme-shadow) 75%, transparent)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              <p
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--theme-primary)",
                  marginBottom: "0.65rem",
                }}
              >
                Start Here
              </p>
              <h2
                id="homepage-final-cta-title"
                style={{
                  marginBottom: "0.75rem",
                }}
              >
                Ready to turn your notes into a study session?
              </h2>
              <p
                style={{
                  maxWidth: "620px",
                  margin: "0 auto 1.5rem",
                  fontSize: "1rem",
                  color: "var(--distill-text-secondary)",
                }}
              >
                Upload a document and let Studflow prepare your summary,
                flashcards, quiz, notes, and learning videos.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <Link href="/dashboard/upload" className="btn-primary">
                  Start Studying
                </Link>
                <Link href="/dashboard" className="btn-ghost">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
