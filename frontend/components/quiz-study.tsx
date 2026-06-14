"use client";

import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { createQuizAttempt, getQuizAttempts } from "@/lib/api/quiz-attempts";
import type { QuizAttemptSummary, StudyQuizQuestion } from "@/lib/types";

export function QuizStudy({
  documentId,
  questions,
}: {
  documentId: string;
  questions: StudyQuizQuestion[];
}) {
  const PASSING_SCORE_RATIO = 0.7;
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showScore, setShowScore] = useState(false);
  const [quizMode, setQuizMode] = useState<"full" | "incorrect-only">("full");
  const [attempts, setAttempts] = useState<QuizAttemptSummary[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState(questions);
  const hasCelebratedRef = useRef(false);
  const persistedAttemptRef = useRef(false);
  const hasQuestions = sessionQuestions.length > 0;
  const question = hasQuestions ? sessionQuestions[activeIndex] : null;
  const selectedIndex = selectedAnswers[activeIndex];
  const answered = selectedIndex !== undefined;
  const isCorrect =
    question !== null && answered && selectedIndex === question.correct_answer_index;
  const score = sessionQuestions.reduce((total, currentQuestion, index) => {
    return total + Number(selectedAnswers[index] === currentQuestion.correct_answer_index);
  }, 0);
  const passingScore = Math.ceil(sessionQuestions.length * PASSING_SCORE_RATIO);
  const passed = score >= passingScore;
  const incorrectQuestions = sessionQuestions.filter(
    (currentQuestion, index) =>
      selectedAnswers[index] !== undefined &&
      selectedAnswers[index] !== currentQuestion.correct_answer_index,
  );
  const currentIncorrectQuestionIds = incorrectQuestions.map((currentQuestion) => currentQuestion.id);

  useEffect(() => {
    setSessionQuestions(questions);
    setActiveIndex(0);
    setSelectedAnswers({});
    setShowScore(false);
    setQuizMode("full");
    persistedAttemptRef.current = false;
  }, [questions]);

  useEffect(() => {
    let mounted = true;

    async function loadAttempts() {
      if (!isLoaded || !isSignedIn) {
        if (mounted) {
          setAttemptsLoading(false);
        }
        return;
      }

      setAttemptsLoading(true);
      try {
        const token = await getToken({ skipCache: true });
        const history = await getQuizAttempts(documentId, token);
        if (mounted) {
          setAttempts(history);
          setAttemptError(null);
        }
      } catch (error) {
        console.error(error);
        if (mounted) {
          setAttemptError("Quiz history could not be loaded.");
        }
      } finally {
        if (mounted) {
          setAttemptsLoading(false);
        }
      }
    }

    void loadAttempts();

    return () => {
      mounted = false;
    };
  }, [documentId, getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!showScore || !passed || hasCelebratedRef.current) {
      return;
    }

    let isMounted = true;

    import("canvas-confetti").then((module) => {
      if (!isMounted) return;

      hasCelebratedRef.current = true;
      const confetti = module.default;

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
      });
    });

    return () => {
      isMounted = false;
    };
  }, [passed, showScore]);

  useEffect(() => {
    function handleQuizShortcuts(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)) ||
        showScore ||
        question === null
      ) {
        return;
      }

      const numericKey = Number.parseInt(event.key, 10);
      if (!Number.isNaN(numericKey) && numericKey >= 1 && numericKey <= 4) {
        const optionIndex = numericKey - 1;
        if (question.options[optionIndex] !== undefined && !answered) {
          event.preventDefault();
          setSelectedAnswers((current) => ({
            ...current,
            [activeIndex]: optionIndex,
          }));
        }
        return;
      }

      if (event.key === "Enter" && answered) {
        event.preventDefault();

        if (activeIndex === sessionQuestions.length - 1) {
          setShowScore(true);
          return;
        }

        setActiveIndex((current) => current + 1);
      }
    }

    window.addEventListener("keydown", handleQuizShortcuts);
    return () => {
      window.removeEventListener("keydown", handleQuizShortcuts);
    };
  }, [activeIndex, answered, question, sessionQuestions.length, showScore]);

  useEffect(() => {
    if (!showScore || persistedAttemptRef.current || !isLoaded || !isSignedIn) {
      return;
    }

    persistedAttemptRef.current = true;

    async function saveAttempt() {
      try {
        const token = await getToken({ skipCache: true });
        const savedAttempt = await createQuizAttempt(
          documentId,
          {
            score,
            totalQuestions: sessionQuestions.length,
            incorrectQuestionIds: currentIncorrectQuestionIds,
          },
          token,
        );
        setAttempts((current) => [savedAttempt, ...current]);
        setAttemptError(null);
      } catch (error) {
        console.error(error);
        setAttemptError("Quiz attempt could not be saved.");
      }
    }

    void saveAttempt();
  }, [
    currentIncorrectQuestionIds,
    documentId,
    getToken,
    isLoaded,
    isSignedIn,
    score,
    sessionQuestions.length,
    showScore,
  ]);

  if (!hasQuestions || question === null) {
    return (
      <div className="study-stage-shell">
        <p className="study-meta-label" style={{ marginBottom: "0.45rem" }}>
          Quiz
        </p>
        <div className="study-empty-state">
          <p className="study-body-copy">No quiz available yet.</p>
        </div>
      </div>
    );
  }

  function handleSelectOption(optionIndex: number) {
    if (answered) {
      return;
    }

    setSelectedAnswers((current) => ({
      ...current,
      [activeIndex]: optionIndex,
    }));
  }

  function handleNext() {
    if (activeIndex === sessionQuestions.length - 1) {
      setShowScore(true);
      return;
    }

    setActiveIndex((current) => current + 1);
  }

  function handleRetake() {
    setActiveIndex(0);
    setSelectedAnswers({});
    setShowScore(false);
    setSessionQuestions(questions);
    setQuizMode("full");
    hasCelebratedRef.current = false;
    persistedAttemptRef.current = false;
  }

  function handleRetryIncorrect() {
    if (currentIncorrectQuestionIds.length === 0) {
      return;
    }

    setSessionQuestions(
      questions.filter((currentQuestion) => currentIncorrectQuestionIds.includes(currentQuestion.id)),
    );
    setQuizMode("incorrect-only");
    setActiveIndex(0);
    setSelectedAnswers({});
    setShowScore(false);
    hasCelebratedRef.current = false;
    persistedAttemptRef.current = false;
  }

  function handleRetryFromAttempt(attempt: QuizAttemptSummary) {
    if (attempt.incorrectQuestionIds.length === 0) {
      return;
    }

    setSessionQuestions(
      questions.filter((currentQuestion) => attempt.incorrectQuestionIds.includes(currentQuestion.id)),
    );
    setQuizMode("incorrect-only");
    setActiveIndex(0);
    setSelectedAnswers({});
    setShowScore(false);
    hasCelebratedRef.current = false;
    persistedAttemptRef.current = false;
  }

  if (showScore) {
    return (
      <motion.section
        className="study-stage-shell"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          background:
            passed
              ? "linear-gradient(180deg, color-mix(in srgb, var(--card) 98%, white), color-mix(in srgb, var(--card) 90%, var(--theme-soft)))"
              : "linear-gradient(180deg, color-mix(in srgb, var(--card) 98%, white), color-mix(in srgb, var(--muted) 70%, var(--card)))",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <p className="study-meta-label" style={{ marginBottom: "0.75rem", position: "relative" }}>
          {quizMode === "incorrect-only" ? "Weak Topic Review" : passed ? "Quiz Complete" : "Try Again"}
        </p>
        {passed ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              marginBottom: "0.9rem",
              padding: "0.45rem 0.75rem",
              borderRadius: "999px",
              backgroundColor: "rgba(22,163,74,0.10)",
              border: "1px solid rgba(22,163,74,0.18)",
              color: "#166534",
              position: "relative",
            }}
          >
            <CheckCircle2 size={16} />
            <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>Passed</span>
          </div>
        ) : null}
        <h2 style={{ marginBottom: "0.75rem", position: "relative", maxWidth: "18ch" }}>
          Final score: {score} / {sessionQuestions.length}
        </h2>
        <p className="study-body-copy" style={{ marginBottom: "0.45rem", position: "relative" }}>
          Passing score: {passingScore} / {sessionQuestions.length}
        </p>
        <p className="study-body-copy" style={{ marginBottom: "1.5rem", position: "relative", maxWidth: "58ch" }}>
          {quizMode === "incorrect-only"
            ? "You reviewed only the missed questions from the previous attempt."
            : passed
            ? "You passed. Review the material again or continue with another study session."
            : "You did not reach the passing score yet. Review the quiz again or return to the dashboard for more practice."}
        </p>
        {incorrectQuestions.length > 0 ? (
          <div className="study-support-surface" style={{ marginBottom: "1rem", padding: "1rem" }}>
            <p className="study-meta-label" style={{ marginBottom: "0.45rem" }}>
              Weak Topic Review
            </p>
            <p className="study-body-copy" style={{ marginBottom: "0.65rem" }}>
              Missed questions in this attempt: {incorrectQuestions.length}
            </p>
            <ul style={{ display: "grid", gap: "0.55rem", paddingLeft: "1rem" }}>
              {incorrectQuestions.map((incorrectQuestion) => (
                <li key={incorrectQuestion.id} className="study-body-copy">
                  {incorrectQuestion.question}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {incorrectQuestions.length > 0 ? (
            <Button
              variant="outline"
              onClick={handleRetryIncorrect}
              className="study-utility-pill"
            >
              Retry Incorrect Only
            </Button>
          ) : null}
          <Button
            onClick={handleRetake}
            className="study-utility-pill"
            style={{
              color: "var(--theme-on-primary)",
            }}
          >
            {passed ? "Retake Quiz" : "Try Again"}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="study-utility-pill"
          >
            Return to Dashboard
          </Button>
        </div>
        <div style={{ marginTop: "1rem", display: "grid", gap: "0.7rem" }}>
          <p className="study-meta-label">
            Recent Attempts {attempts.length > 0 ? `(${attempts.length})` : ""}
          </p>
          {attemptError ? (
            <p style={{ color: "#b42318", fontSize: "0.9rem" }}>{attemptError}</p>
          ) : null}
          {attemptsLoading ? (
            <p className="study-body-copy">Loading attempt history...</p>
          ) : attempts.length === 0 ? (
            <div className="study-empty-state">
              <p className="study-body-copy">No previous quiz attempts yet.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.7rem" }}>
              {attempts.slice(0, 5).map((attempt) => (
                <div
                  key={attempt.id}
                  className="study-interactive-card"
                  style={{
                    padding: "0.9rem 1rem",
                    borderRadius: "16px",
                    border: "1px solid var(--theme-border)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <p className="study-body-copy" style={{ color: "var(--foreground)", fontWeight: 600 }}>
                    {attempt.score} / {attempt.totalQuestions}
                  </p>
                  <p className="study-body-copy" style={{ fontSize: "0.88rem" }}>
                    Missed {attempt.incorrectQuestionIds.length} question{attempt.incorrectQuestionIds.length === 1 ? "" : "s"}
                  </p>
                  <p className="study-body-copy" style={{ fontSize: "0.82rem" }}>
                    {new Date(attempt.createdAt).toLocaleString()}
                  </p>
                  {attempt.incorrectQuestionIds.length > 0 ? (
                    <div style={{ marginTop: "0.7rem" }}>
                      <Button
                        variant="outline"
                        className="study-utility-pill"
                        onClick={() => handleRetryFromAttempt(attempt)}
                      >
                        Retry Missed
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    );
  }

  return (
    <section className="study-stage-shell" style={{ color: "var(--foreground)" }}>
      <p className="study-meta-label" style={{ marginBottom: "0.75rem" }}>
        {quizMode === "incorrect-only" ? "Retry Incorrect Only" : "Quiz"}: Question {activeIndex + 1} of {sessionQuestions.length}
      </p>
      <p className="study-body-copy" style={{ fontSize: "0.88rem", marginBottom: "0.9rem" }}>
        Shortcuts: 1-4 choose an answer. Enter moves to the next question after you answer.
      </p>

      <h2 style={{ marginBottom: "1.25rem", lineHeight: 1.28, maxWidth: "22ch" }}>
        {question.question}
      </h2>

      <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {question.options.map((option, optionIndex) => {
          const selected = selectedIndex === optionIndex;
          const optionIsCorrect = question.correct_answer_index === optionIndex;

          let backgroundColor = "var(--card)";
          let borderColor = "var(--distill-border)";
          let textColor = "var(--distill-text-primary)";

          if (answered && optionIsCorrect) {
            backgroundColor = "rgba(22, 163, 74, 0.12)";
            borderColor = "rgba(22, 163, 74, 0.35)";
          } else if (answered && selected && !optionIsCorrect) {
            backgroundColor = "rgba(220, 38, 38, 0.10)";
            borderColor = "rgba(220, 38, 38, 0.28)";
          } else if (selected) {
            backgroundColor = "var(--theme-soft)";
            borderColor = "var(--theme-border)";
            textColor = "var(--distill-text-primary)";
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelectOption(optionIndex)}
              aria-keyshortcuts={`${optionIndex + 1}`}
              className="study-interactive-card"
              style={{
                textAlign: "left",
                width: "100%",
                padding: "1rem 1.05rem",
                borderRadius: "18px",
                border: `1px solid ${borderColor}`,
                backgroundColor,
                color: textColor,
                cursor: answered ? "default" : "pointer",
                lineHeight: 1.6,
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && !isCorrect ? (
        <div
          style={{
            marginBottom: "1.25rem",
            padding: "1rem",
            borderRadius: "18px",
            border: "1px solid var(--distill-border)",
            backgroundColor: "var(--muted)",
          }}
        >
          <p className="study-meta-label" style={{ marginBottom: "0.45rem" }}>
            Explanation
          </p>
          <p className="study-body-copy">{question.explanation}</p>
        </div>
      ) : null}

      <Button
        onClick={handleNext}
        disabled={!answered}
        className="study-utility-pill"
        style={{
          minWidth: activeIndex === sessionQuestions.length - 1 ? "126px" : "146px",
          whiteSpace: "nowrap",
          color: "var(--theme-on-primary)",
        }}
      >
        {activeIndex === sessionQuestions.length - 1 ? "Show Score" : "Next Question"}
      </Button>
    </section>
  );
}
