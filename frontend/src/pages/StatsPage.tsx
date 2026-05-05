import { useMemo } from "react";

import { DonutChart } from "../components/charts/DonutChart";
import { PageHead } from "../components/layout/PageHead";
import { useAllCards } from "../hooks/api/useCards";
import { useStudyStats } from "../hooks/api/useStudyStats";
import { adaptApiCardToCard } from "../lib/adapters";
import { cn } from "../utils/cn";
import { SUBJECTS, SUBJECT_BG, SUBJECT_TEXT } from "../utils/subjects";

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function StatsPage() {
  const { data: apiCards, isLoading: cardsLoading } = useAllCards();
  const {
    retentionPct,
    streakDays,
    weekMinutes,
    totalCards,
    mature,
    young,
    subjectRetention,
    isLoading: statsLoading,
  } = useStudyStats();

  const cards = useMemo(
    () => (apiCards ?? []).map(adaptApiCardToCard),
    [apiCards],
  );
  const dueOrNew = cards.filter(
    (c) => c.stage === "new" || c.stage === "due",
  ).length;
  const total = cards.length;

  const legendItems = [
    {
      count: mature,
      label: "Dobrze opanowane",
      sub: "zapamiętasz je długo",
      bg: "bg-rating-4",
      text: "text-rating-4",
    },
    {
      count: young,
      label: "W trakcie nauki",
      sub: "powtarzaj regularnie",
      bg: "bg-amber",
      text: "text-amber",
    },
    {
      count: dueOrNew,
      label: "Czekają na Ciebie",
      sub: "zacznij dziś",
      bg: "bg-ink-faint",
      text: "text-ink-faint",
    },
  ];

  if (cardsLoading || statsLoading) {
    return (
      <>
        <PageHead eyebrow="Statystyki" title={<em>postęp</em>} />
        <div className="h-96 animate-pulse rounded-sm border border-rule bg-paper-2" />
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow="Statystyki"
        title={
          <>
            <em>postęp</em>
          </>
        }
        date="Aktualizacja dziś"
      />

      <div className="enter enter-d1 grid grid-cols-1 gap-6 pb-10 border-b border-rule mb-10 min-[800px]:grid-cols-[1.2fr_1fr] min-[800px]:gap-14 min-[800px]:items-end">
        <div>
          <div className="display font-light text-[clamp(140px,18vw,220px)] leading-[0.85] flex items-start gap-2">
            <em className="italic text-amber font-light">{retentionPct}</em>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className="eyebrow">Co to znaczy</span>
          <p className="text-ink-muted leading-relaxed">
            <strong className="text-ink">{retentionPct}%</strong> kart pamiętasz
            przy pierwszym podejściu. Cel to{" "}
            <strong className="text-ink">90%</strong> — im bliżej, tym mniej
            czasu tracisz na powtarzanie tych samych kart.
          </p>
          <div className="flex gap-6 pt-4 border-t border-dashed border-rule-strong mt-1">
            <div>
              <div className="display text-[31px] leading-none">
                {streakDays}
              </div>
              <div className="eyebrow text-[13px]">dni z rzędu</div>
            </div>
            <div>
              <div className="mono text-[31px] leading-none">
                {formatMinutes(weekMinutes)}
              </div>
              <div className="eyebrow text-[13px]">/ tydzień</div>
            </div>
            <div>
              <div className="mono text-[31px] leading-none">
                {mature}
                <span className="text-ink-faint text-[18px]">
                  /{totalCards}
                </span>
              </div>
              <div className="eyebrow text-[13px]">opanowanych</div>
            </div>
          </div>
        </div>
      </div>

      <section className="enter enter-d2 mb-10 pb-10 border-b border-rule">
        <div className="flex items-baseline justify-between gap-3 mb-8 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[25px] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber">01 —</span> Jak dobrze
            znasz karty
          </h2>
          <span className="mono text-[14px] uppercase text-ink-faint">
            {total} kart
          </span>
        </div>

        <div className="flex flex-col gap-10 min-[640px]:flex-row min-[640px]:items-center min-[640px]:gap-14">
          <div className="shrink-0 self-center relative w-40 h-40">
            <DonutChart
              data={[
                {
                  name: "Opanowane",
                  value: mature,
                  color: "var(--color-rating-4)",
                },
                {
                  name: "W trakcie",
                  value: young,
                  color: "var(--color-amber)",
                },
                {
                  name: "Do zrobienia",
                  value: dueOrNew,
                  color: "var(--color-ink-faint)",
                },
              ].filter((d) => d.value > 0)}
              size={160}
              stroke={14}
            />
          </div>

          <div className="flex flex-col gap-5 flex-1">
            {legendItems.map(({ count, label, sub, bg, text }) => (
              <div key={label} className="flex items-center gap-4">
                <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", bg)} />
                <div className="flex-1">
                  <div className="mono text-[13px] uppercase text-ink-muted">
                    {label}
                  </div>
                  <div className="mono text-[12px] text-ink-faint">{sub}</div>
                </div>
                <div className={cn("display text-[32px] leading-none", text)}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="enter enter-d3 mt-4">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[25px] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber">02 —</span> Z czego ci
            idzie najlepiej
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {subjectRetention.length === 0 && (
            <p className="text-ink-faint mono text-sm">
              Brak danych o retencji per przedmiot.
            </p>
          )}
          {subjectRetention.map(({ subject, pct }) => (
            <div key={subject} className="flex items-center gap-4">
              <div className="mono text-[13px] uppercase text-ink-muted w-24 shrink-0">
                {SUBJECTS[subject as keyof typeof SUBJECTS]?.name ?? subject}
              </div>
              <div className="flex-1 h-2 bg-kumo-base rounded-sm overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-sm transition-all",
                    SUBJECT_BG[subject as keyof typeof SUBJECT_BG],
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div
                className={cn(
                  "mono text-[14px] w-10 text-right shrink-0",
                  SUBJECT_TEXT[subject as keyof typeof SUBJECT_TEXT],
                )}
              >
                {pct}%
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
