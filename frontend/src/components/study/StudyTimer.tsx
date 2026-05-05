import { Button } from "@cloudflare/kumo/components/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useDashboard } from "../../hooks/api/useDashboard";
import { useCompleteSession } from "../../hooks/api/useSessions";
import { cn } from "../../utils/cn";
import { daysBetween } from "../../utils/date";
import { SUBJECTS, SUBJECT_BG } from "../../utils/subjects";

import type { SubjectKey } from "../../types";

type Phase = "timer" | "evaluation" | "saved";

type Props = {
  sessionId: string;
  onExit: () => void;
};

function formatTimer(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatPlanned(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `~${h}h ${m}min` : `~${h}h`;
  }
  return `~${minutes}min`;
}

function toSubjectKey(key: string | null): SubjectKey | null {
  if (key === null) return null;
  if (key in SUBJECT_BG) return key as SubjectKey;
  return null;
}

function findExamForSubject(
  upcomingExams: Array<{
    name: string;
    examDate: string;
    subjectKey: string | null;
  }>,
  today: string,
  subjectKey: string | null,
): {
  name: string;
  days: number;
} | null {
  if (subjectKey === null) return null;

  const exam = upcomingExams.find((item) => item.subjectKey === subjectKey);
  if (!exam) return null;
  return {
    name: exam.name,
    days: daysBetween(today, exam.examDate),
  };
}

const SCORE_LABELS = ["słabo", "", "", "", "świetnie"] as const;

export function StudyTimer({ sessionId, onExit }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: dashboard, isLoading } = useDashboard();
  const {
    mutate: completeSession,
    isPending: isSaving,
    error: saveError,
  } = useCompleteSession();
  const session =
    dashboard?.today.find((item) => item.id === sessionId) ?? null;
  const startedAtRef = useRef(0);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>("timer");
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [score, setScore] = useState<number | null>(null);
  const [scope, setScope] = useState<"yes" | "no" | "partially" | null>(null);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actualMinutes = Math.max(1, Math.round(elapsed / 60));

  useEffect(() => {
    if (phase !== "timer") return;
    startedAtRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleFinish = useCallback(() => {
    setPhase("evaluation");
  }, []);

  const handleSave = useCallback(() => {
    if (!session || isSaving) return;

    completeSession(
      {
        id: session.id,
        body: {
          actualMinutes,
          evaluationScore: score ?? undefined,
          completedScope: scope ?? undefined,
          difficultyNotes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setPhase("saved");
          saveTimeoutRef.current = setTimeout(() => onExit(), 1500);
        },
      },
    );
  }, [
    actualMinutes,
    completeSession,
    isSaving,
    notes,
    onExit,
    score,
    scope,
    session,
  ]);

  const handleExitRequest = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const handleExitConfirm = useCallback(() => {
    onExit();
  }, [onExit]);

  const handleExitCancel = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-kumo-base">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rule border-t-amber" />
          <p className="mono text-[13px] uppercase text-ink-muted">
            Ładowanie sesji
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const subjectKey = toSubjectKey(session.subjectKey);
  const subject = subjectKey ? SUBJECTS[subjectKey] : null;
  const exam = findExamForSubject(
    dashboard?.upcomingExams ?? [],
    today,
    session.subjectKey,
  );
  const canSave = score !== null || scope !== null;

  return (
    <div className="fixed inset-0 bg-kumo-base z-50 flex flex-col">
      {phase === "timer" && (
        <>
          <div className="flex items-center px-5 py-4">
            <Button
              variant="ghost"
              icon={ArrowLeftIcon}
              onClick={handleExitRequest}
              className="text-ink-muted hover:text-amber mono text-[14px] uppercase"
            >
              Wróć
            </Button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 pb-8">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "w-3 h-3 rounded-full shrink-0",
                  subjectKey ? SUBJECT_BG[subjectKey] : "bg-rule-strong",
                )}
              />
              <span className="mono text-[14px] uppercase text-ink-muted">
                {subject?.name ?? session.subjectName ?? "Sesja nauki"}
              </span>
            </div>

            <h1 className="display italic text-[clamp(32px,7vw,56px)] font-medium leading-[1.05] text-ink text-center max-w-[18ch]">
              {session.topicName ?? "Sesja nauki"}
            </h1>

            <div className="flex flex-col items-center gap-1">
              <span className="mono text-[clamp(72px,14vw,120px)] leading-none text-ink tabular-nums font-light">
                {formatTimer(elapsed)}
              </span>
              <span className="mono text-[14px] text-ink-faint">
                z {formatPlanned(session.plannedMinutes)}
              </span>
            </div>

            {exam && (
              <p className="mono text-[13px] text-ink-muted">
                {exam.name} za {exam.days} {exam.days === 1 ? "dzień" : "dni"}
              </p>
            )}

            <Button
              size="lg"
              variant="ghost"
              onClick={handleFinish}
              className="mt-4 bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] hover:-translate-y-px active:translate-y-0 transition-all font-semibold px-8 py-4"
            >
              Zakończ sesję
            </Button>
          </div>
        </>
      )}

      {phase === "evaluation" && (
        <>
          <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
            <span className="mono text-[14px] uppercase text-ink-muted">
              {formatTimer(elapsed)}
            </span>
            <span className="display italic text-[18px] text-ink text-center truncate max-w-[60%]">
              {session.topicName ?? "Sesja nauki"}
            </span>
            <span className="w-14" />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center gap-8 px-6 py-10 max-w-[440px] mx-auto">
              <div>
                <h2 className="display font-normal text-[28px] text-ink text-center mb-6">
                  Jak Ci poszło?
                </h2>
                <div className="flex items-center justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScore(n)}
                      className={cn(
                        "w-[52px] h-[52px] rounded-full border-2 flex items-center justify-center transition-all duration-200",
                        "mono text-[22px]",
                        score === n
                          ? "border-amber bg-amber text-paper"
                          : "border-rule text-ink-muted hover:border-rule-strong hover:text-ink",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mono text-[12px] uppercase text-ink-faint text-center mt-2.5">
                  {score ? SCORE_LABELS[score - 1] : "wybierz ocenę"}
                </p>
              </div>

              <div className="w-full">
                <h2 className="display font-normal text-[28px] text-ink text-center mb-4">
                  Skończyłeś zakres?
                </h2>
                <div className="flex justify-center gap-2.5">
                  {(
                    [
                      ["Tak", "yes"],
                      ["Nie", "no"],
                      ["Częściowo", "partially"],
                    ] as const
                  ).map(([label, value]) => (
                    <Button
                      key={value}
                      type="button"
                      variant="ghost"
                      onClick={() => setScope(value)}
                      className={cn(
                        "px-5 py-2.5 border rounded-sm mono text-[14px] uppercase transition-all duration-200",
                        scope === value
                          ? "border-amber bg-amber/10 text-amber"
                          : "border-rule text-ink-muted hover:border-rule-strong",
                      )}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setNotesExpanded(!notesExpanded)}
                  className={cn(
                    "mono text-[13px] uppercase transition-colors duration-200 w-full text-left",
                    notesExpanded
                      ? "text-amber"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {notesExpanded ? "−" : "+"} dodaj uwagę (opcjonalne)
                </button>
                {notesExpanded && (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Co było szczególnie trudne?"
                    maxLength={500}
                    rows={3}
                    className="mt-2 w-full bg-paper-3 border border-rule rounded-sm px-4 py-3 text-ink text-[15px] resize-none placeholder:text-ink-faint focus:outline-none focus:border-amber transition-colors duration-200"
                  />
                )}
              </div>

              <Button
                size="lg"
                variant="ghost"
                onClick={handleSave}
                className={cn(
                  "bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] hover:-translate-y-px active:translate-y-0 transition-all font-semibold px-8 py-4 mt-2",
                  !canSave && "opacity-40 pointer-events-none",
                )}
              >
                {isSaving ? "Zapisywanie..." : "Zapisz i wróć"}
              </Button>

              {saveError instanceof Error && (
                <div className="w-full rounded-sm border border-rating-1/20 bg-rating-1/8 px-4 py-3 text-sm text-rating-1">
                  {saveError.message}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {phase === "saved" && (
        <div className="flex-1 grid place-items-center p-6">
          <div className="text-center flex flex-col items-center gap-5 animate-enter">
            <div className="display italic text-[100px] text-amber leading-[0.9] font-light">
              ✓
            </div>
            <div className="display font-normal text-[32px] text-ink">
              Zapisano
            </div>
            <p className="text-ink-muted mono text-[14px]">
              {formatTimer(elapsed)} · {actualMinutes}min ·{" "}
              {session.topicName ?? "Sesja nauki"}
            </p>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="absolute inset-0 bg-paper/70 flex items-center justify-center p-6 z-10">
          <div className="bg-kumo-base border border-rule rounded-sm p-8 max-w-[320px] w-full flex flex-col gap-5">
            <p className="text-ink text-center leading-relaxed">
              Przerwać sesję?
              <br />
              <span className="text-ink-muted text-[14px]">
                Czas nie zostanie zapisany.
              </span>
            </p>
            <div className="flex gap-2.5">
              <Button
                variant="ghost"
                onClick={handleExitCancel}
                className="flex-1 border border-rule rounded-sm mono text-[14px] uppercase text-ink-muted hover:text-ink hover:border-rule-strong"
              >
                Kontynuuj naukę
              </Button>
              <Button
                variant="ghost"
                onClick={handleExitConfirm}
                className="flex-1 border border-rating-1 rounded-sm mono text-[14px] uppercase text-rating-1 hover:bg-rating-1/10"
              >
                Przerwij
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
