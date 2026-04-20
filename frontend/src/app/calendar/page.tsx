import { Button } from "@cloudflare/kumo";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import {
  parseISO,
  format,
  addDays,
  startOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { useMemo, useState } from "react";

import { PageHead } from "../../components/PageHead";
import { EXAMS, SESSIONS, TODAY } from "../../data/mock";
import {
  dayLong,
  dayNum,
  dayShort,
  daysBetween,
  longDate,
} from "../../utils/date";
import { SUBJECTS, subjectName } from "../../utils/subjects";
import { cn } from "../../utils/utils";

function shiftWeek(iso: string, n: number): string {
  return format(addDays(parseISO(iso), n), "yyyy-MM-dd");
}

function weekDaysFrom(iso: string): string[] {
  const start = startOfWeek(parseISO(iso), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end: addDays(start, 6) }).map((d) =>
    format(d, "yyyy-MM-dd"),
  );
}

const upcomingExams = [...EXAMS]
  .filter((e) => e.dateISO >= TODAY)
  .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

export function CalendarPage() {
  const [weekAnchor, setWeekAnchor] = useState(TODAY);
  const [selected, setSelected] = useState(TODAY);

  const days = useMemo(() => weekDaysFrom(weekAnchor), [weekAnchor]);
  const selectedSessions = useMemo(
    () => SESSIONS.filter((s) => s.dateISO === selected),
    [selected],
  );

  return (
    <>
      <PageHead eyebrow="plan tygodniowy" />

      <div className="flex gap-2.5 mb-5 items-center justify-center">
        <Button
          variant="outline"
          icon={CaretLeftIcon}
          onClick={() => setWeekAnchor(shiftWeek(weekAnchor, -7))}
          className="rounded-sm ring-rule-strong text-ink hover:ring-amber hover:text-amber"
        >
          Poprzedni
        </Button>
        <Button
          variant="outline"
          onClick={() => setWeekAnchor(TODAY)}
          className="rounded-sm ring-rule-strong text-ink hover:ring-amber hover:text-amber"
        >
          Dziś
        </Button>
        <Button
          variant="outline"
          onClick={() => setWeekAnchor(shiftWeek(weekAnchor, 7))}
          className="rounded-sm ring-rule-strong text-ink hover:ring-amber hover:text-amber"
        >
          Następny
          <CaretRightIcon size={14} />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-10">
        {days.map((iso, idx) => {
          const sessionsOfDay = SESSIONS.filter((s) => s.dateISO === iso);
          const examOnDay = EXAMS.find((e) => e.dateISO === iso);
          const uniqSubjects = Array.from(
            new Set(sessionsOfDay.map((s) => s.subject)),
          );
          const isToday = iso === TODAY;
          const isSelected = iso === selected;
          return (
            <button
              key={iso}
              type="button"
              style={{ animationDelay: `${0.04 * idx}s` }}
              onClick={() => setSelected(iso)}
              className={cn(
                "enter relative overflow-hidden flex flex-col items-center gap-2.5 px-2.5 pt-3.5 pb-4 border rounded-[2px] cursor-pointer transition-all duration-200",
                isSelected
                  ? "border-ink bg-paper-3"
                  : isToday
                    ? "border-amber bg-amber-wash"
                    : "border-rule bg-paper-2 hover:border-rule-strong",
              )}
            >
              <span className="mono text-[10px] tracking-[0.14em] text-ink-faint uppercase">
                {dayShort(iso)}
              </span>
              <span
                className={cn(
                  "display font-normal text-[24px] leading-none",
                  isToday ? "text-amber italic" : "text-ink",
                )}
              >
                {dayNum(iso)}
              </span>
              <span className="flex gap-[3px] min-h-[6px]">
                {uniqSubjects.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="w-[6px] h-[6px] rounded-full opacity-85"
                    style={{ background: SUBJECTS[s].color }}
                  />
                ))}
                {examOnDay && (
                  <span
                    className="w-[6px] h-[6px] rounded-full opacity-85"
                    style={{
                      background: "var(--color-amber)",
                      boxShadow: "0 0 6px var(--color-amber)",
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <section className="mt-6">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[22px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.08em]">
              02 —
            </span>{" "}
            {dayLong(selected)}
          </h2>
          <span className="mono text-[11px] tracking-[0.14em] uppercase text-ink-faint">
            {selectedSessions.length === 0
              ? "Brak zaplanowanych sesji"
              : `${selectedSessions.length} sesji`}
          </span>
        </div>

        {selectedSessions.length === 0 ? (
          <div className="py-8 text-ink-faint display italic text-2xl">
            dzień wolny — złap oddech.
          </div>
        ) : (
          selectedSessions.map((s, idx) => {
            const subj = SUBJECTS[s.subject];
            return (
              <div
                key={s.id}
                className="enter grid grid-cols-[52px_1fr_auto] gap-5 items-center py-[18px] px-1 border-b border-rule"
                style={{ animationDelay: `${0.1 + idx * 0.04}s` }}
              >
                <span
                  className={cn(
                    "mono text-[13px] tracking-[0.04em]",
                    s.done ? "text-ink-faint" : "text-ink-muted",
                  )}
                >
                  {s.timeOfDay}
                </span>
                <span className="flex flex-col gap-1 min-w-0">
                  <span className="flex items-center gap-2 mono text-[10px] tracking-[0.2em] uppercase text-ink-muted">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: subj.color }}
                    />
                    {subj.name}
                  </span>
                  <span
                    className={cn(
                      "display font-normal text-[18px] leading-[1.2] tracking-[-0.005em]",
                      s.done
                        ? "line-through decoration-rule-strong decoration-[1px] text-ink-faint"
                        : "text-ink",
                    )}
                  >
                    {s.topic}
                  </span>
                </span>
                <span className="mono text-sm text-ink flex items-center gap-2.5">
                  <span className="text-ink-faint">
                    {s.cardIds.length} kart
                  </span>
                </span>
              </div>
            );
          })
        )}
      </section>

      <section className="mt-16">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[22px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.08em]">
              03 —
            </span>{" "}
            Sprawdziany na horyzoncie
          </h2>
          <span className="mono text-[11px] tracking-[0.14em] uppercase text-ink-faint">
            {upcomingExams.length} terminów
          </span>
        </div>
        <div className="flex flex-col">
          {upcomingExams.map((e, idx) => {
            const daysUntil = daysBetween(TODAY, e.dateISO);
            const near = daysUntil <= 7;
            return (
              <div
                key={e.id}
                className="enter grid grid-cols-[80px_1fr_auto] gap-5 items-center py-5 border-b border-rule"
                style={{ animationDelay: `${0.2 + idx * 0.05}s` }}
              >
                <div
                  className={cn(
                    "display font-normal text-[44px] leading-none tracking-[-0.02em] text-right",
                    near ? "italic text-amber" : "not-italic text-ink-muted",
                  )}
                >
                  {daysUntil}
                </div>
                <div>
                  <div className="display text-[18px] leading-[1.2] text-ink">
                    {e.name}
                  </div>
                  <div className="mono text-[11px] text-ink-faint tracking-[0.12em] uppercase mt-1">
                    {subjectName(e.subject)} · {longDate(e.dateISO)}
                  </div>
                </div>
                <div className="mono text-xs text-ink-muted text-right">
                  <div>waga</div>
                  <div className="text-ink text-lg mt-0.5">{e.weight}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
