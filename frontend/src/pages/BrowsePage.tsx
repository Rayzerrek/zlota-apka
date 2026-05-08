import { Button } from "@cloudflare/kumo/components/button";
import { Pagination } from "@cloudflare/kumo/components/pagination";
import { PlusIcon } from "@phosphor-icons/react";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AddCardModal } from "../components/browse/AddCardModal";
import { BrowseCard } from "../components/browse/BrowseCard";
import { BrowseFilters, type Filter } from "../components/browse/BrowseFilters";
import { BrowseSearchBar } from "../components/browse/BrowseSearchBar";
import { PageHead } from "../components/layout/PageHead";
import { useAllCards, useDeleteCard } from "../hooks/api/useCards";
import { adaptApiCardToCard } from "../lib/adapters";
import { SUBJECTS } from "../utils/subjects";

export function BrowsePage() {
  const search = useSearch({ strict: false }) as { subject?: string };
  const { data: apiCards, isLoading } = useAllCards();
  const { mutate: deleteCard } = useDeleteCard();
  const [addCardOpen, setAddCardOpen] = useState(false);
  const cards = useMemo(
    () => (apiCards ?? []).map(adaptApiCardToCard),
    [apiCards],
  );

  const initialFilter: Filter =
    search.subject && search.subject in SUBJECTS
      ? (search.subject as Filter)
      : "all";

  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

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

  useEffect(() => {
    setPage(1);
  }, [filter, q]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return visible.slice(start, start + perPage);
  }, [visible, page, perPage]);

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
        {paginated.map((card) => (
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

      {visible.length > perPage && (
        <div className="mt-6">
          <Pagination
            page={page}
            setPage={setPage}
            perPage={perPage}
            totalCount={visible.length}
          >
            <Pagination.Info>
              {({ pageShowingRange }) => (
                <span className="mono text-[13px] text-ink-muted">
                  {pageShowingRange} z {visible.length}
                </span>
              )}
            </Pagination.Info>
            <Pagination.Separator />
            <Pagination.PageSize
              value={perPage}
              onChange={setPerPage}
              options={[12, 24, 48]}
              label="Na stronie:"
            />
            <Pagination.Separator />
            <Pagination.Controls />
          </Pagination>
        </div>
      )}

      <AddCardModal open={addCardOpen} onClose={() => setAddCardOpen(false)} />
    </>
  );
}
