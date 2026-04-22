import { TODAY } from "../../data/mock";
import { cn } from "../../utils/cn";
import { daysBetween } from "../../utils/date";
import { SUBJECT_BG, SUBJECTS } from "../../utils/subjects";

import type { Card, CardStage } from "../../types";

const STAGE_LABELS: Record<CardStage, string> = {
  new: "nowa",
  learning: "uczona",
  review: "utrwalona",
  due: "na dziś",
};

const STAGE_COLORS: Record<CardStage, string> = {
  new: "text-sub-mat",
  learning: "text-amber",
  review: "text-rating-4",
  due: "text-rating-1",
};

type Props = {
  card: Card;
  idx: number;
};

export function BrowseCard({ card, idx }: Props) {
  const subj = SUBJECTS[card.subject];
  const dueDays = daysBetween(TODAY, card.dueISO);
  const dueText =
    dueDays < 0
      ? `zaległa ${Math.abs(dueDays)} d`
      : dueDays === 0
        ? "dziś"
        : `za ${dueDays} d`;

  return (
    <div
      className="enter relative overflow-hidden flex flex-col gap-3.5 p-[20px_20px_18px] border border-rule bg-paper-2 rounded-[3px] cursor-pointer transition-all duration-[0.25s] hover:border-rule-strong hover:-translate-y-0.5"
      style={{ animationDelay: `${0.04 * (idx % 20)}s` }}
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px]",
          SUBJECT_BG[card.subject],
        )}
      />
      <div className="flex items-center justify-between mono text-[13px] tracking-[0.16em] uppercase text-ink-muted">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              SUBJECT_BG[card.subject],
            )}
          />
          {subj.name}
        </span>
        <span
          className={cn(
            "px-1.5 py-[2px] border border-current rounded-[2px] leading-none",
            STAGE_COLORS[card.stage],
          )}
        >
          {STAGE_LABELS[card.stage]}
        </span>
      </div>
      <div className="display text-[21px] leading-[1.3] text-ink tracking-[-0.005em]">
        {card.question}
      </div>
      <div className="flex justify-between mono text-[13px] text-ink-faint pt-2.5 border-t border-dashed border-rule">
        <span>{card.topic}</span>
        <span className={dueDays <= 0 ? "text-amber" : ""}>{dueText}</span>
      </div>
    </div>
  );
}
