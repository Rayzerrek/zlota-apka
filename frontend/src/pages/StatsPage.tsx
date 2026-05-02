import { Chart } from "@cloudflare/kumo/components/chart";
import { PieChart as EChartsPieChart } from "echarts/charts";
import { TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useMemo } from "react";

import { PageHead } from "../components/layout/PageHead";
import { CARDS, STUDY_STATS, SUBJECT_RETENTION } from "../data/mock";
import { cn } from "../utils/cn";
import { SUBJECTS, SUBJECT_BG, SUBJECT_TEXT } from "../utils/subjects";

echarts.use([EChartsPieChart, TooltipComponent, CanvasRenderer]);

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

const matureFrac = mature / total;

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

export function StatsPage() {
  const donutOptions = useMemo(() => {
    function cssVar(name: string): string {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    }

    return {
      tooltip: {
        trigger: "item" as const,
        formatter: "{b}: {c} kart",
        backgroundColor: cssVar("--color-paper-3"),
        borderColor: cssVar("--color-rule-strong"),
        borderWidth: 1,
        textStyle: {
          fontFamily: cssVar("--font-mono"),
          fontSize: 12,
          color: cssVar("--color-ink"),
        },
      },
      series: [
        {
          type: "pie" as const,
          radius: ["51px", "65px"],
          center: ["50%", "50%"],
          startAngle: 90,
          data: [
            {
              name: "Opanowane",
              value: mature,
              itemStyle: { color: cssVar("--color-rating-4") },
            },
            {
              name: "W trakcie",
              value: young,
              itemStyle: { color: cssVar("--color-amber") },
            },
            {
              name: "Do zrobienia",
              value: dueOrNew,
              itemStyle: { color: cssVar("--color-ink-faint") },
            },
          ].filter((d) => d.value > 0),
          label: { show: false },
          emphasis: { scale: false },
        },
      ],
    };
  }, []);

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
            <em className="italic text-amber font-light">
              {STUDY_STATS.retentionPct}
            </em>
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
            <Chart echarts={echarts} options={donutOptions} height={160} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1">
              <span className="display font-light text-[28px] leading-none text-ink">
                {Math.round(matureFrac * 100)}%
              </span>
              <span className="mono text-[10px] uppercase text-ink-muted">
                OPANOWANE
              </span>
            </div>
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
          {SUBJECT_RETENTION.map(({ subject, pct }) => (
            <div key={subject} className="flex items-center gap-4">
              <div className="mono text-[13px] uppercase text-ink-muted w-24 shrink-0">
                {SUBJECTS[subject].name}
              </div>
              <div className="flex-1 h-2 bg-kumo-base rounded-sm overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-sm transition-all",
                    SUBJECT_BG[subject],
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div
                className={cn(
                  "mono text-[14px] w-10 text-right shrink-0",
                  SUBJECT_TEXT[subject],
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
