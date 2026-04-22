import { cn } from "../../utils/cn";
import { dayLong } from "../../utils/date";
import { SUBJECT_BG, SUBJECTS } from "../../utils/subjects";

import type { StudySession } from "../../types";

type Props = {
  selected: string;
  sessions: StudySession[];
};

export function DayDetail({ selected, sessions }: Props) {
  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
        <h2 className="display font-normal text-[25px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
          <span className="mono text-xs text-amber tracking-[0.08em]">
            02 —
          </span>{" "}
          {dayLong(selected)}
        </h2>
        <span className="mono text-[14px] tracking-[0.14em] uppercase text-ink-faint">
          {sessions.length === 0
            ? "Brak zaplanowanych sesji"
            : `${sessions.length} sesji`}
        </span>
      </div>

      {sessions.length === 0 ? (
        <div className="py-8 text-ink-faint display italic text-2xl">
          dzień wolny — złap oddech.
        </div>
      ) : (
        sessions.map((s, idx) => {
          const subj = SUBJECTS[s.subject];
          return (
            <div
              key={s.id}
              className="enter grid grid-cols-[52px_1fr_auto] gap-5 items-center py-[18px] px-1 border-b border-rule"
              style={{ animationDelay: `${0.1 + idx * 0.04}s` }}
            >
              <span
                className={cn(
                  "mono text-[16px] tracking-[0.04em]",
                  s.done ? "text-ink-faint" : "text-ink-muted",
                )}
              >
                {s.timeOfDay}
              </span>
              <span className="flex flex-col gap-1 min-w-0">
                <span className="flex items-center gap-2 mono text-[13px] tracking-[0.2em] uppercase text-ink-muted">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      SUBJECT_BG[s.subject],
                    )}
                  />
                  {subj.name}
                </span>
                <span
                  className={cn(
                    "display font-normal text-[21px] leading-[1.2] tracking-[-0.005em]",
                    s.done
                      ? "line-through decoration-rule-strong decoration-[1px] text-ink-faint"
                      : "text-ink",
                  )}
                >
                  {s.topic}
                </span>
              </span>
              <span className="mono text-sm text-ink flex items-center gap-2.5">
                <span className="text-ink-faint">{s.cardIds.length} kart</span>
              </span>
            </div>
          );
        })
      )}
    </section>
  );
}
