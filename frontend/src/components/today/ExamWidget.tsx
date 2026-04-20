import { TODAY } from "../../data/mock";
import { longDate, daysBetween } from "../../utils/date";
import { subjectName } from "../../utils/subjects";

import type { Exam } from "../../types";

type Props = {
  exam: Exam;
};

export function ExamWidget({ exam }: Props) {
  const examDays = daysBetween(TODAY, exam.dateISO);

  return (
    <div className="relative overflow-hidden flex flex-col gap-3.5 p-[22px_22px_24px] border border-rule rounded-[3px] bg-[linear-gradient(180deg,rgba(242,184,48,0.04),transparent_60%),var(--color-paper-2)]">
      <div className="relative mono text-[13px] tracking-[0.18em] uppercase text-amber flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:opacity-40 after:bg-[linear-gradient(90deg,var(--color-amber),transparent)]">
        Najbliższy sprawdzian
      </div>
      <div className="relative display italic text-[32px] font-medium leading-none text-ink">
        {exam.name}
      </div>
      <div className="relative flex items-end gap-2.5">
        <span className="mono font-light text-[60px] leading-[0.9] tracking-[-0.04em] text-amber">
          {examDays}
        </span>
        <p className="mono text-xs text-ink-muted tracking-[0.16em] uppercase">
          {examDays === 1 ? "dzień" : "dni"}
          <br />
          do terminu
        </p>
      </div>
      <div className="relative mono text-xs text-ink-muted mt-1.5 flex justify-between pt-3 border-t border-dashed border-rule-strong">
        <span>{subjectName(exam.subject)}</span>
        <span>{longDate(exam.dateISO)}</span>
      </div>
    </div>
  );
}
