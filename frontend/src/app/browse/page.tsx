import { Button, Input } from "@cloudflare/kumo";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { PageHead } from "../../components/PageHead";
import { CARDS, TODAY } from "../../data/mock";
import { daysBetween } from "../../utils/date";
import { SUBJECTS } from "../../utils/subjects";
import { cn } from "../../utils/utils";

import type { SubjectKey } from "../../types/types";

const STAGE_LABELS: Record<string, string> = {
  new: "nowa",
  learning: "uczona",
  review: "utrwalona",
  due: "na dziś",
};

const STAGE_COLORS: Record<string, string> = {
  new: "text-sub-mat",
  learning: "text-amber",
  review: "text-rating-4",
  due: "text-rating-1",
};

type Filter = "all" | SubjectKey;

export function BrowsePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: CARDS.length };
    for (const c of CARDS) out[c.subject] = (out[c.subject] || 0) + 1;
    return out;
  }, []);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return CARDS.filter((c) => {
      if (filter !== "all" && c.subject !== filter) return false;
      if (
        term &&
        !c.question.toLowerCase().includes(term) &&
        !c.topic.toLowerCase().includes(term) &&
        !c.answer.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
  }, [filter, q]);

  return (
    <>
      <PageHead
        title={
          <>
            <span>Cos</span>
          </>
        }
      />

      <div className="flex items-center gap-3 px-4 py-3 border border-rule rounded-sm mb-5 bg-paper-2">
        <MagnifyingGlassIcon size={16} className="text-ink-faint shrink-0" />
        <Input
          type="search"
          placeholder="Szukaj w pytaniach, tematach, odpowiedziach…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Szukaj kart"
          className="flex-1 bg-transparent ring-0 shadow-none rounded-none px-0 h-auto text-ink text-[15px] border-0"
        />
        <span className="mono text-xs text-ink-faint">{visible.length}</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-7 pb-5 border-b border-rule">
        <Button
          variant="ghost"
          onClick={() => setFilter("all")}
          className={cn(
            "h-auto rounded-full border px-3.5 py-2 mono text-[11px] tracking-[0.12em] uppercase transition-all shadow-none",
            filter === "all"
              ? "border-ink bg-transparent !text-ink"
              : "border-rule bg-transparent hover:bg-transparent text-ink-muted hover:border-rule-strong hover:text-ink",
          )}
        >
          Wszystkie
          <span className="opacity-60 ml-1">{counts.all}</span>
        </Button>
        {(Object.keys(SUBJECTS) as SubjectKey[]).map((k) => (
          <Button
            key={k}
            variant="ghost"
            onClick={() => setFilter(k)}
            className={cn(
              "h-auto rounded-full border px-3.5 py-2 mono text-[11px] tracking-[0.12em] uppercase transition-all shadow-none",
              filter === k
                ? "border-ink bg-transparent !text-ink"
                : "border-rule bg-transparent hover:bg-transparent text-ink-muted hover:border-rule-strong hover:text-ink",
            )}
          >
            <span
              className="rounded-full shrink-0"
              style={{ background: SUBJECTS[k].color, width: 6, height: 6 }}
            />
            {SUBJECTS[k].name}
            <span className="opacity-60 ml-1">{counts[k] || 0}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
        {visible.map((card, idx) => {
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
              key={card.id}
              className="enter relative overflow-hidden flex flex-col gap-3.5 p-[20px_20px_18px] border border-rule bg-paper-2 rounded-[3px] cursor-pointer transition-all duration-[0.25s] hover:border-rule-strong hover:-translate-y-0.5"
              style={{ animationDelay: `${0.04 * (idx % 20)}s` }}
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[3px]"
                style={{ background: subj.color }}
              />
              <div className="flex items-center justify-between mono text-[10px] tracking-[0.16em] uppercase text-ink-muted">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: subj.color }}
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
              <div className="display text-[18px] leading-[1.3] text-ink tracking-[-0.005em]">
                {card.question}
              </div>
              <div className="flex justify-between mono text-[10px] text-ink-faint pt-2.5 border-t border-dashed border-rule">
                <span>{card.topic}</span>
                <span className={dueDays <= 0 ? "text-amber" : ""}>
                  {dueText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="py-16 text-center text-ink-faint display italic text-[22px]">
          nic nie znaleziono.
        </div>
      )}
    </>
  );
}
