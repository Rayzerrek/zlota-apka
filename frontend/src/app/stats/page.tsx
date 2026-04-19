import { PageHead } from "../../components/PageHead";
import {
  CARDS,
  HEATMAP,
  STUDY_STATS,
  SUBJECT_RETENTION,
} from "../../data/mock";
import { SUBJECTS } from "../../utils/subjects";

export function StatsPage() {
  const mature = CARDS.filter(
    (c) => c.stage === "review" && c.intervalDays >= 14,
  ).length;
  const young = CARDS.filter(
    (c) =>
      c.stage === "learning" || (c.stage === "review" && c.intervalDays < 14),
  ).length;
  const news = CARDS.filter(
    (c) => c.stage === "new" || c.stage === "due",
  ).length;

  return (
    <>
      <PageHead
        eyebrow="Statystyki"
        title={
          <>
            <em>asd</em>
          </>
        }
        date="Aktualizacja dziś"
      />

      <div className="grid grid-cols-1 gap-6 pb-10 border-b border-[var(--rule)] mb-10 min-[800px]:grid-cols-[1.2fr_1fr] min-[800px]:gap-14 min-[800px]:items-end enter enter-d1">
        <div>
          <div className="display font-light text-[clamp(140px,18vw,220px)] leading-[0.85] tracking-[-0.06em] text-[var(--ink)] flex items-start gap-2">
            <em className="italic text-[var(--amber)] font-light">
              {STUDY_STATS.retentionPct}
            </em>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className="eyebrow">Co to znaczy</span>
          <p className="text-[var(--ink-muted)] leading-relaxed">
            <strong className="text-[var(--ink)]">
              {STUDY_STATS.retentionPct}%
            </strong>{" "}
            kart oceniasz na poziomie 3 lub wyżej przy pierwszym podejściu,
            licząc z ostatnich 90 dni. Powyżej 85% — masz stabilną podstawę. Cel
            standardowy dla FSRS: <span className="mono">0.90</span>.
          </p>
          <div className="flex gap-6 pt-4 border-t border-dashed border-[var(--rule-strong)] mt-1">
            <div>
              <div className="display text-[28px] leading-none">
                {STUDY_STATS.streakDays}
              </div>
              <div className="eyebrow text-[10px]">seria</div>
            </div>
            <div>
              <div className="mono text-[28px] leading-none">
                {STUDY_STATS.weekMinutes}
              </div>
              <div className="eyebrow text-[10px]">min / tydzień</div>
            </div>
            <div>
              <div className="mono text-[28px] leading-none">
                {CARDS.length}
              </div>
              <div className="eyebrow text-[10px]">aktywnych kart</div>
            </div>
          </div>
        </div>
      </div>

      <section className="enter enter-d2">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-[var(--rule)]">
          <h2 className="display font-normal text-[22px] tracking-[-0.01em] text-[var(--ink)] flex items-baseline gap-3">
            <span className="mono text-xs text-[var(--amber)] tracking-[0.08em]">
              01 —
            </span>{" "}
            Etap kart
          </h2>
          <span className="mono text-[11px] tracking-[0.14em] uppercase text-[var(--ink-faint)]">
            łącznie {CARDS.length}
          </span>
        </div>
        <div className="grid grid-cols-3 border border-[var(--rule)] bg-[var(--paper-2)] mb-10">
          <div className="px-5 py-6 flex flex-col gap-1.5">
            <div className="display mono text-[40px] leading-none text-[var(--rating-4)]">
              {mature}
            </div>
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
              Dojrzałe
            </div>
            <div className="mono text-[11px] text-[var(--ink-faint)]">
              interwał ≥ 14 dni
            </div>
          </div>
          <div className="px-5 py-6 flex flex-col gap-1.5 border-l border-[var(--rule)]">
            <div className="display mono text-[40px] leading-none text-[var(--amber)]">
              {young}
            </div>
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
              Młode
            </div>
            <div className="mono text-[11px] text-[var(--ink-faint)]">
              w trakcie utrwalania
            </div>
          </div>
          <div className="px-5 py-6 flex flex-col gap-1.5 border-l border-[var(--rule)]">
            <div className="display mono text-[40px] leading-none text-[var(--sub-mat)]">
              {news}
            </div>
            <div className="mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-muted)]">
              Nowe / dzisiejsze
            </div>
            <div className="mono text-[11px] text-[var(--ink-faint)]">
              czekają na pierwszą powtórkę
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 enter enter-d3">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-[var(--rule)]">
          <h2 className="display font-normal text-[22px] tracking-[-0.01em] text-[var(--ink)] flex items-baseline gap-3">
            <span className="mono text-xs text-[var(--amber)] tracking-[0.08em]">
              02 —
            </span>{" "}
            Retencja wg przedmiotu
          </h2>
          <span className="mono text-[11px] tracking-[0.14em] uppercase text-[var(--ink-faint)]">
            ostatnie 30 dni
          </span>
        </div>
        <div className="flex flex-col">
          {SUBJECT_RETENTION.map((row) => (
            <div
              key={row.subject}
              className="grid grid-cols-[110px_1fr_60px] gap-4 items-center py-3.5 border-b border-[var(--rule)]"
            >
              <span className="display text-base flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: SUBJECTS[row.subject].color }}
                />
                {SUBJECTS[row.subject].name}
              </span>
              <span className="relative h-[6px] bg-[var(--rule)] rounded-sm overflow-hidden">
                <span
                  className="absolute left-0 top-0 bottom-0 rounded-sm transition-[width] duration-700"
                  style={{
                    width: `${row.pct}%`,
                    background: SUBJECTS[row.subject].color,
                  }}
                />
              </span>
              <span className="mono text-[13px] text-[var(--ink)] text-right">
                {row.pct}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 enter enter-d4">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-[var(--rule)]">
          <h2 className="display font-normal text-[22px] tracking-[-0.01em] text-[var(--ink)] flex items-baseline gap-3">
            <span className="mono text-xs text-[var(--amber)] tracking-[0.08em]">
              03 —
            </span>{" "}
            Aktywność — 180 dni
          </h2>
          <span className="mono text-[11px] tracking-[0.14em] uppercase text-[var(--ink-faint)]">
            1 kwadrat = 1 dzień
          </span>
        </div>
        <div className="grid grid-cols-[repeat(30,1fr)] gap-[3px] mt-5">
          {HEATMAP.map((level, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm transition-transform duration-[0.15s] relative hover:scale-125 hover:outline hover:outline-1 hover:outline-[var(--ink)]"
              data-level={level || undefined}
              title={`Dzień ${i + 1}: poziom ${level}`}
              style={{
                background:
                  level === 0
                    ? "var(--rule)"
                    : level === 1
                      ? "rgba(242, 184, 48, 0.18)"
                      : level === 2
                        ? "rgba(242, 184, 48, 0.35)"
                        : level === 3
                          ? "rgba(242, 184, 48, 0.6)"
                          : "var(--amber)",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2.5 mt-4 mono text-[10px] text-[var(--ink-faint)] tracking-[0.14em] uppercase">
          <span>mniej</span>
          <div className="flex gap-[3px]">
            {[
              "var(--rule)",
              "rgba(242, 184, 48, 0.18)",
              "rgba(242, 184, 48, 0.35)",
              "rgba(242, 184, 48, 0.6)",
              "var(--amber)",
            ].map((bg, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-sm"
                style={{ background: bg }}
              />
            ))}
          </div>
          <span>więcej</span>
        </div>
      </section>
    </>
  );
}
