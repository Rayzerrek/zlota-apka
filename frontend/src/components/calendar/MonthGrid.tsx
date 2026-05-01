import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { pl } from "date-fns/locale";

import { cn } from "../../utils/cn";
import { SUBJECT_BG } from "../../utils/subjects";

import type { Exam, StudySession, SubjectKey } from "../../types";

type Props = {
  anchor: string;
  selected: string;
  today: string;
  exams: Exam[];
  sessions: StudySession[];
  onSelect: (iso: string) => void;
};

export function MonthGrid({
  anchor,
  selected,
  today,
  exams,
  sessions,
  onSelect,
}: Props) {
  const d = parseISO(anchor);
  const monthStart = startOfMonth(d);
  const monthEnd = endOfMonth(d);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const dayHeaders = eachDayOfInterval({
    start: calStart,
    end: endOfWeek(calStart, { weekStartsOn: 1 }),
  }).map((day) => format(day, "EEEEEE", { locale: pl }));

  const examMap = new Map(exams.map((e) => [e.dateISO, e]));
  const sessionMap = new Map<string, Set<string>>();
  for (const s of sessions) {
    const set = sessionMap.get(s.dateISO) ?? new Set();
    set.add(s.subject);
    sessionMap.set(s.dateISO, set);
  }

  return (
    <div className="month-grid animate-month-expand">
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {dayHeaders.map((h) => (
          <div
            key={h}
            className="mono text-[11px] uppercase text-ink-faint text-center py-1.5"
          >
            {h}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((day, idx) => {
          const iso = format(day, "yyyy-MM-dd");
          const isCurrentMonth = day >= monthStart && day <= monthEnd;
          const isToday = iso === today;
          const isSelected = iso === selected;
          const exam = examMap.get(iso);
          const subs = sessionMap.get(iso);
          const subjArray = subs ? Array.from(subs) : [];

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 px-2 py-3.5 rounded-sm cursor-pointer transition-all duration-200 border border-transparent",
                "hover:border-rule-strong hover:bg-paper-3",
                !isCurrentMonth && "opacity-25 pointer-events-none",
                isSelected && "border-amber bg-amber-wash",
                !isSelected &&
                  isToday &&
                  "border-amber/40 bg-amber-wash/50 ring-1 ring-amber/20",
              )}
              style={{ animationDelay: `${0.02 + idx * 0.01}s` }}
            >
              <span
                className={cn(
                  "mono text-[13px] leading-none",
                  isToday && !isSelected
                    ? "text-amber"
                    : isSelected
                      ? "text-amber"
                      : "text-ink-muted",
                )}
              >
                {day.getDate()}
              </span>

              {exam && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="w-1 h-1 rounded-full bg-amber shadow-[0_0_5px_var(--color-amber)]" />
                  <span className="mono text-[9px] text-amber leading-none max-w-10 truncate">
                    {exam.name.length > 12
                      ? exam.name.slice(0, 12) + "…"
                      : exam.name}
                  </span>
                </div>
              )}

              {subjArray.length > 0 && !exam && (
                <span className="flex gap-0.5 mt-0.5 min-h-1">
                  {subjArray.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className={cn(
                        "w-1 h-1 rounded-full opacity-60",
                        SUBJECT_BG[s as SubjectKey],
                      )}
                    />
                  ))}
                </span>
              )}

              {!exam && subjArray.length === 0 && (
                <span className="mt-0.5 min-h-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
