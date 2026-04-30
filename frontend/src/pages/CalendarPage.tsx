import {
  addDays,
  addMonths,
  eachDayOfInterval,
  format,
  parseISO,
  startOfWeek,
  subMonths,
} from "date-fns";
import { pl } from "date-fns/locale";
import { useMemo, useState } from "react";

import { CalendarNav } from "../components/calendar/CalendarNav";
import { DayDetail } from "../components/calendar/DayDetail";
import { MonthGrid } from "../components/calendar/MonthGrid";
import { UpcomingExams } from "../components/calendar/UpcomingExams";
import { WeekGrid } from "../components/calendar/WeekGrid";
import { PageHead } from "../components/layout/PageHead";
import { EXAMS, SESSIONS, TODAY } from "../data/mock";

type ViewMode = "week" | "month";

function shiftWeek(iso: string, n: number): string {
  return format(addDays(parseISO(iso), n), "yyyy-MM-dd");
}

function weekDaysFrom(iso: string): string[] {
  const start = startOfWeek(parseISO(iso), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end: addDays(start, 6) }).map((d) =>
    format(d, "yyyy-MM-dd"),
  );
}

function monthLabel(iso: string): string {
  const d = parseISO(iso);
  return (
    format(d, "LLLL", { locale: pl }).charAt(0).toUpperCase() +
    format(d, "LLLL", { locale: pl }).slice(1) +
    " " +
    format(d, "yyyy")
  );
}

const upcomingExams = [...EXAMS]
  .filter((e) => e.dateISO >= TODAY)
  .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

export function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekAnchor, setWeekAnchor] = useState(TODAY);
  const [selected, setSelected] = useState(TODAY);

  const days = useMemo(() => weekDaysFrom(weekAnchor), [weekAnchor]);
  const selectedSessions = useMemo(
    () => SESSIONS.filter((s) => s.dateISO === selected),
    [selected],
  );

  const handlePrev = () => {
    if (viewMode === "week") {
      setWeekAnchor(shiftWeek(weekAnchor, -7));
    } else {
      setWeekAnchor(format(subMonths(parseISO(weekAnchor), 1), "yyyy-MM-dd"));
    }
  };

  const handleNext = () => {
    if (viewMode === "week") {
      setWeekAnchor(shiftWeek(weekAnchor, 7));
    } else {
      setWeekAnchor(format(addMonths(parseISO(weekAnchor), 1), "yyyy-MM-dd"));
    }
  };

  const handleToday = () => {
    setWeekAnchor(TODAY);
    setSelected(TODAY);
  };

  const handleToggleView = () => {
    setViewMode((prev) => (prev === "week" ? "month" : "week"));
  };

  return (
    <>
      <PageHead
        eyebrow={viewMode === "week" ? "plan tygodniowy" : "plan miesięczny"}
        title={
          viewMode === "week" ? (
            <em>Jakis plan</em>
          ) : (
            <em>{monthLabel(weekAnchor)}</em>
          )
        }
      />

      <CalendarNav
        onPrev={handlePrev}
        onToday={handleToday}
        onNext={handleNext}
        viewMode={viewMode}
        onToggleView={handleToggleView}
      />

      {viewMode === "week" ? (
        <WeekGrid days={days} selected={selected} onSelect={setSelected} />
      ) : (
        <MonthGrid
          anchor={weekAnchor}
          selected={selected}
          today={TODAY}
          exams={EXAMS}
          sessions={SESSIONS}
          onSelect={setSelected}
        />
      )}

      <DayDetail selected={selected} sessions={selectedSessions} />

      <UpcomingExams exams={upcomingExams} />
    </>
  );
}
