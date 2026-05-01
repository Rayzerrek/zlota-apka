import { useState } from "react";

import { AddExamModal } from "../components/exam/AddExamModal";
import { PageHead } from "../components/layout/PageHead";
import { ExamWidget } from "../components/today/ExamWidget";
import { SessionList } from "../components/today/SessionList";
import { TodayHero } from "../components/today/TodayHero";
import { TodayStats } from "../components/today/TodayStats";
import { useDashboard } from "../hooks/api";
import { dayLong, longDate } from "../utils/date";

type Props = {
  onStart: () => void;
  onStartSession: (id: string) => void;
};

export function TodayPage({ onStart, onStartSession }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [addExamOpen, setAddExamOpen] = useState(false);
  const { data: dashboard, isLoading, error } = useDashboard();

  const todaySessions = dashboard?.today ?? [];
  const nextExam = dashboard?.upcomingExams[0] ?? null;

  return (
    <>
      <PageHead
        eyebrow={`${dayLong(today)} · ${longDate(today)}`}
        title={
          <>
            <span className="text-amber">Hello</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1.3fr_1fr] min-[900px]:gap-14">
        <TodayHero onStart={onStart} onAddExam={() => setAddExamOpen(true)} />

        <aside className="flex flex-col gap-7">
          {isLoading && (
            <div className="h-24 bg-paper-2 border border-rule rounded-sm animate-pulse" />
          )}
          {error && (
            <div className="bg-rating-1/8 border border-rating-1/20 rounded-sm p-4 text-rating-1 text-[15px]">
              {error.message}
            </div>
          )}
          {nextExam && <ExamWidget exam={nextExam} />}
          <TodayStats />
        </aside>
      </div>

      <SessionList sessions={todaySessions} onStartSession={onStartSession} />

      <AddExamModal open={addExamOpen} onClose={() => setAddExamOpen(false)} />
    </>
  );
}
