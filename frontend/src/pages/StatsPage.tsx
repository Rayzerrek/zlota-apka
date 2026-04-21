import { PageHead } from "../components/layout/PageHead";
import { CARDS, HEATMAP, STUDY_STATS } from "../data/mock";

const { mature, young } = STUDY_STATS;
const dueOrNew = CARDS.filter(
  (c) => c.stage === "new" || c.stage === "due",
).length;

export function StatsPage() {
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

      <div className="enter enter-d1 grid grid-cols-1 gap-6 pb-10 border-b border-rule mb-10 min-[800px]:grid-cols-[1.2fr_1fr] min-[800px]:gap-14 min-[800px]:items-end">
        <div>
          <div className="display font-light text-[clamp(140px,18vw,220px)] leading-[0.85] tracking-[-0.06em] text-ink flex items-start gap-2">
            <em className="italic text-amber font-light">
              {STUDY_STATS.retentionPct}
            </em>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className="eyebrow">Co to znaczy</span>
          <p className="text-ink-muted leading-relaxed">
            <strong className="text-ink">{STUDY_STATS.retentionPct}%</strong>{" "}
            kart oceniasz na poziomie 3 lub wyżej przy pierwszym podejściu,
            licząc z ostatnich 90 dni. Powyżej 85% — masz stabilną podstawę. Cel
            standardowy dla FSRS: <span className="mono">0.90</span>.
          </p>
          <div className="flex gap-6 pt-4 border-t border-dashed border-rule-strong mt-1">
            <div>
              <div className="display text-[31px] leading-none">
                {STUDY_STATS.streakDays}
              </div>
              <div className="eyebrow text-[13px]">seria</div>
            </div>
            <div>
              <div className="mono text-[31px] leading-none">
                {STUDY_STATS.weekMinutes}
              </div>
              <div className="eyebrow text-[13px]">min / tydzień</div>
            </div>
            <div>
              <div className="mono text-[31px] leading-none">
                {CARDS.length}
              </div>
              <div className="eyebrow text-[13px]">aktywnych kart</div>
            </div>
          </div>
        </div>
      </div>

      <section className="enter enter-d2">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[25px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.08em]">
              01 —
            </span>{" "}
            Etap kart
          </h2>
          <span className="mono text-[14px] tracking-[0.14em] uppercase text-ink-faint">
            łącznie {CARDS.length}
          </span>
        </div>
        <div className="grid grid-cols-3 border border-rule bg-paper-2 mb-10">
          <div className="px-5 py-6 flex flex-col gap-1.5">
            <div className="display mono text-[43px] leading-none text-rating-4">
              {mature}
            </div>
            <div className="mono text-[13px] tracking-[0.16em] uppercase text-ink-muted">
              Dojrzałe
            </div>
            <div className="mono text-[14px] text-ink-faint">
              interwał ≥ 14 dni
            </div>
          </div>
          <div className="px-5 py-6 flex flex-col gap-1.5 border-l border-rule">
            <div className="display mono text-[43px] leading-none text-amber">
              {young}
            </div>
            <div className="mono text-[13px] tracking-[0.16em] uppercase text-ink-muted">
              Młode
            </div>
            <div className="mono text-[14px] text-ink-faint">
              w trakcie utrwalania
            </div>
          </div>
          <div className="px-5 py-6 flex flex-col gap-1.5 border-l border-rule">
            <div className="display mono text-[43px] leading-none text-sub-mat">
              {dueOrNew}
            </div>
            <div className="mono text-[13px] tracking-[0.16em] uppercase text-ink-muted">
              Nowe / dzisiejsze
            </div>
            <div className="mono text-[14px] text-ink-faint">
              czekają na pierwszą powtórkę
            </div>
          </div>
        </div>
      </section>

      <section className="enter enter-d3 mt-16">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[25px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.08em]">
              02 —
            </span>{" "}
            Aktywność — 180 dni
          </h2>
          <span className="mono text-[14px] tracking-[0.14em] uppercase text-ink-faint">
            1 kwadrat = 1 dzień
          </span>
        </div>
        <div className="grid grid-cols-[repeat(30,1fr)] gap-[3px] mt-5">
          {HEATMAP.map((level, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm transition-transform duration-[0.15s] relative hover:scale-125 hover:outline hover:outline-1 hover:outline-ink"
              title={`Dzień ${i + 1}: poziom ${level}`}
              style={{
                background:
                  level === 0
                    ? "var(--color-rule)"
                    : level === 1
                      ? "rgba(242, 184, 48, 0.18)"
                      : level === 2
                        ? "rgba(242, 184, 48, 0.35)"
                        : level === 3
                          ? "rgba(242, 184, 48, 0.6)"
                          : "var(--color-amber)",
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2.5 mt-4 mono text-[13px] text-ink-faint tracking-[0.14em] uppercase">
          <span>mniej</span>
          <div className="flex gap-[3px]">
            {[
              "var(--color-rule)",
              "rgba(242, 184, 48, 0.18)",
              "rgba(242, 184, 48, 0.35)",
              "rgba(242, 184, 48, 0.6)",
              "var(--color-amber)",
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
