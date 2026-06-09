export type AnnotationType = "highlight" | "underline" | "note";
export type ActiveStudyTool = "select" | "highlight" | "underline" | "erase";

export type AnnotationColor =
  | "blue"
  | "yellow"
  | "green"
  | "pink"
  | "purple";
export type UnderlineColor = AnnotationColor | "neutral";

export type Annotation = {
  id: string;
  documentId: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  blockId: string;
  type: AnnotationType;
  color?: AnnotationColor;
  underlineColor?: UnderlineColor;
  noteContent?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudyAnnotation = Annotation;

export type TextSelectionPayload = {
  blockId: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  rect: DOMRect;
};

export type AIExplanation = {
  historyId?: string | null;
  selectedText: string;
  simplifiedExplanation: string;
  beginnerExplanation: string;
  example: string;
  relatedTerms: string[];
  suggestedFlashcard: {
    front: string;
    back: string;
  };
};

export type StudyBubbleTab = "notes" | "ai";
export type AIToolMode = "ask-ai" | "simplify" | "define-term";

export type SelectionState = {
  blockId: string;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  x: number;
  y: number;
};

export type StudyNote = {
  id: string;
  annotationId?: string;
  documentId: string;
  topicIndex?: number;
  blockId?: string;
  startOffset?: number;
  endOffset?: number;
  selectedText?: string;
  content: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AIContextSource =
  | "selection"
  | "highlight"
  | "underline"
  | "note"
  | "general";

export type StudyAIContext = {
  source: AIContextSource;
  selectedText: string;
  noteContent?: string;
};

export type AIHistoryItem = {
  id: string;
  documentId: string;
  source: AIContextSource;
  sourceText?: string | null;
  noteContent?: string | null;
  question?: string | null;
  mode: AIToolMode;
  answer: string;
  createdAt: string;
  updatedAt: string;
};
