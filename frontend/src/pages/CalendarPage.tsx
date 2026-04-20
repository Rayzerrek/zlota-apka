import {
  addDays,
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import { useMemo, useState } from "react";

import { CalendarNav } from "../components/calendar/CalendarNav";
import { DayDetail } from "../components/calendar/DayDetail";
import { UpcomingExams } from "../components/calendar/UpcomingExams";
import { WeekGrid } from "../components/calendar/WeekGrid";
import { PageHead } from "../components/layout/PageHead";
import { EXAMS, SESSIONS, TODAY } from "../data/mock";

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

      <CalendarNav
        onPrev={() => setWeekAnchor(shiftWeek(weekAnchor, -7))}
        onToday={() => setWeekAnchor(TODAY)}
        onNext={() => setWeekAnchor(shiftWeek(weekAnchor, 7))}
      />

      <WeekGrid days={days} selected={selected} onSelect={setSelected} />

      <DayDetail selected={selected} sessions={selectedSessions} />

      <UpcomingExams exams={upcomingExams} />
    </>
  );
}
