import { useMemo, useState } from "react";

import { BrowseCard } from "../components/browse/BrowseCard";
import { BrowseFilters, type Filter } from "../components/browse/BrowseFilters";
import { BrowseSearchBar } from "../components/browse/BrowseSearchBar";
import { PageHead } from "../components/layout/PageHead";
import { CARDS } from "../data/mock";

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
        eyebrow="Okej"
        title={
          <>
            <span>Cos</span>
          </>
        }
      />

      <BrowseSearchBar value={q} onChange={setQ} resultCount={visible.length} />

      <BrowseFilters
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
        {visible.map((card, idx) => (
          <BrowseCard key={card.id} card={card} idx={idx} />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="py-16 text-center text-ink-faint display italic text-[25px]">
          nic nie znaleziono.
        </div>
      )}
    </>
  );
}
