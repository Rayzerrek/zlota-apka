import { Button } from "@cloudflare/kumo/components/button";
import { Pagination } from "@cloudflare/kumo/components/pagination";
import { PlusIcon, StackIcon } from "@phosphor-icons/react";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AddCardModal } from "../components/browse/AddCardModal";
import { BrowseCard } from "../components/browse/BrowseCard";
import { BrowseFilters, type Filter } from "../components/browse/BrowseFilters";
import { BrowseSearchBar } from "../components/browse/BrowseSearchBar";
import { CardDetailModal } from "../components/browse/CardDetailModal";
import { PageHead } from "../components/layout/PageHead";
import { useAllCards, useDeleteCard } from "../hooks/api/useCards";
import { adaptApiCardToCard } from "../lib/adapters";
import { SUBJECTS } from "../utils/subjects";

export function BrowsePage() {
  const { t } = useTranslation();
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
  const [selectedCard, setSelectedCard] = useState<
    (typeof cards)[number] | null
  >(null);

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
        <PageHead
          eyebrow={t("browse.eyebrow")}
          title={
            <>
              {t("browse.title").split("<em>")[0]}
              <em>{t("browse.title").match(/<em>(.*?)<\/em>/)?.[1]}</em>
            </>
          }
        />
        <div className="h-96 animate-pulse rounded-sm border border-rule bg-paper-2" />
      </>
    );
  }

  if (cards.length === 0) {
    return (
      <>
        <PageHead
          eyebrow={t("browse.eyebrow")}
          title={
            <>
              {t("browse.title").split("<em>")[0]}
              <em>{t("browse.title").match(/<em>(.*?)<\/em>/)?.[1]}</em>
            </>
          }
        />
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="w-20 h-20 rounded-full bg-amber-wash border border-amber/20 grid place-items-center">
            <StackIcon size={36} weight="duotone" className="text-amber" />
          </div>
          <div className="text-center max-w-sm">
            <h2 className="display text-[24px] text-ink mb-2">
              {t("browse.noCards")}
            </h2>
            <p className="text-[15px] text-ink-muted leading-relaxed">
              {t("browse.noCardsDescription")}
            </p>
          </div>
          <Button
            variant="outline"
            icon={PlusIcon}
            onClick={() => setAddCardOpen(true)}
            className="rounded-sm bg-amber border-amber text-paper hover:bg-[#ffcc4a] hover:border-[#ffcc4a] font-semibold"
          >
            {t("browse.addFirstCard")}
          </Button>
        </div>
        <AddCardModal
          open={addCardOpen}
          onClose={() => setAddCardOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow={t("browse.eyebrow")}
        title={
          <>
            {t("browse.title").split("<em>")[0]}
            <em>{t("browse.title").match(/<em>(.*?)<\/em>/)?.[1]}</em>
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
          {t("browse.addCard")}
        </Button>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
        {paginated.map((card) => (
          <BrowseCard
            key={card.id}
            card={card}
            onClick={() => setSelectedCard(card)}
            onDelete={() => deleteCard(card.id)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="py-16 text-center text-ink-faint display italic text-[25px]">
          {t("browse.nothingFound")}
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
            <Pagination.PageSize
              value={perPage}
              onChange={setPerPage}
              options={[12, 24, 48]}
              label={t("browse.perPage")}
            />
            <Pagination.Controls />
          </Pagination>
        </div>
      )}

      <AddCardModal open={addCardOpen} onClose={() => setAddCardOpen(false)} />
      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </>
  );
}
