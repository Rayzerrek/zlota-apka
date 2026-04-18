import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Button, Input, cn } from "@cloudflare/kumo";
import type { SubjectKey } from "../../types";
import { CARDS, TODAY } from "../../data/mock";
import { SUBJECTS } from "../../utils/subjects";
import { daysBetween } from "../../utils/date";
import { PageHead } from "../../components/PageHead";

const STAGE_LABELS: Record<string, string> = {
  new: "nowa",
  learning: "uczona",
  review: "utrwalona",
  due: "na dziś",
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
            <h1>Cos</h1>
          </>
        }
      />

      <div className="flex items-center gap-3 px-4 py-3 border border-[var(--rule)] rounded-sm mb-5 bg-[var(--paper-2)]">
        <MagnifyingGlassIcon size={16} className="text-[var(--ink-faint)] shrink-0" />
        <Input
          type="search"
          placeholder="Szukaj w pytaniach, tematach, odpowiedziach…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Szukaj kart"
          className="flex-1 bg-transparent ring-0 shadow-none rounded-none px-0 h-auto text-[var(--ink)] text-[15px] border-0"
        />
        <span className="mono text-xs text-[var(--ink-faint)]">{visible.length}</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-7 pb-5 border-b border-[var(--rule)]">
        <Button
          variant="ghost"
          onClick={() => setFilter("all")}
          className={cn(
            "h-auto rounded-full border px-3.5 py-2 mono text-[11px] tracking-[0.12em] uppercase transition-all shadow-none",
            filter === "all"
              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
              : "border-[var(--rule)] bg-transparent text-[var(--ink-muted)] hover:border-[var(--rule-strong)] hover:text-[var(--ink)]",
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
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                : "border-[var(--rule)] bg-transparent text-[var(--ink-muted)] hover:border-[var(--rule-strong)] hover:text-[var(--ink)]",
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
              className="card-tile enter"
              style={
                {
                  animationDelay: `${0.04 * (idx % 20)}s`,
                  ["--sub-color" as string]: subj.color,
                } as React.CSSProperties
              }
            >
              <div className="flex items-center justify-between mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
                <span className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: subj.color }}
                  />
                  {subj.name}
                </span>
                <span className="card-stage" data-stage={card.stage}>
                  {STAGE_LABELS[card.stage]}
                </span>
              </div>
              <div className="display text-[18px] leading-[1.3] text-[var(--ink)] tracking-[-0.005em]">
                {card.question}
              </div>
              <div className="flex justify-between mono text-[10px] text-[var(--ink-faint)] pt-2.5 border-t border-dashed border-[var(--rule)]">
                <span>{card.topic}</span>
                <span className={dueDays <= 0 ? "text-[var(--amber)]" : ""}>{dueText}</span>
              </div>
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <div className="py-16 text-center text-[var(--ink-faint)] display italic text-[22px]">
          nic nie znaleziono.
        </div>
      )}
    </>
  );
}
