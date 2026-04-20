import { Button } from "@cloudflare/kumo";

import { cn } from "../../utils/cn";
import { SUBJECTS } from "../../utils/subjects";

import type { SubjectKey } from "../../types";

export type Filter = "all" | SubjectKey;

type Props = {
  filter: Filter;
  onFilterChange: (f: Filter) => void;
  counts: Record<string, number>;
};

export function BrowseFilters({ filter, onFilterChange, counts }: Props) {
  return (
    <div className="flex gap-2 flex-wrap mb-7 pb-5 border-b border-rule">
      <Button
        variant="ghost"
        onClick={() => onFilterChange("all")}
        className={cn(
          "h-auto rounded-full border px-3.5 py-2 mono text-[14px] tracking-[0.12em] uppercase transition-all shadow-none",
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
          onClick={() => onFilterChange(k)}
          className={cn(
            "h-auto rounded-full border px-3.5 py-2 mono text-[14px] tracking-[0.12em] uppercase transition-all shadow-none",
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
          <span className="opacity-60 ml-1">{counts[k] ?? 0}</span>
        </Button>
      ))}
    </div>
  );
}
