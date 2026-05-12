import { Button } from "@cloudflare/kumo/components/button";
import { XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "../../utils/cn";
import { daysBetween } from "../../utils/date";
import { SUBJECTS, SUBJECT_BG } from "../../utils/subjects";

import type { Card } from "../../types";

type Props = {
  card: Card | null;
  onClose: () => void;
};

const STAGE_LABELS: Record<Card["stage"], string> = {
  new: "nowa",
  learning: "uczona",
  review: "utrwalona",
  due: "na dziś",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CardDetailModal({ card, onClose }: Props) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!card) return;
    setFlipped(false);
  }, [card]);

  useEffect(() => {
    if (!card) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card, onClose]);

  if (!card) return null;

  const subj = SUBJECTS[card.subject];
  const dueDays = daysBetween(todayISO(), card.dueISO);
  const dueText =
    dueDays < 0
      ? `zaległa ${Math.abs(dueDays)} d`
      : dueDays === 0
        ? "dziś"
        : `za ${dueDays} d`;

  return createPortal(
    <div
      role="dialog"
      aria-modal
      aria-label="Podgląd fiszki"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        aria-hidden
        onClick={onClose}
      />

      <div className="relative w-full max-w-[600px] flex flex-col items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          shape="square"
          onClick={onClose}
          aria-label="Zamknij"
          className="absolute -top-2 -right-2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-paper-2 border border-rule text-ink-faint hover:text-ink hover:bg-paper-3 transition-colors shadow-md"
        >
          <XIcon size={14} weight="bold" />
        </Button>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setFlipped((f) => !f)}
          className={cn(
            "w-full aspect-[3/2] max-[640px]:aspect-[2/3] relative cursor-pointer [transform-style:preserve-3d] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          {/* Front face */}
          <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] flex flex-col p-[32px_36px] border border-rule-strong rounded-[4px] overflow-hidden bg-[linear-gradient(180deg,var(--color-paper-2),var(--color-paper))]">
            <div className="absolute inset-2 border border-dashed border-rule pointer-events-none rounded-[2px]" />
            <div className="flex items-center gap-3 mono text-[13px] uppercase text-ink-muted">
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  SUBJECT_BG[card.subject],
                )}
              />
              {subj.name} · {card.topic}
              <span className="mono text-[12px] text-ink-faint ml-auto">
                awers
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div className="display font-light text-[clamp(24px,4vw,38px)] leading-[1.25] text-ink max-w-[26ch]">
                {card.question}
              </div>
            </div>
            <div className="mono text-[12px] uppercase text-ink-faint text-center">
              Kliknij lub spacja, aby zobaczyć odpowiedź
            </div>
          </div>

          {/* Back face */}
          <div className="absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col p-[32px_36px] border border-rule-strong rounded-[4px] overflow-hidden bg-[linear-gradient(180deg,rgba(242,184,48,0.05),transparent_50%),var(--color-paper-2)]">
            <div className="absolute inset-2 border border-dashed border-rule pointer-events-none rounded-[2px]" />
            <div className="flex items-center gap-3 mono text-[13px] uppercase text-ink-muted">
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  SUBJECT_BG[card.subject],
                )}
              />
              {subj.name} · {card.topic}
              <span className="mono text-[12px] text-ink-faint ml-auto">
                rewers
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div className="display italic font-medium text-[clamp(28px,4.5vw,44px)] leading-[1.2] text-amber max-w-[26ch]">
                {card.answer}
              </div>
            </div>
            <div className="mono text-[12px] uppercase text-ink-faint text-center">
              Kliknij, aby wrócić do pytania
            </div>
          </div>
        </div>

        {/* Card metadata */}
        <div className="flex items-center gap-4 mono text-[12px] text-ink-faint">
          <span>{STAGE_LABELS[card.stage]}</span>
          <span className="w-px h-3 bg-rule" />
          <span className={dueDays <= 0 ? "text-amber" : ""}>
            następna: {dueText}
          </span>
          <span className="w-px h-3 bg-rule" />
          <span>powtórzeń: {card.reps}</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
