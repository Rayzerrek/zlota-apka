import { cn } from "../../utils/cn";
import { dayNum, dayShort } from "../../utils/date";
import { SUBJECT_BG } from "../../utils/subjects";

import type { Exam, StudySession } from "../../types";

type Props = {
  days: string[];
  selected: string;
  onSelect: (iso: string) => void;
  today: string;
  exams: Exam[];
  sessions: StudySession[];
};

export function WeekGrid({
  days,
  selected,
  onSelect,
  today,
  exams,
  sessions,
}: Props) {
  return (
    <div className="grid grid-cols-7 gap-2 mb-10">
      {days.map((iso) => {
        const sessionsOfDay = sessions.filter((s) => s.dateISO === iso);
        const examOnDay = exams.find((e) => e.dateISO === iso);
        const uniqSubjects = Array.from(
          new Set(sessionsOfDay.map((s) => s.subject)),
        );
        const isToday = iso === today;
        const isSelected = iso === selected;
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className={cn(
              "relative overflow-hidden flex flex-col items-center gap-2.5 px-2.5 pt-3.5 pb-4 border rounded-xs cursor-pointer transition-all duration-200",
              isSelected
                ? "border-ink bg-paper-3"
                : isToday
                  ? "border-amber bg-amber-wash"
                  : "border-rule bg-paper-2 hover:border-rule-strong",
            )}
          >
            <span className="mono text-[13px] text-ink-faint uppercase">
              {dayShort(iso)}
            </span>
            <span
              className={cn(
                "display font-normal text-[27px] leading-none",
                isToday ? "text-amber italic" : "text-ink",
              )}
            >
              {dayNum(iso)}
            </span>
            <span className="flex gap-0.75 min-h-1.5">
              {uniqSubjects.slice(0, 5).map((s) => (
                <span
                  key={s}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full opacity-85",
                    SUBJECT_BG[s],
                  )}
                />
              ))}
              {examOnDay && (
                <span className="w-1.5 h-1.5 rounded-full opacity-85 bg-amber shadow-[0_0_6px_var(--color-amber)]" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
