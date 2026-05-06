import { Button } from "@cloudflare/kumo/components/button";
import {
  ArrowLeftIcon,
  CheckIcon,
  CopySimpleIcon,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useAllCards } from "../hooks/api/useCards";
import { useAllExams } from "../hooks/api/useExams";
import { adaptApiCardToCard } from "../lib/adapters";
import { cn } from "../utils/cn";
import { longDate } from "../utils/date";
import { generateExamNote, noteToMarkdown } from "../utils/examNote";

export function NotePage() {
  const params = useParams({ strict: false });
  const examId = params.examId as string;
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const { data: exams, isLoading: examsLoading } = useAllExams();
  const { data: apiCards, isLoading: cardsLoading } = useAllCards();

  const cards = useMemo(
    () => (apiCards ?? []).map(adaptApiCardToCard),
    [apiCards],
  );

  const exam = useMemo(
    () => exams.find((e) => e.id === examId),
    [exams, examId],
  );
  const note = useMemo(
    () => (exam ? generateExamNote(exam, cards) : null),
    [exam, cards],
  );

  if (examsLoading || cardsLoading) {
    return (
      <div className="h-96 animate-pulse rounded-sm border border-rule bg-paper-2" />
    );
  }

  function handleCopy() {
    if (!note) return;
    navigator.clipboard.writeText(noteToMarkdown(note)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!exam || !note) {
    return (
      <div className="py-24 text-center text-ink-faint display italic text-[25px]">
        Nie znaleziono notatki.
      </div>
    );
  }

  return (
    <>
      <div className="enter flex items-end justify-between gap-4 mb-9 pb-4 border-b border-rule">
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            size="xs"
            icon={ArrowLeftIcon}
            onClick={() => router.history.back()}
            className="mono uppercase text-ink-muted hover:text-ink hover:bg-transparent"
          >
            Wróć
          </Button>
          <div className="flex flex-col gap-1.5">
            <span className="mono text-[11px] uppercase text-amber">
              Notatka · {note.subject}
            </span>
            <h1 className="display italic text-[clamp(32px,5vw,52px)] font-normal leading-[0.95] m-0 text-ink">
              {note.examName}
            </h1>
            <p className="mono text-[13px] text-ink-faint mt-1">
              {longDate(note.dateISO)} · {note.cardCount} kart
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          icon={copied ? CheckIcon : CopySimpleIcon}
          onClick={handleCopy}
          className={cn(
            "shrink-0 mono text-[13px] border border-rule !rounded-[3px]",
            copied
              ? "!bg-amber-wash !text-amber"
              : "!bg-kumo-base !text-ink-muted",
          )}
        >
          {!copied ? "Kopiuj" : "Skopiowano"}
        </Button>
      </div>

      <div className="flex flex-col gap-10 pb-16">
        {note.sections.length === 0 ? (
          <p className="mono text-sm text-ink-faint">
            Brak fiszek dla tego przedmiotu.
          </p>
        ) : (
          note.sections.map((section) => (
            <div key={section.topic}>
              <p className="mono text-[11px] uppercase text-ink-faint pb-3 mb-5 border-b border-rule">
                {section.topic}
              </p>
              <div className="flex flex-col gap-5">
                {section.pairs.map(({ q, a }) => (
                  <div
                    key={q}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2 sm:gap-5"
                  >
                    <div className="text-[15px] text-ink-muted leading-[1.6]">
                      {q}
                    </div>
                    <div className="text-[15px] text-ink leading-[1.6] pl-4 border-l-2 border-amber">
                      {a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
