import {
  ArrowLeftIcon,
  CopySimpleIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { CARDS, EXAMS } from "../data/mock";
import { longDate } from "../utils/date";
import { generateExamNote, noteToMarkdown } from "../utils/examNote";

export function NotePage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const exam = useMemo(() => EXAMS.find((e) => e.id === examId), [examId]);
  const note = useMemo(
    () => (exam ? generateExamNote(exam, CARDS) : null),
    [exam],
  );

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
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mono text-[12px] tracking-[0.12em] uppercase text-ink-muted hover:text-ink transition-colors w-fit border-0 bg-transparent p-0 cursor-pointer"
          >
            <ArrowLeftIcon size={13} />
            Wróć
          </button>
          <div className="flex flex-col gap-1.5">
            <span className="mono text-[11px] tracking-[0.18em] uppercase text-amber">
              Notatka · {note.subject}
            </span>
            <h1 className="display italic text-[clamp(32px,5vw,52px)] font-normal leading-[0.95] tracking-[-0.02em] m-0 text-ink">
              {note.examName}
            </h1>
            <p className="mono text-[13px] text-ink-faint mt-1">
              {longDate(note.dateISO)} · {note.cardCount} kart
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-2 mono text-[13px] tracking-[0.08em] px-4 py-2 rounded-[3px] transition-colors cursor-pointer border"
          style={{
            background: copied
              ? "var(--color-amber-wash)"
              : "var(--color-paper-3)",
            color: copied ? "var(--color-amber)" : "var(--color-ink-muted)",
            borderColor: "var(--color-rule)",
          }}
        >
          {copied ? (
            <CheckIcon size={14} weight="bold" />
          ) : (
            <CopySimpleIcon size={14} />
          )}
          {copied ? "Skopiowano" : "Kopiuj markdown"}
        </button>
      </div>

      <div className="flex flex-col gap-10 pb-16">
        {note.sections.length === 0 ? (
          <p className="mono text-sm text-ink-faint">
            Brak fiszek dla tego przedmiotu.
          </p>
        ) : (
          note.sections.map((section) => (
            <div key={section.topic}>
              <p className="mono text-[11px] tracking-[0.18em] uppercase text-ink-faint pb-3 mb-5 border-b border-rule">
                {section.topic}
              </p>
              <div className="flex flex-col gap-5">
                {section.pairs.map(({ q, a }, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-2 sm:gap-5"
                  >
                    <div className="text-[15px] text-ink-muted leading-[1.6]">
                      {q}
                    </div>
                    <div
                      className="text-[15px] text-ink leading-[1.6] pl-4"
                      style={{ borderLeft: "2px solid var(--color-amber)" }}
                    >
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
