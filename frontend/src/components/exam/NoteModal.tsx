import { Dialog } from "@cloudflare/kumo";
import { XIcon, CopySimpleIcon, CheckIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { CARDS } from "../../data/mock";
import { longDate } from "../../utils/date";
import { generateExamNote, noteToMarkdown } from "../../utils/examNote";

import type { Exam } from "../../types";

type Props = {
  exam: Exam;
  onClose: () => void;
};

export function NoteModal({ exam, onClose }: Props) {
  const note = useMemo(() => generateExamNote(exam, CARDS), [exam]);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(noteToMarkdown(note)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog.Root
      open={true}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Dialog
        className="!max-w-2xl w-full p-0 flex flex-col max-h-[90dvh] sm:max-h-[80dvh] rounded-[8px] sm:rounded-[4px] overflow-hidden outline-none bg-paper-2"
        style={{
          border: "1px solid var(--color-rule-strong)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-5 border-b border-rule shrink-0">
          <div>
            <p className="mono text-[11px] tracking-[0.18em] uppercase text-amber mb-1.5">
              Notatka · {note.subject}
            </p>
            <Dialog.Title className="display font-normal text-[22px] leading-[1.2] text-ink m-0">
              {note.examName}
            </Dialog.Title>
            <p className="mono text-[13px] text-ink-faint mt-1">
              {longDate(note.dateISO)} · {note.cardCount} kart
            </p>
          </div>
          <Dialog.Close>
            <button
              type="button"
              className="shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-[3px] text-ink-muted hover:text-ink hover:bg-white/5 transition-colors cursor-pointer border-0 bg-transparent outline-none"
            >
              <XIcon size={18} />
            </button>
          </Dialog.Close>
        </div>

        <div className="overflow-y-auto px-7 py-6 flex flex-col gap-8 bg-paper-2">
          {note.sections.length === 0 ? (
            <p className="mono text-sm text-ink-faint">
              Brak fiszek dla tego przedmiotu.
            </p>
          ) : (
            note.sections.map((section) => (
              <div key={section.topic}>
                <p className="mono text-[11px] tracking-[0.18em] uppercase text-ink-faint pb-3 mb-3 border-b border-rule">
                  {section.topic}
                </p>
                <div className="flex flex-col gap-4">
                  {section.pairs.map(({ q, a }, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr] gap-3">
                      <div className="text-[14px] text-ink-muted leading-[1.5]">
                        {q}
                      </div>
                      <div
                        className="text-[14px] text-ink leading-[1.5] pl-3"
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

        <div className="shrink-0 flex justify-end px-7 py-4 border-t border-rule bg-paper-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 mono text-[13px] tracking-[0.08em] px-4 py-2 rounded-[3px] transition-colors cursor-pointer"
            style={{
              background: copied
                ? "var(--color-amber-wash)"
                : "var(--color-paper-3)",
              color: copied ? "var(--color-amber)" : "var(--color-ink-muted)",
              border: "1px solid var(--color-rule)",
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
      </Dialog>
    </Dialog.Root>
  );
}
