import { useEffect, useState } from "react";

import { AddExamModal } from "../components/exam/AddExamModal";
import { PageHead } from "../components/layout/PageHead";
import { ExamWidget } from "../components/today/ExamWidget";
import { SessionList } from "../components/today/SessionList";
import { TodayHero } from "../components/today/TodayHero";
import { TodayStats } from "../components/today/TodayStats";
import { apiGet } from "../lib/api";
import { dayLong, longDate } from "../utils/date";

import type { ApiDashboard } from "../lib/types";

type Props = {
  onStart: () => void;
  onOpenSession: (id: string) => void;
};

export function TodayPage({ onStart, onOpenSession }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [addExamOpen, setAddExamOpen] = useState(false);
  const [dashboard, setDashboard] = useState<ApiDashboard | null>(null);

  useEffect(() => {
    apiGet<ApiDashboard>("/api/dashboard").then((res) => {
      if (res.ok) setDashboard(res.data);
    });
  }, []);

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
          {nextExam && <ExamWidget exam={nextExam} />}
          <TodayStats />
        </aside>
      </div>

      <SessionList sessions={todaySessions} onOpenSession={onOpenSession} />

      <AddExamModal open={addExamOpen} onClose={() => setAddExamOpen(false)} />
    </>
  );
}
