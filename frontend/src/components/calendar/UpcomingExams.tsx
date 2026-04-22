import { NotePencilIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router";

import { TODAY } from "../../data/mock";
import { cn } from "../../utils/cn";
import { daysBetween, longDate } from "../../utils/date";
import { subjectName } from "../../utils/subjects";
import { ExamMenu } from "../exam/ExamMenu";

import type { Exam } from "../../types";

type Props = {
  exams: Exam[];
};

export function UpcomingExams({ exams }: Props) {
  const navigate = useNavigate();

  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
        <h2 className="display font-normal text-[25px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
          <span className="mono text-xs text-amber tracking-[0.08em]">
            03 —
          </span>{" "}
          Sprawdziany na horyzoncie
        </h2>
        <span className="mono text-[14px] tracking-[0.14em] uppercase text-ink-faint">
          {exams.length} terminów
        </span>
      </div>
      <div className="flex flex-col">
        {exams.map((e, idx) => {
          const daysUntil = daysBetween(TODAY, e.dateISO);
          const near = daysUntil <= 7;
          return (
            <div
              key={e.id}
              className="enter grid grid-cols-[80px_1fr_auto_auto] gap-5 items-center py-5 border-b border-rule"
              style={{ animationDelay: `${0.2 + idx * 0.05}s` }}
            >
              <div
                className={cn(
                  "display font-normal text-[47px] leading-none tracking-[-0.02em] text-right",
                  near ? "italic text-amber" : "not-italic text-ink-muted",
                )}
              >
                {daysUntil}
              </div>
              <div>
                <div className="display text-[21px] leading-[1.2] text-ink">
                  {e.name}
                </div>
                <div className="mono text-[14px] text-ink-faint tracking-[0.12em] uppercase mt-1">
                  {subjectName(e.subject)} · {longDate(e.dateISO)}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Wygeneruj notatkę"
                  onClick={() => navigate(`/notes/${e.id}`)}
                  className="w-7 h-7 flex items-center justify-center rounded-[3px] text-ink-faint hover:text-amber hover:bg-amber-wash transition-colors"
                >
                  <NotePencilIcon size={16} />
                </button>
                <ExamMenu examId={e.id} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
