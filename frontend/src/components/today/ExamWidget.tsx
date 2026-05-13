import { Button } from "@cloudflare/kumo/components/button";
import { SparkleIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

import { daysBetween, longDate } from "../../utils/date";
import { ExamMenu } from "../exam/ExamMenu";

import type { ApiDashboardExam } from "../../lib/schema-types";

type Props = {
  exam: ApiDashboardExam;
};

export function ExamWidget({ exam }: Props) {
  const { t } = useTranslation();
  const today = format(new Date(), "yyyy-MM-dd");
  const examDays = daysBetween(today, exam.examDate);
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col gap-3.5 p-[22px_22px_24px] border border-rule rounded-[3px] bg-[linear-gradient(180deg,rgba(242,184,48,0.04),transparent_60%),var(--color-paper-2)]">
      <div className="relative mono text-[13px] uppercase text-amber flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:opacity-40 after:bg-[linear-gradient(90deg,var(--color-amber),transparent)]">
        {t("exam.nearestExam")}
      </div>
      <div className="relative display italic text-[32px] font-medium leading-none text-ink">
        {exam.name}
      </div>
      <div className="relative flex items-end gap-2.5">
        <span className="mono font-light text-[60px] leading-[0.9] text-amber">
          {examDays}
        </span>
        <p className="mono text-xs text-ink-muted uppercase">
          {examDays === 1 ? t("common.day") : t("common.days")}
          <br />
          {examDays === 1
            ? t("common.dayUntilDeadline")
            : t("common.daysUntilDeadline")}
        </p>
      </div>
      <div className="relative mono text-xs text-ink-muted mt-1.5 flex justify-between items-center pt-3 border-t border-dashed border-rule-strong">
        <span>
          {exam.subjectName ?? exam.subjectKey ?? ""} ·{" "}
          {longDate(exam.examDate)}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            shape="square"
            size="sm"
            aria-label={t("notes.note")}
            title={t("exam.generateNote")}
            icon={SparkleIcon}
            onClick={() =>
              navigate({
                to: "/note/new",
                search: {
                  topic: exam.name,
                  subject: exam.subjectName ?? exam.subjectKey ?? "",
                },
              })
            }
            className="text-ink-faint hover:text-amber hover:!bg-amber-wash"
          />
          <ExamMenu examId={exam.id} subjectKey={exam.subjectKey} />
        </div>
      </div>
    </div>
  );
}
