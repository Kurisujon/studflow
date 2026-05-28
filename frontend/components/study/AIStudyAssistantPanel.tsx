"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { getAIHistory } from "@/lib/api/ai-history";
import { askAIAboutSelection } from "@/lib/api/annotations";
import type {
  AIExplanation,
  AIHistoryItem,
  AIToolMode,
  StudyAIContext,
} from "@/types/annotations";
import { useAuth } from "@clerk/nextjs";

export function AIStudyAssistantPanel({
  documentId,
  context,
  initialQuestion,
  mode,
}: {
  documentId: string;
  context: StudyAIContext;
  initialQuestion?: string;
  mode: AIToolMode;
}) {
  const [question, setQuestion] = useState(initialQuestion ?? "");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AIExplanation | null>(null);
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [loadedHistoryItem, setLoadedHistoryItem] = useState<AIHistoryItem | null>(null);
  const questionRef = useRef<HTMLTextAreaElement | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (context.source === "note") {
      questionRef.current?.focus();
    }
  }, [context]);

  useEffect(() => {
    let mounted = true;
    getToken()
      .then((token) => getAIHistory(documentId, token))
      .then((items) => {
        if (mounted) setHistory(items);
      })
      .catch((historyError) => {
        console.error(historyError);
      })
      .finally(() => {
        if (mounted) setHistoryLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [documentId, getToken]);

  const displayedContext = loadedHistoryItem
    ? {
        source: loadedHistoryItem.source,
        selectedText: loadedHistoryItem.sourceText,
        noteContent: loadedHistoryItem.noteContent ?? undefined,
      }
    : context;
  const hasContext = Boolean(context.selectedText || context.noteContent);
  const placeholder =
    context.source === "note"
      ? "Ask something about this note..."
      : "Ask something about this text...";

  async function refreshHistory() {
    const token = await getToken();
    setHistory(await getAIHistory(documentId, token));
  }

  async function submit(customQuestion: string, requestedMode: AIToolMode = mode) {
    if (!hasContext) return;

    const resolvedQuestion = customQuestion || "Explain this clearly and simply for a student.";
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const payload = await askAIAboutSelection(
        documentId,
        context.selectedText,
        resolvedQuestion,
        token,
        {
          noteContent: context.noteContent,
          source: context.source,
          mode: requestedMode,
        },
      );
      setResponse(payload);
      setLoadedHistoryItem(null);
      await refreshHistory();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "AI explanation failed.");
    } finally {
      setLoading(false);
    }
  }

  function loadHistoryItem(item: AIHistoryItem) {
    setQuestion(item.question);
    setLoadedHistoryItem(item);
    setResponse({
      historyId: item.id,
      selectedText: item.sourceText,
      simplifiedExplanation: item.answer,
      beginnerExplanation: item.answer,
      example: "",
      relatedTerms: [],
      suggestedFlashcard: {
        front: item.question,
        back: item.answer,
      },
    });
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div style={{ padding: "1rem", borderRadius: "18px", backgroundColor: "rgba(255,255,255,0.84)", border: "1px solid rgba(251,146,60,0.18)" }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c2410c", marginBottom: "0.45rem" }}>
          {loadedHistoryItem ? "Context from history" : displayedContext.source === "note" ? "Context from note" : "Context"}
        </p>
        {displayedContext.source === "note" ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            <p style={{ color: "#7c2d12", lineHeight: 1.6 }}>
              <strong>Selected text:</strong>{" "}
              {displayedContext.selectedText ? `“${displayedContext.selectedText}”` : "General note"}
            </p>
            <p style={{ color: "#7c2d12", lineHeight: 1.6 }}>
              <strong>Your note:</strong> {displayedContext.noteContent}
            </p>
          </div>
        ) : (
          <p style={{ color: "#7c2d12" }}>
            {displayedContext.selectedText ? `“${displayedContext.selectedText}”` : "Select text in the reader to ask the AI tool."}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
        <Button variant={mode === "ask-ai" ? "default" : "outline"} onClick={() => submit(question || "Explain this clearly and simply for a student.", "ask-ai")} disabled={!hasContext || loading} style={{ minHeight: "42px", paddingInline: "16px", borderRadius: "14px" }}>
          Ask AI
        </Button>
        <Button variant={mode === "simplify" ? "default" : "outline"} onClick={() => submit("Explain this in simpler terms.", "simplify")} disabled={!hasContext || loading} style={{ minHeight: "42px", paddingInline: "16px", borderRadius: "14px" }}>
          Simplify
        </Button>
        <Button variant={mode === "define-term" ? "default" : "outline"} onClick={() => submit("Define this term clearly and explain how it is used in this study topic.", "define-term")} disabled={!hasContext || loading} style={{ minHeight: "42px", paddingInline: "16px", borderRadius: "14px" }}>
          Define Term
        </Button>
      </div>

      <label style={{ display: "grid", gap: "0.45rem" }}>
        <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#9a3412" }}>
          Ask your question
        </span>
        <textarea
          ref={questionRef}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={4}
          placeholder={initialQuestion || placeholder}
          style={{
            width: "100%",
            borderRadius: "16px",
            border: "1px solid rgba(251,146,60,0.18)",
            padding: "0.95rem",
            resize: "vertical",
            backgroundColor: "rgba(255,255,255,0.86)",
          }}
        />
      </label>

      <Button onClick={() => submit(question)} disabled={!hasContext || loading} style={{ minHeight: "42px", paddingInline: "18px", borderRadius: "14px" }}>
        {loading ? "Running AI..." : "Run AI"}
      </Button>

      {error ? <p style={{ color: "#b42318", fontSize: "0.92rem" }}>{error}</p> : null}

      {response ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ padding: "1rem", borderRadius: "18px", backgroundColor: "rgba(255,255,255,0.84)", border: "1px solid rgba(251,146,60,0.18)" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c2410c", marginBottom: "0.45rem" }}>
              {mode === "define-term" ? "Definition and Usage" : mode === "simplify" ? "Simplified Explanation" : "Response"}
            </p>
            <p style={{ color: "#3f2a14", lineHeight: 1.8 }}>
              {response.simplifiedExplanation}
            </p>
          </div>

          {mode === "ask-ai" && response.example ? (
            <div style={{ padding: "1rem", borderRadius: "18px", backgroundColor: "rgba(255,255,255,0.84)", border: "1px solid rgba(251,146,60,0.18)" }}>
              <p style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c2410c", marginBottom: "0.45rem" }}>
                Example
              </p>
              <p style={{ color: "#3f2a14", lineHeight: 1.8 }}>{response.example}</p>
            </div>
          ) : null}

          {mode === "ask-ai" && response.relatedTerms.length > 0 ? (
            <div style={{ padding: "1rem", borderRadius: "18px", backgroundColor: "rgba(255,247,237,0.92)", border: "1px solid rgba(251,191,36,0.18)" }}>
              <p style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c2410c", marginBottom: "0.45rem" }}>
                Related Terms
              </p>
              <ul style={{ display: "grid", gap: "0.55rem", paddingLeft: "1rem" }}>
                {response.relatedTerms.map((term, index) => (
                  <li key={`related-${index}`} style={{ color: "#4a2d1c" }}>
                    {term}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: "0.7rem", paddingTop: "0.8rem", borderTop: "1px solid rgba(249,115,22,0.12)" }}>
        <p style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "#c2410c" }}>
          Recent AI History
        </p>
        {historyLoading ? (
          <p style={{ color: "#7c2d12", fontSize: "0.9rem" }}>Loading history...</p>
        ) : history.length === 0 ? (
          <p style={{ color: "#7c2d12", fontSize: "0.9rem" }}>No AI history yet.</p>
        ) : (
          history.slice(0, 8).map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => loadHistoryItem(item)}
              style={{
                textAlign: "left",
                padding: "0.85rem",
                borderRadius: "16px",
                border: "1px solid rgba(251,146,60,0.16)",
                backgroundColor: "rgba(255,255,255,0.72)",
                cursor: "pointer",
              }}
            >
              <p style={{ color: "#3f2a14", fontWeight: 650, marginBottom: "0.3rem" }}>{item.question}</p>
              <p style={{ color: "#7c2d12", fontSize: "0.86rem", lineHeight: 1.5, marginBottom: "0.35rem" }}>
                {item.answer.slice(0, 120)}{item.answer.length > 120 ? "..." : ""}
              </p>
              <p style={{ color: "#9a3412", fontSize: "0.78rem" }}>
                {item.source === "note" ? "Note" : item.source === "selection" ? "Selection" : "General"} - {new Date(item.createdAt).toLocaleString()}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
