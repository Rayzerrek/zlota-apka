import { PageHead } from "../components/layout/PageHead";
import { CARDS, STUDY_STATS, SUBJECT_RETENTION } from "../data/mock";
import { SUBJECTS } from "../utils/subjects";

const { mature, young } = STUDY_STATS;
const dueOrNew = CARDS.filter(
  (c) => c.stage === "new" || c.stage === "due",
).length;
const total = CARDS.length;

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function retentionLabel(pct: number): { text: string; color: string } {
  if (pct >= 90)
    return { text: "Świetny wynik!", color: "var(--color-rating-4)" };
  if (pct >= 85)
    return {
      text: "Dobry poziom — blisko celu",
      color: "var(--color-rating-3)",
    };
  if (pct >= 70)
    return {
      text: "Dobry start — ucz się regularnie",
      color: "var(--color-amber)",
    };
  return {
    text: "Poniżej normy — warto powtórzyć materiał",
    color: "var(--color-rating-1)",
  };
}

const retentionStatus = retentionLabel(STUDY_STATS.retentionPct);

const CX = 80;
const CY = 80;
const R = 58;
const SW = 14;
const CIRC = 2 * Math.PI * R;

type DonutSegmentProps = {
  fraction: number;
  rotateOffset: number;
  color: string;
};

function DonutSegment({ fraction, rotateOffset, color }: DonutSegmentProps) {
  const dash = fraction * CIRC;
  return (
    <circle
      cx={CX}
      cy={CY}
      r={R}
      fill="none"
      stroke={color}
      strokeWidth={SW}
      strokeDasharray={`${dash} ${CIRC - dash}`}
      strokeDashoffset={CIRC * 0.25}
      strokeLinecap="butt"
      transform={`rotate(${rotateOffset * 360} ${CX} ${CY})`}
    />
  );
}

const matureFrac = mature / total;
const youngFrac = young / total;
const pendingFrac = dueOrNew / total;

export function StatsPage() {
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

      {/* Hero — retencja */}
      <div className="enter enter-d1 grid grid-cols-1 gap-6 pb-10 border-b border-rule mb-10 min-[800px]:grid-cols-[1.2fr_1fr] min-[800px]:gap-14 min-[800px]:items-end">
        <div>
          <div className="display font-light text-[clamp(140px,18vw,220px)] leading-[0.85] tracking-[-0.06em] flex items-start gap-2">
            <em className="italic text-amber font-light">
              {STUDY_STATS.retentionPct}
            </em>
            <span className="text-[clamp(50px,6vw,80px)] text-ink-muted mt-4">
              %
            </span>
          </div>
          <div
            className="mono text-[13px] tracking-[0.1em] uppercase mt-3"
            style={{ color: retentionStatus.color }}
          >
            {retentionStatus.text}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <span className="eyebrow">Co to znaczy</span>
          <p className="text-ink-muted leading-relaxed">
            <strong className="text-ink">{STUDY_STATS.retentionPct}%</strong>{" "}
            kart pamiętasz przy pierwszym podejściu. Cel to{" "}
            <strong className="text-ink">90%</strong> — im bliżej, tym mniej
            czasu tracisz na powtarzanie tych samych kart.
          </p>
          <div className="flex gap-6 pt-4 border-t border-dashed border-rule-strong mt-1">
            <div>
              <div className="display text-[31px] leading-none">
                {STUDY_STATS.streakDays}
              </div>
              <div className="eyebrow text-[13px]">dni z rzędu</div>
            </div>
            <div>
              <div className="mono text-[31px] leading-none">
                {formatMinutes(STUDY_STATS.weekMinutes)}
              </div>
              <div className="eyebrow text-[13px]">/ tydzień</div>
            </div>
            <div>
              <div className="mono text-[31px] leading-none">
                {mature}
                <span className="text-ink-faint text-[18px]">/{total}</span>
              </div>
              <div className="eyebrow text-[13px]">opanowanych</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sekcja 01 — Etap kart */}
      <section className="enter enter-d2 mb-10 pb-10 border-b border-rule">
        <div className="flex items-baseline justify-between gap-3 mb-8 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[25px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.08em]">
              01 —
            </span>{" "}
            Jak dobrze znasz karty
          </h2>
          <span className="mono text-[14px] tracking-[0.14em] uppercase text-ink-faint">
            {total} kart
          </span>
        </div>

        <div className="flex flex-col gap-10 min-[640px]:flex-row min-[640px]:items-center min-[640px]:gap-14">
          {/* Donut chart */}
          <div className="shrink-0 self-center">
            <svg width="160" height="160" viewBox="0 0 160 160">
              {/* Track */}
              <circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="var(--color-rule)"
                strokeWidth={SW}
              />
              {pendingFrac > 0 && (
                <DonutSegment
                  fraction={pendingFrac}
                  rotateOffset={matureFrac + youngFrac}
                  color="var(--color-ink-faint)"
                />
              )}
              {youngFrac > 0 && (
                <DonutSegment
                  fraction={youngFrac}
                  rotateOffset={matureFrac}
                  color="var(--color-amber)"
                />
              )}
              {matureFrac > 0 && (
                <DonutSegment
                  fraction={matureFrac}
                  rotateOffset={0}
                  color="var(--color-rating-4)"
                />
              )}
              {/* Center label */}
              <text
                x={CX}
                y={CY - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="28"
                fontWeight="300"
                fill="var(--color-ink)"
                fontFamily="var(--font-display)"
              >
                {Math.round(matureFrac * 100)}%
              </text>
              <text
                x={CX}
                y={CY + 18}
                textAnchor="middle"
                fontSize="10"
                letterSpacing="0.12em"
                fill="var(--color-ink-muted)"
                fontFamily="var(--font-mono)"
              >
                OPANOWANE
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-5 flex-1">
            {[
              {
                count: mature,
                label: "Dobrze opanowane",
                sub: "zapamiętasz je długo",
                color: "var(--color-rating-4)",
              },
              {
                count: young,
                label: "W trakcie nauki",
                sub: "powtarzaj regularnie",
                color: "var(--color-amber)",
              },
              {
                count: dueOrNew,
                label: "Czekają na Ciebie",
                sub: "zacznij dziś",
                color: "var(--color-ink-faint)",
              },
            ].map(({ count, label, sub, color }) => (
              <div key={label} className="flex items-center gap-4">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <div className="flex-1">
                  <div className="mono text-[13px] tracking-[0.12em] uppercase text-ink-muted">
                    {label}
                  </div>
                  <div className="mono text-[12px] text-ink-faint">{sub}</div>
                </div>
                <div
                  className="display text-[32px] leading-none"
                  style={{ color }}
                >
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sekcja 02 — Retencja per przedmiot */}
      <section className="enter enter-d3 mt-4">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[25px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.08em]">
              02 —
            </span>{" "}
            Z czego ci idzie najlepiej
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {SUBJECT_RETENTION.map(({ subject, pct }) => (
            <div key={subject} className="flex items-center gap-4">
              <div className="mono text-[13px] tracking-[0.08em] uppercase text-ink-muted w-24 shrink-0">
                {SUBJECTS[subject].name}
              </div>
              <div className="flex-1 h-2 bg-paper-2 rounded-sm overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all"
                  style={{
                    width: `${pct}%`,
                    background: SUBJECTS[subject].color,
                  }}
                />
              </div>
              <div
                className="mono text-[14px] w-10 text-right shrink-0"
                style={{ color: SUBJECTS[subject].color }}
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
