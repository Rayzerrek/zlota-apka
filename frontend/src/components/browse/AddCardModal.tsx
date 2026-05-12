import { Button } from "@cloudflare/kumo/components/button";
import { Label } from "@cloudflare/kumo/components/label";
import { XIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { useCreateCard } from "../../hooks/api/useCards";
import { useSubjects } from "../../hooks/api/useSubjects";
import { useAllTopics, useCreateTopic } from "../../hooks/api/useTopics";
import { cn } from "../../utils/cn";
import { OptionPicker } from "../ui/OptionPicker";

type Props = {
  open: boolean;
  onClose: () => void;
};

const FIELD =
  "w-full bg-paper-3 border border-rule rounded-[3px] px-3 py-2.5 text-[14px] text-ink placeholder:text-ink-faint focus:outline-none focus:border-amber/60 transition-colors resize-none";

export function AddCardModal({ open, onClose }: Props) {
  const { data: topics, isLoading: topicsLoading } = useAllTopics();
  const { data: subjects } = useSubjects();
  const {
    mutate: createCard,
    isPending: submitting,
    error: mutationError,
    reset: resetMutation,
  } = useCreateCard();
  const { mutate: createTopic, isPending: creatingTopic } = useCreateTopic();

  const [topicId, setTopicId] = useState("");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicSubjectId, setNewTopicSubjectId] = useState("");

  const topicOptions = useMemo(
    () =>
      (topics ?? []).map((t) => ({
        value: t.id,
        label: t.name,
        meta: t.subjectName ?? "Bez przedmiotu",
      })),
    [topics],
  );

  useEffect(() => {
    if (!open) return;
    if (topicOptions.length > 0 && !topicId) {
      setTopicId(topicOptions[0].value);
    }
  }, [open, topicOptions, topicId]);

  useEffect(() => {
    if (
      isCreatingTopic &&
      subjects &&
      subjects.length > 0 &&
      !newTopicSubjectId
    ) {
      setNewTopicSubjectId(subjects[0].id);
    }
  }, [isCreatingTopic, subjects, newTopicSubjectId]);

  useEffect(() => {
    if (open) return;
    setTopicId("");
    setFront("");
    setBack("");
    setIsCreatingTopic(false);
    setNewTopicName("");
    setNewTopicSubjectId("");
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

  function handleCreateTopic() {
    const name = newTopicName.trim();
    if (!name || !newTopicSubjectId) return;
    createTopic(
      { name, subjectId: newTopicSubjectId },
      {
        onSuccess: (data) => {
          setTopicId(data.id);
          setIsCreatingTopic(false);
          setNewTopicName("");
        },
      },
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topicId || !front.trim() || !back.trim()) return;
    createCard(
      { topicId, body: { front: front.trim(), back: back.trim() } },
      { onSuccess: () => onClose() },
    );
  }

  const submitError =
    mutationError instanceof Error ? mutationError.message : null;

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label="Dodaj fiszkę"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        aria-hidden
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-[480px] bg-paper-2 border border-rule rounded-t-[6px] sm:rounded-[4px] shadow-[0_24px_64px_rgba(0,0,0,0.55)] flex flex-col max-h-[92dvh] sm:max-h-[85dvh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-rule shrink-0">
          <div>
            <p className="eyebrow">Fiszka</p>
            <h2 className="text-[18px] font-semibold text-ink mt-0.5">
              Dodaj fiszkę
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-6 py-6 overflow-y-auto flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[13px] text-ink-muted">Temat</Label>
                {!isCreatingTopic && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsCreatingTopic(true)}
                    className="text-amber hover:text-amber hover:bg-amber-wash h-auto py-0.5 px-1.5"
                  >
                    + Nowy
                  </Button>
                )}
              </div>
              {isCreatingTopic ? (
                <div className="flex flex-col gap-2 p-3 bg-paper-3 border border-rule rounded-[3px]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nazwa tematu"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateTopic();
                        }
                      }}
                      className={cn(FIELD, "flex-1 !bg-paper-2")}
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setIsCreatingTopic(false);
                        setNewTopicName("");
                      }}
                      className="shrink-0 px-2 text-ink-faint rounded-[3px]"
                      aria-label="Anuluj"
                    >
                      <XIcon size={16} />
                    </Button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <select
                      value={newTopicSubjectId}
                      onChange={(e) => setNewTopicSubjectId(e.target.value)}
                      className={cn(
                        FIELD,
                        "flex-1 !py-1.5 select-chevron !bg-paper-2",
                      )}
                    >
                      <option value="" disabled>
                        Wybierz przedmiot...
                      </option>
                      {subjects?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCreateTopic}
                      disabled={
                        !newTopicName.trim() ||
                        !newTopicSubjectId ||
                        creatingTopic
                      }
                      className="shrink-0 rounded-[3px] py-1.5"
                    >
                      {creatingTopic ? "..." : "Dodaj"}
                    </Button>
                  </div>
                </div>
              ) : topicsLoading ? (
                <div className="h-10 bg-paper-3 border border-rule rounded-[3px] animate-pulse" />
              ) : topicOptions.length === 0 ? (
                <p className="text-[13px] text-ink-muted">
                  Brak tematów — dodaj nowy, żeby dodać fiszkę.
                </p>
              ) : (
                <OptionPicker
                  value={topicId}
                  onChange={setTopicId}
                  options={topicOptions}
                  ariaLabel="Wybierz temat"
                  searchPlaceholder="Szukaj tematu..."
                  emptyText="Brak tematów dla wpisanej frazy."
                />
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] text-ink-muted">
                Przód (pytanie)
              </Label>
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="np. Jakie są właściwości funkcji kwadratowej?"
                rows={3}
                required
                className={FIELD}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-[13px] text-ink-muted">
                Tył (odpowiedź)
              </Label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="np. Wartość w wierzchołku, miejsca zerowe, monotoniczność..."
                rows={3}
                required
                className={FIELD}
              />
            </div>

            {submitError && (
              <p className="text-[13px] text-rating-1">{submitError}</p>
            )}
          </div>

          <div className="px-6 py-4 border-t border-rule flex items-center justify-end gap-3 shrink-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Anuluj
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || !topicId || !front.trim() || !back.trim()}
              className="bg-amber border-amber text-paper hover:bg-[#ffcc4a] hover:border-[#ffcc4a] font-semibold disabled:opacity-50"
            >
              {submitting ? "Dodaję…" : "Dodaj fiszkę"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
