import { Button } from "@cloudflare/kumo/components/button";
import {
  ArrowRightIcon,
  CalendarPlusIcon,
  ClockCountdownIcon,
  LightningIcon,
  NotePencilIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { type ComponentProps, useState } from "react";

import { AddExamModal } from "../components/exam/AddExamModal";
import { PageHead } from "../components/layout/PageHead";
import { TodayHeroSkeleton } from "../components/today/HeroSkeleton";
import { TodayReminderCard } from "../components/today/ReminderCard";
import { SessionList } from "../components/today/SessionList";
import { ErrorState } from "../components/ui/ErrorState";
import { useStudySession } from "../contexts/StudySessionContext";
import { useDashboard } from "../hooks/api/useDashboard";
import { dayLong, daysBetween, longDate } from "../utils/date";

import type {
  ApiDashboardExam,
  ApiDashboardSession,
} from "../lib/schema-types";

type TodayReminder = ComponentProps<typeof TodayReminderCard> & {
  id: string;
};

export function TodayPage() {
  const { startSession: onStartSession } = useStudySession();
  const today = format(new Date(), "yyyy-MM-dd");
  const [addExamOpen, setAddExamOpen] = useState(false);
  const navigate = useNavigate();
  const { data: dashboard, isLoading, error } = useDashboard();

  const todaySessions = dashboard?.today ?? [];
  const nextExam =
    (dashboard?.upcomingExams ?? []).find(
      (exam) => daysBetween(today, exam.examDate) >= 0,
    ) ?? null;
  const overdueCount = dashboard?.overdueCount ?? 0;
  const pendingSessions = todaySessions.filter(
    (session) => session.status !== "completed",
  );
  const completedToday = todaySessions.length - pendingSessions.length;
  const totalToday = todaySessions.length;
  const remainingSessions = pendingSessions.length;
  const todayProgressPercent =
    totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const nextSession = pendingSessions[0] ?? null;
  const examDays = nextExam ? daysBetween(today, nextExam.examDate) : null;

  const hero = getTodayHeroContent({
    totalSessions: totalToday,
    remainingSessions,
    overdueCount,
    nextSession,
    nextExamName: nextExam?.name ?? null,
    examDays,
  });

  const openCalendar = () => navigate({ to: "/calendar" });
  const openQuickReview = () =>
    navigate({
      to: "/review/$sessionId",
      params: { sessionId: "today" },
    });
  const startNextSession = () => {
    if (nextSession) {
      onStartSession(nextSession.id);
      return;
    }

    openCalendar();
  };

  const handlePrimaryCta = () => {
    if (remainingSessions > 0 && nextSession) {
      onStartSession(nextSession.id);
      return;
    }

    openQuickReview();
  };

  const reminders: TodayReminder[] = [];

  if (overdueCount > 0) {
    reminders.push({
      id: "overdue",
      eyebrow: "Zaległe powtórki",
      title:
        overdueCount === 1
          ? "1 zaległa sesja"
          : `${overdueCount} zaległe sesje`,
      description:
        "Zacznij od najstarszej pozycji. To najszybciej porządkuje plan i zmniejsza presję przed kolejnymi dniami.",
      actionLabel: nextSession ? "Zacznij pierwszą sesję" : "Otwórz kalendarz",
      onAction: startNextSession,
      icon: WarningCircleIcon,
      tone: "warning",
    });
  }

  const examReminder = getExamReminder({
    nextExam,
    examDays,
    remainingSessions,
    nextSession,
    onStartSession,
    onOpenCalendar: openCalendar,
  });

  if (examReminder) {
    reminders.push(examReminder);
  }

  const weekProgress = dashboard?.week ?? {
    completed: 0,
    total: 0,
    progressPercent: 0,
  };

  return (
    <>
      <PageHead
        eyebrow={`${dayLong(today)} · ${longDate(today)}`}
        title={
          <>
            Plan na <em>dziś</em>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 min-[980px]:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)] min-[980px]:items-start">
        <section className="relative overflow-hidden rounded-sm border border-rule bg-[linear-gradient(180deg,rgba(242,184,48,0.06),transparent_42%),var(--color-paper-2)] p-5 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-amber-dim),transparent)] opacity-80"
          />

          <div className="relative flex flex-col gap-6">
            {error && <ErrorState error={error} />}

            {isLoading ? (
              <TodayHeroSkeleton />
            ) : (
              <div className="grid gap-4">
                <TodayHeroCard
                  title={hero.title}
                  copy={hero.copy}
                  primaryCtaLabel={hero.primaryCtaLabel}
                  onPrimaryCta={handlePrimaryCta}
                  completedToday={completedToday}
                  totalToday={totalToday}
                  todayProgressPercent={todayProgressPercent}
                  onAddExam={() => setAddExamOpen(true)}
                />

                {reminders.length > 0 && (
                  <div className="grid gap-3">
                    {reminders.map(({ id, ...reminder }) => (
                      <TodayReminderCard key={id} {...reminder} />
                    ))}
                  </div>
                )}

                <SessionList
                  sessions={todaySessions}
                  onStartSession={onStartSession}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        </section>

        <aside className="grid gap-4">
          {isLoading && (
            <div className="h-40 animate-pulse rounded-sm border border-rule bg-paper-2" />
          )}

          {!isLoading && !error && (
            <>
              <TodayWeekProgressCard
                completed={weekProgress.completed}
                total={weekProgress.total}
                progressPercent={weekProgress.progressPercent}
              />

              <TodayExamCard
                nextExam={nextExam}
                examDays={examDays}
                onOpenCalendar={openCalendar}
              />

              <TodayQuickActionsCard
                onQuickReview={openQuickReview}
                onAddExam={() => setAddExamOpen(true)}
                onBrowseMaterials={() => navigate({ to: "/browse" })}
              />
            </>
          )}
        </aside>
      </div>

      <AddExamModal open={addExamOpen} onClose={() => setAddExamOpen(false)} />
    </>
  );
}

function TodayHeroCard(props: {
  title: string;
  copy: string;
  primaryCtaLabel: string;
  onPrimaryCta: () => void;
  completedToday: number;
  totalToday: number;
  todayProgressPercent: number;
  onAddExam: () => void;
}) {
  const {
    title,
    copy,
    primaryCtaLabel,
    onPrimaryCta,
    completedToday,
    totalToday,
    todayProgressPercent,
    onAddExam,
  } = props;

  return (
    <div className="rounded-sm border border-rule bg-paper p-5 sm:p-6">
      <div className="max-w-[40rem]">
        <div className="mono text-[12px] uppercase tracking-[0.16em] text-amber">
          Co teraz
        </div>
        <h2 className="mt-3 display text-[30px] leading-[1.05] text-ink sm:text-[36px]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-ink-muted sm:text-[15px]">
          {copy}
        </p>
      </div>

      {totalToday > 0 && (
        <div className="mt-5 max-w-[28rem]">
          <div className="mb-2 flex items-baseline justify-between gap-2 mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            <span>Postęp dzisiejszych sesji</span>
            <span className="text-ink tabular-nums">
              {completedToday} / {totalToday}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-sm bg-kumo-base">
            <div
              className="h-full rounded-sm bg-amber transition-all"
              style={{ width: `${todayProgressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button
          size="lg"
          variant="ghost"
          onClick={onPrimaryCta}
          className="rounded-sm bg-amber px-7 py-4 font-semibold text-paper transition-all hover:-translate-y-px hover:bg-[#ffcc4a] active:translate-y-0"
        >
          {primaryCtaLabel}
          <ArrowRightIcon size={18} weight="bold" className="ml-1" />
        </Button>
        {totalToday === 0 && (
          <Button
            size="lg"
            variant="outline"
            icon={CalendarPlusIcon}
            onClick={onAddExam}
            className="rounded-sm"
          >
            Dodaj sprawdzian
          </Button>
        )}
      </div>
    </div>
  );
}

function TodayWeekProgressCard(props: {
  completed: number;
  total: number;
  progressPercent: number;
}) {
  const { completed, total, progressPercent } = props;

  return (
    <div className="rounded-sm border border-rule bg-paper-2 p-5">
      <div className="mono text-[12px] uppercase tracking-[0.16em] text-ink-muted">
        Progres tygodnia
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-sm bg-kumo-base">
          <div
            className="h-full rounded-sm bg-amber transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="mono tabular-nums text-[14px] text-ink">
          {progressPercent}%
        </span>
      </div>
      <div className="mt-2 text-sm text-ink-muted">
        {completed} / {total} zaplanowanych sesji ukończonych
      </div>
    </div>
  );
}

function TodayExamCard(props: {
  nextExam: ApiDashboardExam | null;
  examDays: number | null;
  onOpenCalendar: () => void;
}) {
  const { nextExam, examDays, onOpenCalendar } = props;

  return (
    <div className="rounded-sm border border-rule bg-[linear-gradient(180deg,rgba(242,184,48,0.08),transparent_65%),var(--color-paper-2)] p-6 sm:p-7">
      <div className="mono text-[12px] uppercase tracking-[0.18em] text-amber">
        Najbliższy sprawdzian
      </div>

      {nextExam && examDays !== null ? (
        <>
          <div className="mt-4 display text-[34px] leading-[1.02] text-ink sm:text-[40px]">
            {nextExam.name}
          </div>
          <div className="mt-3 text-base text-ink-muted">
            {nextExam.subjectName ?? nextExam.subjectKey ?? "Bez przedmiotu"}
            {" · "}
            {longDate(nextExam.examDate)}
          </div>

          <div className="mt-6 flex items-end gap-3 border-t border-dashed border-amber/20 pt-5">
            <span className="mono text-[72px] leading-[0.82] text-amber sm:text-[84px]">
              {examDays}
            </span>
            <span className="pb-2 mono text-[12px] uppercase tracking-[0.16em] text-ink-faint">
              {examDays === 1 ? "dzień" : "dni"} do terminu
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCalendar}
            className="mt-5 rounded-sm bg-amber text-paper hover:bg-[#ffcc4a]"
          >
            Otwórz kalendarz
          </Button>
        </>
      ) : (
        <div className="mt-4 text-sm leading-6 text-ink-muted">
          Brak aktywnego terminu. Dodaj sprawdzian, a planner sam rozpisze
          powtórki.
        </div>
      )}
    </div>
  );
}

function TodayQuickActionsCard(props: {
  onQuickReview: () => void;
  onAddExam: () => void;
  onBrowseMaterials: () => void;
}) {
  const { onQuickReview, onAddExam, onBrowseMaterials } = props;

  return (
    <div className="rounded-sm border border-rule bg-paper-2 p-5">
      <div className="mono text-[12px] uppercase tracking-[0.16em] text-ink-muted">
        Szybkie akcje
      </div>
      <div className="mt-4 grid gap-2.5">
        <Button
          size="lg"
          variant="ghost"
          icon={LightningIcon}
          onClick={onQuickReview}
          className="w-full justify-start rounded-sm bg-amber font-semibold text-paper transition-all hover:-translate-y-px hover:bg-[#ffcc4a] active:translate-y-0"
        >
          Szybka powtórka
        </Button>
        <Button
          size="lg"
          variant="outline"
          icon={CalendarPlusIcon}
          onClick={onAddExam}
          className="w-full justify-start rounded-sm"
        >
          Dodaj sprawdzian
        </Button>
        <Button
          size="lg"
          variant="outline"
          icon={NotePencilIcon}
          onClick={onBrowseMaterials}
          className="w-full justify-start rounded-sm"
        >
          Przejrzyj materiały
        </Button>
      </div>
    </div>
  );
}

function getTodayHeroContent(args: {
  totalSessions: number;
  remainingSessions: number;
  overdueCount: number;
  nextSession: ApiDashboardSession | null;
  nextExamName: string | null;
  examDays: number | null;
}) {
  const {
    totalSessions,
    remainingSessions,
    overdueCount,
    nextSession,
    nextExamName,
    examDays,
  } = args;

  if (totalSessions === 0) {
    return {
      title: "Wolny dzień",
      copy: "Na dziś nie masz nic w planie. Dodaj sprawdzian albo zajrzyj do materiałów, a scheduler rozpisze powtórki sam.",
      primaryCtaLabel: "Powtórz materiał",
    };
  }

  if (remainingSessions === 0) {
    return {
      title: "Plan na dziś domknięty",
      copy: "Na dziś masz już wszystko zrobione. Możesz spokojnie wrócić do materiałów albo zaplanować kolejny termin.",
      primaryCtaLabel: "Powtórz materiał",
    };
  }

  if (overdueCount > 0) {
    return {
      title: "Najpierw odzyskaj zaległości",
      copy: `Masz ${overdueCount} zaległe ${overdueCount === 1 ? "powtórkę" : "powtórki"}. Najszybciej wrócisz do rytmu, jeśli zaczniesz właśnie od nich.`,
      primaryCtaLabel: "Zacznij naukę",
    };
  }

  if (nextExamName && examDays !== null && examDays <= 7) {
    return {
      title: "To jest Twój kolejny krok",
      copy: `Najbliżej jest ${nextExamName}. Warto dziś domknąć choć jedną sesję, żeby wejść w końcówkę bez stresu.`,
      primaryCtaLabel: "Zacznij naukę",
    };
  }

  if (nextSession?.topicName) {
    return {
      title: "To jest Twój kolejny krok",
      copy: `Zacznij od ${nextSession.topicName}. To najprostszy sposób, żeby ruszyć z planem bez analizowania statystyk.`,
      primaryCtaLabel: "Zacznij naukę",
    };
  }

  return {
    title: "Masz gotowy plan na dziś",
    copy: "Masz gotowy plan. Wystarczy odpalić pierwszą sesję i wejść w rytm.",
    primaryCtaLabel: "Zacznij naukę",
  };
}

function getExamReminder(args: {
  nextExam: ApiDashboardExam | null;
  examDays: number | null;
  remainingSessions: number;
  nextSession: ApiDashboardSession | null;
  onStartSession: (id: string) => void;
  onOpenCalendar: () => void;
}): TodayReminder | null {
  const {
    nextExam,
    examDays,
    remainingSessions,
    nextSession,
    onStartSession,
    onOpenCalendar,
  } = args;

  if (!nextExam || examDays === null || examDays > 3) {
    return null;
  }

  return {
    id: "exam",
    eyebrow: "Dziś pilnuj tego",
    title:
      examDays === 0
        ? `${nextExam.name} jest dziś`
        : examDays === 1
          ? `${nextExam.name} jest jutro`
          : `${nextExam.name} za ${examDays} dni`,
    description:
      remainingSessions > 0
        ? `Zostało jeszcze ${remainingSessions} ${remainingSessions === 1 ? "sesja" : "sesje"} na dziś. Dobrze domknąć przynajmniej pierwszą od razu.`
        : "Dzisiejszy plan jest już gotowy. Możesz wejść w szybką powtórkę albo sprawdzić cały harmonogram.",
    actionLabel:
      remainingSessions > 0 ? "Zacznij pierwszą sesję" : "Zobacz plan",
    onAction: () => {
      if (remainingSessions > 0 && nextSession) {
        onStartSession(nextSession.id);
        return;
      }

      onOpenCalendar();
    },
    icon: ClockCountdownIcon,
    tone: "info",
  };
}
