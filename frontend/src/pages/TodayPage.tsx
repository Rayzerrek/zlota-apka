import { Button } from "@cloudflare/kumo/components/button";
import { SkeletonLine } from "@cloudflare/kumo/components/loader";
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
import { useState } from "react";

import { AddExamModal } from "../components/exam/AddExamModal";
import { PageHead } from "../components/layout/PageHead";
import { SessionList } from "../components/today/SessionList";
import { useDashboard } from "../hooks/api/useDashboard";
import { cn } from "../utils/cn";
import { dayLong, daysBetween, longDate } from "../utils/date";

import type { ApiDashboardSession } from "../types/api";

type Props = {
  onStartSession: (id: string) => void;
};

function buildFocusCopy(args: {
  overdueCount: number;
  nextSession: ApiDashboardSession | null;
  nextExamName: string | null;
  examDays: number | null;
  remainingSessions: number;
  totalSessions: number;
}) {
  const {
    overdueCount,
    nextSession,
    nextExamName,
    examDays,
    remainingSessions,
    totalSessions,
  } = args;

  if (totalSessions === 0) {
    return "Na dziś nie masz nic w planie. Dodaj sprawdzian albo zajrzyj do materiałów — scheduler rozpisze powtórki sam.";
  }

  if (remainingSessions === 0) {
    return "Na dziś masz już wszystko domknięte. Możesz spokojnie wrócić do materiałów albo zaplanować kolejny termin.";
  }

  if (overdueCount > 0) {
    return `Masz ${overdueCount} zaległe ${overdueCount === 1 ? "powtórkę" : "powtórki"}. Najlepiej odzyskać rytm właśnie od nich, a potem wejść w dzisiejsze sesje.`;
  }

  if (nextExamName && examDays !== null && examDays <= 7) {
    return `Najbliżej jest ${nextExamName}. Dzisiaj warto dowieźć choć jedną sesję, żeby wejść w końcówkę bez stresu.`;
  }

  if (nextSession?.topicName) {
    return `Zacznij od ${nextSession.topicName}. To najprostszy sposób, żeby ruszyć z planem bez analizowania statystyk.`;
  }

  return "Masz gotowy plan. Wystarczy odpalić pierwszą sesję i wejść w rytm.";
}

function HeroSkeleton() {
  return (
    <div className="rounded-sm border border-rule bg-paper p-5 sm:p-6">
      <div className="flex flex-col gap-4">
        <SkeletonLine minWidth={20} maxWidth={28} blockHeight="0.75rem" />
        <SkeletonLine minWidth={70} maxWidth={92} blockHeight="2.25rem" />
        <SkeletonLine minWidth={80} maxWidth={100} blockHeight="0.875rem" />
        <SkeletonLine minWidth={50} maxWidth={70} blockHeight="0.875rem" />
        <div className="mt-3 flex gap-2.5">
          <SkeletonLine minWidth={32} maxWidth={42} blockHeight="3rem" />
          <SkeletonLine minWidth={28} maxWidth={36} blockHeight="3rem" />
        </div>
      </div>
    </div>
  );
}

export function TodayPage({ onStartSession }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [addExamOpen, setAddExamOpen] = useState(false);
  const navigate = useNavigate();
  const { data: dashboard, isLoading, error } = useDashboard();

  const todaySessions = dashboard?.today ?? [];
  // Defensive: only treat exam as "next" if it hasn't passed yet.
  const upcomingExam = (dashboard?.upcomingExams ?? []).find(
    (e) => daysBetween(today, e.examDate) >= 0,
  );
  const nextExam = upcomingExam ?? null;
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

  const focusTitle =
    totalToday === 0
      ? "Wolny dzień"
      : remainingSessions === 0
        ? "Plan na dziś domknięty"
        : overdueCount > 0
          ? "Najpierw odzyskaj zaległości"
          : nextSession
            ? "To jest Twój kolejny krok"
            : "Masz gotowy plan na dziś";

  const focusCopy = buildFocusCopy({
    overdueCount,
    nextSession,
    nextExamName: nextExam?.name ?? null,
    examDays,
    remainingSessions,
    totalSessions: totalToday,
  });

  const reminders: Array<{
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    icon: typeof WarningCircleIcon;
    tone: "warning" | "info";
  }> = [];

  if (nextExam && examDays !== null && examDays <= 3) {
    reminders.push({
      id: "exam",
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
        navigate({ to: "/calendar" });
      },
      icon: ClockCountdownIcon,
      tone: "info",
    });
  }

  const primaryCtaLabel =
    totalToday === 0
      ? "Powtórz materiał"
      : remainingSessions === 0
        ? "Powtórz materiał"
        : "Zacznij naukę";

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
            {error && (
              <div
                role="alert"
                className="rounded-sm border border-rating-1/25 bg-rating-1/8 p-4 text-[15px] text-rating-1"
              >
                {error.message}
              </div>
            )}

            {isLoading ? (
              <HeroSkeleton />
            ) : (
              <div className="grid gap-4">
                <div className="rounded-sm border border-rule bg-paper p-5 sm:p-6">
                  <div className="max-w-[40rem]">
                    <div className="mono text-[12px] uppercase tracking-[0.16em] text-amber">
                      Co teraz
                    </div>
                    <h2 className="mt-3 display text-[30px] leading-[1.05] text-ink sm:text-[36px]">
                      {focusTitle}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-ink-muted sm:text-[15px]">
                      {focusCopy}
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
                      onClick={() => {
                        if (remainingSessions > 0 && nextSession) {
                          onStartSession(nextSession.id);
                          return;
                        }
                        navigate({
                          to: "/review/$sessionId",
                          params: { sessionId: "today" },
                        });
                      }}
                      className="bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] hover:-translate-y-px active:translate-y-0 transition-all font-semibold px-7 py-4"
                    >
                      {primaryCtaLabel}
                      <ArrowRightIcon
                        size={18}
                        weight="bold"
                        className="ml-1"
                      />
                    </Button>
                    {totalToday === 0 && (
                      <Button
                        size="lg"
                        variant="outline"
                        icon={CalendarPlusIcon}
                        onClick={() => setAddExamOpen(true)}
                        className="rounded-sm"
                      >
                        Dodaj sprawdzian
                      </Button>
                    )}
                  </div>
                </div>

                {overdueCount > 0 && (
                  <div className="rounded-sm border border-amber/30 bg-[linear-gradient(180deg,rgba(242,184,48,0.12),rgba(242,184,48,0.04))] p-4 sm:p-5">
                    <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-start min-[720px]:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-amber/25 bg-amber/12 text-amber">
                          <WarningCircleIcon size={18} weight="fill" />
                        </div>
                        <div>
                          <div className="mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                            Zaległe powtórki
                          </div>
                          <h3 className="mt-2 text-[18px] leading-6 text-ink">
                            {overdueCount === 1
                              ? "1 zaległa sesja"
                              : `${overdueCount} zaległe sesje`}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-ink-muted">
                            Zacznij od najstarszej pozycji. To najszybciej
                            porządkuje plan i zmniejsza presję przed kolejnymi
                            dniami.
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (nextSession) {
                            onStartSession(nextSession.id);
                            return;
                          }
                          navigate({ to: "/calendar" });
                        }}
                        className="shrink-0 rounded-sm"
                      >
                        Otwórz kalendarz
                      </Button>
                    </div>
                  </div>
                )}

                {reminders.length > 0 && (
                  <div className="grid gap-3">
                    {reminders.map((reminder) => {
                      const Icon = reminder.icon;

                      return (
                        <div
                          key={reminder.id}
                          className={cn(
                            "rounded-sm border p-4 sm:p-5",
                            reminder.tone === "warning"
                              ? "border-amber/30 bg-[linear-gradient(180deg,rgba(242,184,48,0.12),rgba(242,184,48,0.04))]"
                              : "border-rule bg-paper",
                          )}
                        >
                          <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-start min-[720px]:justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  "grid h-10 w-10 shrink-0 place-items-center rounded-sm border",
                                  reminder.tone === "warning"
                                    ? "border-amber/25 bg-amber/12 text-amber"
                                    : "border-rule bg-kumo-base text-ink-muted",
                                )}
                              >
                                <Icon size={18} weight="fill" />
                              </div>
                              <div>
                                <div className="mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
                                  Dziś pilnuj tego
                                </div>
                                <h3 className="mt-2 text-[18px] leading-6 text-ink">
                                  {reminder.title}
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-ink-muted">
                                  {reminder.description}
                                </p>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={reminder.onAction}
                              className="shrink-0 rounded-sm"
                            >
                              {reminder.actionLabel}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
              <div className="rounded-sm border border-rule bg-paper-2 p-5">
                <div className="mono text-[12px] uppercase tracking-[0.16em] text-ink-muted">
                  Progres tygodnia
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-kumo-base rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm bg-amber transition-all"
                      style={{
                        width: `${dashboard?.week.progressPercent ?? 0}%`,
                      }}
                    />
                  </div>
                  <span className="mono text-[14px] text-ink tabular-nums">
                    {dashboard?.week.progressPercent ?? 0}%
                  </span>
                </div>
                <div className="mt-2 text-sm text-ink-muted">
                  {dashboard?.week.completed ?? 0} /{" "}
                  {dashboard?.week.total ?? 0} zaplanowanych sesji ukończonych
                </div>
              </div>

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
                      {nextExam.subjectName ??
                        nextExam.subjectKey ??
                        "Bez przedmiotu"}
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
                      onClick={() => navigate({ to: "/calendar" })}
                      className="mt-5 rounded-sm bg-amber text-paper hover:bg-[#ffcc4a]"
                    >
                      Otwórz kalendarz
                    </Button>
                  </>
                ) : (
                  <div className="mt-4 text-sm leading-6 text-ink-muted">
                    Brak aktywnego terminu. Dodaj sprawdzian, a planner sam
                    rozpisze powtórki.
                  </div>
                )}
              </div>

              <div className="rounded-sm border border-rule bg-paper-2 p-5">
                <div className="mono text-[12px] uppercase tracking-[0.16em] text-ink-muted">
                  Szybkie akcje
                </div>
                <div className="mt-4 grid gap-2.5">
                  <Button
                    size="lg"
                    variant="ghost"
                    icon={LightningIcon}
                    onClick={() =>
                      navigate({
                        to: "/review/$sessionId",
                        params: { sessionId: "today" },
                      })
                    }
                    className="justify-center rounded-sm bg-amber text-paper hover:bg-[#ffcc4a] hover:-translate-y-px active:translate-y-0 transition-all font-semibold py-5"
                  >
                    Szybka powtórka
                  </Button>
                  <Button
                    variant="outline"
                    icon={CalendarPlusIcon}
                    onClick={() => setAddExamOpen(true)}
                    className="justify-start rounded-sm"
                  >
                    Dodaj sprawdzian
                  </Button>
                  <Button
                    variant="ghost"
                    icon={NotePencilIcon}
                    onClick={() => navigate({ to: "/browse" })}
                    className="justify-start rounded-sm"
                  >
                    Przejrzyj materiały
                  </Button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      <AddExamModal open={addExamOpen} onClose={() => setAddExamOpen(false)} />
    </>
  );
}
