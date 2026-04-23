import { useMemo } from "react";

import { PageHead } from "../components/layout/PageHead";
import { ExamWidget } from "../components/today/ExamWidget";
import { SessionList } from "../components/today/SessionList";
import { TodayHero } from "../components/today/TodayHero";
import { TodayStats } from "../components/today/TodayStats";
import { EXAMS, SESSIONS, TODAY } from "../data/mock";
import { dayLong, longDate } from "../utils/date";

type Props = {
  onStart: () => void;
  onOpenSession: (id: string) => void;
};

export function TodayPage({ onStart, onOpenSession }: Props) {
  const todaySessions = useMemo(
    () => SESSIONS.filter((s) => s.dateISO === TODAY),
    [],
  );
  const nextExam = useMemo(
    () =>
      [...EXAMS]
        .filter((e) => e.dateISO >= TODAY)
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO))[0],
    [],
  );

  return (
    <>
      <PageHead
        eyebrow={`${dayLong(TODAY)} · ${longDate(TODAY)}`}
        title={
          <>
            <span className="text-amber">Hello</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1.3fr_1fr] min-[900px]:gap-14">
        <TodayHero onStart={onStart} />

        <aside className="flex flex-col gap-7">
          {nextExam && <ExamWidget exam={nextExam} />}
          <TodayStats />
        </aside>
      </div>

      <SessionList sessions={todaySessions} onOpenSession={onOpenSession} />
    </>
  );
}
