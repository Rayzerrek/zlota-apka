import { Button } from "@cloudflare/kumo/components/button";
import { PlusIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { AddCardModal } from "../components/browse/AddCardModal";
import { BrowseCard } from "../components/browse/BrowseCard";
import { BrowseFilters, type Filter } from "../components/browse/BrowseFilters";
import { BrowseSearchBar } from "../components/browse/BrowseSearchBar";
import { PageHead } from "../components/layout/PageHead";
import { useAllCards, useDeleteCard } from "../hooks/api/useCards";
import { adaptApiCardToCard } from "../lib/adapters";

export function BrowsePage() {
  const { data: apiCards, isLoading } = useAllCards();
  const { mutate: deleteCard } = useDeleteCard();
  const [addCardOpen, setAddCardOpen] = useState(false);
  const cards = useMemo(
    () => (apiCards ?? []).map(adaptApiCardToCard),
    [apiCards],
  );

  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const out: Record<string, number> = { all: cards.length };
    for (const c of cards) out[c.subject] = (out[c.subject] || 0) + 1;
    return out;
  }, [cards]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return cards.filter((c) => {
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
  }, [cards, filter, q]);

  if (isLoading) {
    return (
      <>
        <PageHead eyebrow="Okej" title={<em>Cos</em>} />
        <div className="h-96 animate-pulse rounded-sm border border-rule bg-paper-2" />
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="Okej"
        title={
          <>
            <em>Cos</em>
          </>
        }
      />

      <BrowseSearchBar value={q} onChange={setQ} resultCount={visible.length} />

      <BrowseFilters
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />

      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          icon={PlusIcon}
          onClick={() => setAddCardOpen(true)}
          className="rounded-sm"
        >
          Dodaj fiszkę
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
        {visible.map((card) => (
          <BrowseCard
            key={card.id}
            card={card}
            onDelete={() => deleteCard(card.id)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="py-16 text-center text-ink-faint display italic text-[25px]">
          nic nie znaleziono.
        </div>
      )}

      <AddCardModal open={addCardOpen} onClose={() => setAddCardOpen(false)} />
    </>
  );
}
