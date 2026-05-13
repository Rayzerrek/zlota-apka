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
import { useAllExams } from "../hooks/api/useExams";
import { useAllSessions } from "../hooks/api/useSessions";
import { adaptApiSessionToStudySession } from "../lib/adapters";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

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

function weekLabel(anchorISO: string): string {
  const start = startOfWeek(parseISO(anchorISO), { weekStartsOn: 1 });
  const end = addDays(start, 6);
  return `${format(start, "d MMM", { locale: pl })} – ${format(end, "d MMM yyyy", { locale: pl })}`;
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

export function CalendarPage() {
  const today = todayISO();
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekAnchor, setWeekAnchor] = useState(today);
  const [selected, setSelected] = useState(today);

  const { data: exams, isLoading: examsLoading } = useAllExams();
  const { data: apiSessions, isLoading: sessionsLoading } = useAllSessions();

  const sessions = useMemo(
    () => (apiSessions ?? []).map(adaptApiSessionToStudySession),
    [apiSessions],
  );

  const days = useMemo(() => weekDaysFrom(weekAnchor), [weekAnchor]);
  const selectedSessions = useMemo(
    () => sessions.filter((s) => s.dateISO === selected),
    [sessions, selected],
  );
  const upcomingExams = useMemo(
    () =>
      [...exams]
        .filter((e) => e.dateISO >= today)
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [exams, today],
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
    setWeekAnchor(today);
    setSelected(today);
  };

  const handleToggleView = () => {
    setViewMode((prev) => (prev === "week" ? "month" : "week"));
  };

  if (examsLoading || sessionsLoading) {
    return (
      <>
        <PageHead eyebrow="plan" title={<em>Ładowanie...</em>} />
        <div className="h-96 animate-pulse rounded-sm border border-rule bg-paper-2" />
      </>
    );
  }

  return (
    <>
      <PageHead
        eyebrow={viewMode === "week" ? "plan tygodniowy" : "plan miesięczny"}
        title={
          viewMode === "week" ? (
            <em>{weekLabel(weekAnchor)}</em>
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
        <WeekGrid
          days={days}
          selected={selected}
          onSelect={setSelected}
          today={today}
          exams={exams}
          sessions={sessions}
        />
      ) : (
        <MonthGrid
          anchor={weekAnchor}
          selected={selected}
          today={today}
          exams={exams}
          sessions={sessions}
          onSelect={setSelected}
        />
      )}

      <DayDetail selected={selected} sessions={selectedSessions} />

      <UpcomingExams exams={upcomingExams} />
    </>
  );
}
