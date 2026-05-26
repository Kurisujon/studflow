import { API_BASE_URL } from "@/lib/api";
import type { AIExplanation, Annotation } from "@/types/annotations";

function isAIExplanation(payload: AIExplanation | { detail: string }): payload is AIExplanation {
  return (
    "selectedText" in payload &&
    "simplifiedExplanation" in payload &&
    "example" in payload &&
    "relatedTerms" in payload
  );
}

export async function askAIAboutSelection(
  selectedText: string,
  question: string,
): Promise<AIExplanation> {
  const response = await fetch(`${API_BASE_URL}/api/ai/explain-selection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      highlighted_text: selectedText,
      question,
    }),
  });

  const payload = (await response.json()) as AIExplanation | { detail: string };

  if (!response.ok) {
    throw new Error("detail" in payload ? payload.detail : "AI explanation failed.");
  }

  if (!isAIExplanation(payload)) {
    throw new Error("AI response was missing explanation content.");
  }

  return payload;
}

export async function saveAnnotation(_annotation: Annotation): Promise<void> {
  // TODO: Replace with a real backend endpoint when annotation persistence is implemented server-side.
}

export async function updateAnnotation(_annotation: Annotation): Promise<void> {
  // TODO: Replace with a real backend endpoint when annotation persistence is implemented server-side.
}

export async function deleteAnnotation(_annotationId: string): Promise<void> {
  // TODO: Replace with a real backend endpoint when annotation persistence is implemented server-side.
}
