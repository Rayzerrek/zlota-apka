import { Button } from "@cloudflare/kumo/components/button";
import { Input } from "@cloudflare/kumo/components/input";
import { Label } from "@cloudflare/kumo/components/label";
import { CheckIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { useCreateExam } from "../../hooks/api/useExams";
import { useCreateSubject, useSubjects } from "../../hooks/api/useSubjects";
import { cn } from "../../utils/cn";
import { dayLong, longDate } from "../../utils/date";
import { OptionPicker } from "../ui/OptionPicker";

import type { ApiSubject } from "../../lib/schema-types";

type MaterialSize = "small" | "medium" | "large";

type Props = {
  open: boolean;
  onClose: () => void;
};

const FIELD =
  "w-full bg-paper-3 border border-rule rounded-[3px] px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-amber/60 transition-colors";

export function AddExamModal({ open, onClose }: Props) {
  const { t } = useTranslation();

  const MATERIAL_LABELS_T: Record<MaterialSize, string> = {
    small: t("exam.materialSmall"),
    medium: t("exam.materialMedium"),
    large: t("exam.materialLarge"),
  };

  const DIFFICULTY_LABELS_T: Record<number, string> = {
    1: t("exam.difficultyLabels.1"),
    2: t("exam.difficultyLabels.2"),
    3: t("exam.difficultyLabels.3"),
    4: t("exam.difficultyLabels.4"),
    5: t("exam.difficultyLabels.5"),
  };
  const {
    data: subjects,
    isLoading: subjectsLoading,
    error: subjectsErrorQuery,
  } = useSubjects();
  const {
    mutate: createExam,
    isPending: submitting,
    error: mutationError,
    data: planResult,
    reset: resetMutation,
  } = useCreateExam();

  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [materialSize, setMaterialSize] = useState<MaterialSize>("medium");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");

  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const { mutate: createSubject, isPending: creatingSubject } =
    useCreateSubject();

  const topicInputRef = useRef<HTMLInputElement>(null);
  const todayIso = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!open) return;
    if (subjects && subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
  }, [open, subjects, subjectId]);

  useEffect(() => {
    if (open) return;
    setName("");
    setExamDate("");
    setDifficulty(3);
    setMaterialSize("medium");
    setTopics([]);
    setTopicInput("");
    setSubjectId("");
    setIsCreatingSubject(false);
    setNewSubjectName("");
    resetMutation();
  }, [open, resetMutation]);

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

  function handleCreateSubject() {
    const name = newSubjectName.trim();
    if (!name) return;
    createSubject(
      { name, key: "other", color: "#a8a89f", difficulty: 3 },
      {
        onSuccess: (data) => {
          setSubjectId(data.id);
          setIsCreatingSubject(false);
          setNewSubjectName("");
        },
      },
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!subjectId) return;
    createExam({
      subjectId,
      name,
      examDate,
      difficulty,
      materialSize,
      topicNames: topics,
    });
  }

  const subjectsError =
    subjectsErrorQuery instanceof Error ? subjectsErrorQuery.message : null;
  const submitError =
    mutationError instanceof Error ? mutationError.message : null;

  const subjectList: ApiSubject[] = subjects ?? [];

  const topicMap = planResult
    ? Object.fromEntries(planResult.topics.map((t) => [t.id, t.name]))
    : {};
  const subjectMap = Object.fromEntries(subjectList.map((s) => [s.id, s]));
  const totalMinutes =
    planResult?.sessions.reduce((sum, s) => sum + s.plannedMinutes, 0) ?? 0;

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label={planResult ? t("exam.studyPlan") : t("exam.addExam")}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        aria-hidden
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-[520px] bg-paper-2 border border-rule rounded-t-[6px] sm:rounded-[4px] shadow-[0_24px_64px_rgba(0,0,0,0.55)] flex flex-col max-h-[92dvh] sm:max-h-[85dvh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-rule shrink-0">
          <div>
            <p className="eyebrow">{t("exam.addExam").split(" ")[0]}</p>
            <h2 className="text-[18px] font-semibold text-ink mt-0.5">
              {planResult ? t("exam.studyPlan") : t("exam.addExam")}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            shape="square"
            onClick={onClose}
            aria-label={t("common.close")}
            className="flex items-center justify-center w-8 h-8 rounded-sm text-ink-faint hover:text-ink hover:bg-paper-3 transition-colors"
          >
            <XIcon size={16} weight="bold" />
          </Button>
        </div>

        {planResult ? (
          <>
            <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col gap-4">
              <div className="flex items-center gap-3 p-3.5 bg-amber-wash border border-amber/20 rounded-[4px]">
                <div className="w-8 h-8 rounded-sm bg-amber/20 grid place-items-center text-amber shrink-0">
                  <CheckIcon size={16} weight="bold" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">
                    {planResult.sessions.length}{" "}
                    {t("exam.sessionsCreated", {
                      count: planResult.sessions.length,
                    }).replace(/^\d+\s*/, "")}
                    {" · "}
                    {t("exam.totalMinutes", { minutes: totalMinutes })}
                  </p>
                  <p className="text-[12px] text-ink-muted mt-0.5">
                    {t("exam.examOn", {
                      date: longDate(planResult.exam.examDate),
                    })}
                  </p>
                </div>
              </div>

              {planResult.sessions.length === 0 ? (
                <p className="text-[14px] text-ink-muted text-center py-8">
                  {planResult.topics.length === 0
                    ? t("exam.noTopics")
                    : t("exam.noSlots")}
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
                {t("exam.looksGood")}
              </Button>
            </div>
          </>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[13px] text-ink-muted">
                    {t("exam.subject")}
                  </Label>
                  {!isCreatingSubject && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => setIsCreatingSubject(true)}
                      className="text-amber hover:text-amber hover:bg-amber-wash h-auto py-0.5 px-1.5"
                    >
                      {t("exam.newSubject")}
                    </Button>
                  )}
                </div>
                {isCreatingSubject ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Nazwa przedmiotu"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateSubject();
                        }
                      }}
                      className={cn(FIELD, "flex-1")}
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCreateSubject}
                      disabled={!newSubjectName.trim() || creatingSubject}
                      className="shrink-0 rounded-[3px]"
                    >
                      {creatingSubject ? "..." : "Dodaj"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsCreatingSubject(false);
                        setNewSubjectName("");
                      }}
                      className="shrink-0 px-2 text-ink-faint rounded-[3px]"
                      aria-label="Anuluj"
                    >
                      <XIcon size={16} />
                    </Button>
                  </div>
                ) : subjectsLoading ? (
                  <div className="h-10 bg-paper-3 border border-rule rounded-[3px] animate-pulse" />
                ) : subjectsError ? (
                  <p className="text-[13px] text-rating-1">{subjectsError}</p>
                ) : subjectList.length === 0 ? (
                  <p className="text-[13px] text-ink-muted">
                    {t("exam.noSubjects")}
                  </p>
                ) : (
                  <OptionPicker
                    value={subjectId}
                    onChange={setSubjectId}
                    options={subjectList.map((s) => ({
                      value: s.id,
                      label: s.name,
                      color: s.color,
                    }))}
                    ariaLabel={t("exam.searchSubject")}
                    searchPlaceholder={t("exam.searchSubject")}
                    emptyText={t("exam.noResults")}
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] text-ink-muted">
                  {t("exam.examName")}
                </Label>
                <Input
                  type="text"
                  placeholder={t("exam.examNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={FIELD}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] text-ink-muted">
                  {t("exam.examDate")}
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

              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <Label className="text-[13px] text-ink-muted">
                    {t("exam.difficulty")}
                  </Label>
                  <span className="text-[13px] text-amber font-medium">
                    {DIFFICULTY_LABELS_T[difficulty]}
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

              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] text-ink-muted">
                  {t("exam.materialSize")}
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
                        {MATERIAL_LABELS_T[size]}
                      </Button>
                    ),
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[13px] text-ink-muted">
                  {t("exam.topics")}{" "}
                  <span className="text-ink-faint">
                    {t("exam.topicsOptional")}
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    ref={topicInputRef}
                    type="text"
                    placeholder={t("exam.topicPlaceholder")}
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
                    aria-label={t("exam.addTopic")}
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

            <div className="px-6 py-4 border-t border-rule flex items-center justify-end gap-3 shrink-0">
              <Button type="button" variant="ghost" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || subjectList.length === 0 || !subjectId}
                className="bg-amber border-amber text-paper hover:bg-[#ffcc4a] hover:border-[#ffcc4a] font-semibold disabled:opacity-50"
              >
                {submitting ? t("exam.planning") : t("exam.plan")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
