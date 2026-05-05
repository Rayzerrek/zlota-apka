import { Button } from "@cloudflare/kumo/components/button";
import { Dialog } from "@cloudflare/kumo/components/dialog";
import { CheckIcon, CopySimpleIcon, XIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { useAllCards } from "../../hooks/api/useCards";
import { adaptApiCardToCard } from "../../lib/adapters";
import { cn } from "../../utils/cn";
import { longDate } from "../../utils/date";
import { generateExamNote, noteToMarkdown } from "../../utils/examNote";

import type { Exam } from "../../types";

type Props = {
  exam: Exam;
  onClose: () => void;
};

export function NoteModal({ exam, onClose }: Props) {
  const { data: apiCards } = useAllCards();
  const cards = useMemo(
    () => (apiCards ?? []).map(adaptApiCardToCard),
    [apiCards],
  );
  const note = useMemo(() => generateExamNote(exam, cards), [exam, cards]);
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
      <Dialog className="!max-w-2xl w-full p-0 flex flex-col max-h-[90dvh] sm:max-h-[80dvh] rounded-[8px] sm:rounded-[4px] overflow-hidden outline-none bg-paper-2 border border-rule-strong shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between gap-4 px-7 pt-6 pb-5 border-b border-rule shrink-0">
          <div>
            <p className="mono text-[11px] uppercase text-amber mb-1.5">
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
            <Button
              variant="ghost"
              shape="square"
              size="sm"
              aria-label="Zamknij"
              icon={XIcon}
              className="shrink-0 mt-0.5 text-ink-muted hover:text-ink"
            />
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
                <p className="mono text-[11px] uppercase text-ink-faint pb-3 mb-3 border-b border-rule">
                  {section.topic}
                </p>
                <div className="flex flex-col gap-4">
                  {section.pairs.map(({ q, a }) => (
                    <div key={q} className="grid grid-cols-[1fr_1fr] gap-3">
                      <div className="text-[14px] text-ink-muted leading-[1.5]">
                        {q}
                      </div>
                      <div className="text-[14px] text-ink leading-[1.5] pl-3 border-l-2 border-amber">
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
          <Button
            variant="ghost"
            icon={copied ? CheckIcon : CopySimpleIcon}
            onClick={handleCopy}
            className={cn(
              "mono text-[13px] border border-rule !rounded-[3px]",
              copied
                ? "!bg-amber-wash !text-amber"
                : "!bg-paper-3 !text-ink-muted",
            )}
          >
            {!copied ? "Kopiuj" : "Skopiowano"}
          </Button>
        </div>
      </Dialog>
    </Dialog.Root>
  );
}
