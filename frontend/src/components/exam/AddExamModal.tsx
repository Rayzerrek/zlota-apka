import { Button, Input, Label, Select } from "@cloudflare/kumo";
import { CheckIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { apiGet, apiPost } from "../../lib/api";
import { cn } from "../../utils/cn";
import { dayLong, longDate } from "../../utils/date";

import type { ApiSubject, ExamCreateResponse } from "../../lib/api";

type MaterialSize = "small" | "medium" | "large";

type Props = {
  open: boolean;
  onClose: () => void;
};

const MATERIAL_LABELS: Record<MaterialSize, string> = {
  small: "Mało",
  medium: "Średnio",
  large: "Dużo",
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Bardzo łatwy",
  2: "Łatwy",
  3: "Średni",
  4: "Trudny",
  5: "Bardzo trudny",
};

const FIELD =
  "w-full bg-paper-3 border border-rule rounded-[3px] px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-amber/60 transition-colors";

export function AddExamModal({ open, onClose }: Props) {
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);

  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [materialSize, setMaterialSize] = useState<MaterialSize>("medium");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [planResult, setPlanResult] = useState<ExamCreateResponse | null>(null);

  const topicInputRef = useRef<HTMLInputElement>(null);
  const todayIso = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!open) return;
    setSubjectsLoading(true);
    setSubjectsError(null);
    void apiGet<ApiSubject[]>("/api/subjects").then((res) => {
      setSubjectsLoading(false);
      if (res.ok === false) {
        setSubjectsError(res.message);
        return;
      }
      setSubjects(res.data);
      if (res.data[0]) setSubjectId(res.data[0].id);
    });
  }, [open]);

  useEffect(() => {
    if (open) return;
    setName("");
    setExamDate("");
    setDifficulty(3);
    setMaterialSize("medium");
    setTopics([]);
    setTopicInput("");
    setSubmitError(null);
    setPlanResult(null);
    setSubjectId("");
    setSubjects([]);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function addTopic() {
    const t = topicInput.trim();
    if (t && !topics.includes(t)) setTopics((p) => [...p, t]);
    setTopicInput("");
    topicInputRef.current?.focus();
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!subjectId) return;
    setSubmitting(true);
    setSubmitError(null);
    const res = await apiPost<ExamCreateResponse>("/api/exams", {
      subjectId,
      name,
      examDate,
      difficulty,
      materialSize,
      topicNames: topics,
    });
    setSubmitting(false);
    if (res.ok === false) {
      setSubmitError(res.message);
      return;
    }
    setPlanResult(res.data);
  }

  const topicMap = planResult
    ? Object.fromEntries(planResult.topics.map((t) => [t.id, t.name]))
    : {};
  const subjectMap = Object.fromEntries(subjects.map((s) => [s.id, s]));
  const totalMinutes =
    planResult?.sessions.reduce((sum, s) => sum + s.plannedMinutes, 0) ?? 0;

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label={planResult ? "Plan nauki" : "Dodaj sprawdzian"}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        aria-hidden
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-[520px] bg-paper-2 border border-rule rounded-t-[6px] sm:rounded-[4px] shadow-[0_24px_64px_rgba(0,0,0,0.55)] flex flex-col max-h-[92dvh] sm:max-h-[85dvh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-rule shrink-0">
          <div>
            <p className="eyebrow">Sprawdzian</p>
            <h2 className="text-[18px] font-semibold text-ink mt-0.5">
              {planResult ? "Plan nauki" : "Dodaj sprawdzian"}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            onClick={onClose}
            aria-label="Zamknij"
            className="flex items-center justify-center w-8 h-8 rounded-sm text-ink-faint hover:text-ink hover:bg-paper-3 transition-colors"
          >
            <XIcon size={16} weight="bold" />
          </Button>
        </div>

        {planResult ? (
          /* ── Plan preview ── */
          <>
            <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col gap-4">
              {/* Summary banner */}
              <div className="flex items-center gap-3 p-3.5 bg-amber-wash border border-amber/20 rounded-[4px]">
                <div className="w-8 h-8 rounded-sm bg-amber/20 grid place-items-center text-amber shrink-0">
                  <CheckIcon size={16} weight="bold" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">
                    {planResult.sessions.length}{" "}
                    {planResult.sessions.length === 1 ? "sesja" : "sesje"} nauki
                    {" · "}łącznie {totalMinutes} min
                  </p>
                  <p className="text-[12px] text-ink-muted mt-0.5">
                    Sprawdzian:{" "}
                    <span className="text-ink">
                      {longDate(planResult.exam.examDate)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Sessions list */}
              {planResult.sessions.length === 0 ? (
                <p className="text-[14px] text-ink-muted text-center py-8">
                  {planResult.topics.length === 0
                    ? "Brak tematów — dodaj tematy żeby wygenerować plan."
                    : "Brak dostępnych terminów — uzupełnij godziny nauki w ustawieniach."}
                </p>
              ) : (
                <ol className="flex flex-col gap-1.5">
                  {planResult.sessions.map((session, i) => {
                    const subject = subjectMap[planResult.exam.subjectId];
                    return (
                      <li
                        key={session.id}
                        className="flex items-center gap-3 px-3.5 py-3 bg-paper-3 rounded-[3px] border border-rule"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            background: subject?.color ?? "var(--color-amber)",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] text-ink truncate">
                            {topicMap[session.topicId] ?? `Temat ${i + 1}`}
                          </p>
                          <p className="text-[12px] text-ink-muted mt-0.5 capitalize">
                            {dayLong(session.scheduledDate)},{" "}
                            {longDate(session.scheduledDate)}
                          </p>
                        </div>
                        <span className="mono text-[12px] text-ink-faint shrink-0">
                          {session.plannedMinutes} min
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            <div className="px-6 py-4 border-t border-rule shrink-0">
              <Button
                variant="primary"
                onClick={onClose}
                className="w-full justify-center bg-amber border-amber text-paper hover:bg-[#ffcc4a] hover:border-[#ffcc4a] font-semibold"
              >
                Wygląda dobrze
              </Button>
            </div>
          </>
        ) : (
          /* ── Form ── */
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col gap-5">
              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] text-ink-muted">Przedmiot</Label>
                {subjectsLoading ? (
                  <div className="h-10 bg-paper-3 border border-rule rounded-[3px] animate-pulse" />
                ) : subjectsError ? (
                  <p className="text-[13px] text-rating-1">{subjectsError}</p>
                ) : subjects.length === 0 ? (
                  <p className="text-[13px] text-ink-muted">
                    Brak przedmiotów — uzupełnij profil, żeby dodać sprawdzian.
                  </p>
                ) : (
                  <Select
                    value={subjectId}
                    onValueChange={(v) => setSubjectId(v ?? "")}
                    required
                  >
                    {subjects.map((s) => (
                      <Select.Option key={s.id} value={s.id}>
                        {s.name}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] text-ink-muted">
                  Nazwa sprawdzianu
                </Label>
                <Input
                  type="text"
                  placeholder="np. Kartkówka z logarytmów"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={FIELD}
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] text-ink-muted">
                  Data sprawdzianu
                </Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  min={todayIso}
                  required
                  className={FIELD}
                />
              </div>

              {/* Difficulty */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <Label className="text-[13px] text-ink-muted">
                    Poziom trudności materiału
                  </Label>
                  <span className="text-[13px] text-amber font-medium">
                    {DIFFICULTY_LABELS[difficulty]}
                  </span>
                </div>
                <Input
                  type="range"
                  min={1}
                  max={5}
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="range-amber"
                  style={{ width: "100%" }}
                />
                <div className="flex justify-between px-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={cn(
                        "mono text-[11px]",
                        n === difficulty ? "text-amber" : "text-ink-faint",
                      )}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Material size */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] text-ink-muted">
                  Ilość materiału
                </Label>
                <div className="flex gap-2">
                  {(["small", "medium", "large"] as MaterialSize[]).map(
                    (size) => (
                      <Button
                        key={size}
                        type="button"
                        variant="ghost"
                        onClick={() => setMaterialSize(size)}
                        className={cn(
                          "flex-1 py-2.5 text-[13px] font-medium border rounded-[3px] transition-colors bg-transparent",
                          materialSize === size
                            ? "border-amber text-amber bg-amber-wash"
                            : "border-rule text-ink-muted hover:border-rule-strong hover:text-ink",
                        )}
                      >
                        {MATERIAL_LABELS[size]}
                      </Button>
                    ),
                  )}
                </div>
              </div>

              {/* Topics */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] text-ink-muted">
                  Tematy <span className="text-ink-faint">(opcjonalnie)</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    ref={topicInputRef}
                    type="text"
                    placeholder="np. Ciągi arytmetyczne"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTopic();
                      }
                    }}
                    className={cn(FIELD, "flex-1")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    icon={<PlusIcon size={15} weight="bold" />}
                    onClick={addTopic}
                    aria-label="Dodaj temat"
                    className="shrink-0 px-3"
                  />
                </div>
                {topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {topics.map((t, i) => (
                      <span
                        key={t}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-wash border border-amber/25 text-amber text-[13px] rounded-[3px]"
                      >
                        {t}
                        <Button
                          type="button"
                          variant="ghost"
                          shape="square"
                          onClick={() =>
                            setTopics((p) => p.filter((_, j) => j !== i))
                          }
                          aria-label={`Usuń temat ${t}`}
                          className="text-amber/50 hover:text-amber transition-colors p-0"
                        >
                          <XIcon size={11} weight="bold" />
                        </Button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {submitError && (
                <p className="text-[13px] text-rating-1">{submitError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-rule flex items-center justify-end gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={onClose}>
                Anuluj
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || subjects.length === 0}
                className="bg-amber border-amber text-paper hover:bg-[#ffcc4a] hover:border-[#ffcc4a] font-semibold disabled:opacity-50"
              >
                {submitting ? "Planuję…" : "Zaplanuj"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
