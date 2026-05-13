import { Button } from "@cloudflare/kumo/components/button";
import { TrashIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { cn } from "../../utils/cn";
import { daysBetween } from "../../utils/date";
import { SUBJECTS, SUBJECT_BG } from "../../utils/subjects";

import type { Card, CardStage } from "../../types";

const STAGE_COLORS: Record<CardStage, string> = {
  new: "text-sub-mat",
  learning: "text-amber",
  review: "text-rating-4",
  due: "text-rating-1",
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  card: Card;
  onDelete?: () => void;
  onClick?: () => void;
};

export function BrowseCard({ card, onDelete, onClick }: Props) {
  const { t } = useTranslation();

  const STAGE_LABELS: Record<CardStage, string> = {
    new: t("browse.stageNew"),
    learning: t("browse.stageLearning"),
    review: t("browse.stageReview"),
    due: t("browse.stageDue"),
  };

  const subj = SUBJECTS[card.subject];
  const dueDays = daysBetween(todayISO(), card.dueISO);
  const dueText =
    dueDays < 0
      ? t("browse.overdue", { days: Math.abs(dueDays) })
      : dueDays === 0
        ? t("browse.dueToday")
        : t("browse.dueIn", { days: dueDays });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="relative overflow-hidden flex flex-col gap-3.5 p-[20px_20px_18px] border border-rule bg-paper-2 rounded-[3px] cursor-pointer transition-all duration-[0.25s] hover:border-rule-strong hover:-translate-y-0.5"
    >
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px]",
          SUBJECT_BG[card.subject],
        )}
      />
      <div className="flex items-center justify-between mono text-[13px] uppercase text-ink-muted">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              SUBJECT_BG[card.subject],
            )}
          />
          {t(`subjects.${card.subject}`, { defaultValue: subj.name })}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-1.5 py-[2px] border border-current rounded-[2px] leading-none",
              STAGE_COLORS[card.stage],
            )}
          >
            {STAGE_LABELS[card.stage]}
          </span>
          {onDelete && (
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-ink-faint hover:text-rating-1 p-1"
            >
              <TrashIcon size={14} weight="bold" />
            </Button>
          )}
        </div>
      </div>
      <div className="display text-[21px] leading-[1.3] text-ink">
        {card.question}
      </div>
      <div className="flex justify-between mono text-[13px] text-ink-faint pt-2.5 border-t border-dashed border-rule">
        <span>{card.topic}</span>
        <span className={dueDays <= 0 ? "text-amber" : ""}>{dueText}</span>
      </div>
    </div>
  );
}
