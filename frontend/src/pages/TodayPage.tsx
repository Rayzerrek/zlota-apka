import { Button } from "@cloudflare/kumo/components/button";
import { Empty } from "@cloudflare/kumo/components/empty";
import {
  ArrowRightIcon,
  CalendarPlusIcon,
  ClockCountdownIcon,
  CoffeeIcon,
  NotePencilIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { useState } from "react";

import { AddExamModal } from "../components/exam/AddExamModal";
import { PageHead } from "../components/layout/PageHead";
import { useDashboard } from "../hooks/api/useDashboard";
import { cn } from "../utils/cn";
import { dayLong, daysBetween, formatMinutes, longDate } from "../utils/date";
import { SUBJECT_BG } from "../utils/subjects";

import type { SubjectKey } from "../types";
import type { ApiDashboardSession } from "../types/api";

type Props = {
  onStartSession: (id: string) => void;
};

function toSubjectKey(k: string | null): SubjectKey | null {
  if (k === null) return null;
  if (k in SUBJECT_BG) return k as SubjectKey;
  return null;
}

function buildFocusCopy(args: {
  overdueCount: number;
  nextSession: ApiDashboardSession | null;
  nextExamName: string | null;
  examDays: number | null;
  remainingSessions: number;
}) {
  const {
    overdueCount,
    nextSession,
    nextExamName,
    examDays,
    remainingSessions,
  } = args;

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

export function TodayPage({ onStartSession }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [addExamOpen, setAddExamOpen] = useState(false);
  const navigate = useNavigate();
  const { data: dashboard, isLoading, error } = useDashboard();

  const todaySessions = dashboard?.today ?? [];
  const nextExam = dashboard?.upcomingExams[0] ?? null;
  const overdueCount = dashboard?.overdueCount ?? 0;
  const completedSessions = todaySessions.filter(
    (session) => session.status === "completed",
  ).length;
  const pendingSessions = todaySessions.filter(
    (session) => session.status !== "completed",
  );
  const remainingSessions = pendingSessions.length;
  const totalMinutes = todaySessions.reduce(
    (sum, session) => sum + session.plannedMinutes,
    0,
  );
  const pendingMinutes = pendingSessions.reduce(
    (sum, session) => sum + session.plannedMinutes,
    0,
  );
  const nextSession = pendingSessions[0] ?? null;
  const examDays = nextExam ? daysBetween(today, nextExam.examDate) : null;

  const focusTitle =
    remainingSessions === 0
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

  if (overdueCount > 0) {
    reminders.push({
      id: "overdue",
      title:
        overdueCount === 1
          ? "Masz 1 zaległą sesję"
          : `Masz ${overdueCount} zaległe sesje`,
      description:
        "Zacznij od najstarszej pozycji. To najszybciej porządkuje plan i zmniejsza presję przed kolejnymi dniami.",
      actionLabel: "Otwórz plan dnia",
      onAction: () => {
        if (nextSession) {
          onStartSession(nextSession.id);
          return;
        }
        navigate({ to: "/calendar" });
      },
      icon: WarningCircleIcon,
      tone: "warning",
    });
  }

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
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule pb-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={CalendarPlusIcon}
                  onClick={() => setAddExamOpen(true)}
                  className="rounded-sm"
                >
                  Sprawdzian
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={NotePencilIcon}
                  onClick={() => navigate({ to: "/browse" })}
                  className="rounded-sm"
                >
                  Materiały
                </Button>
              </div>
            </div>

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

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={() =>
                      navigate({
                        to: "/review/$sessionId",
                        params: { sessionId: "today" },
                      })
                    }
                    className="bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] hover:-translate-y-px active:translate-y-0 transition-all font-semibold px-7 py-4"
                  >
                    {remainingSessions === 0
                      ? "Powtórz materiał"
                      : "Zacznij naukę"}
                    <ArrowRightIcon size={18} weight="bold" className="ml-1" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate({ to: "/calendar" })}
                    className="rounded-sm"
                  >
                    Zobacz cały plan
                  </Button>
                </div>
              </div>

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
            </div>

            <div className="grid gap-3 min-[680px]:grid-cols-2">
              <div className="rounded-sm border border-rule bg-paper px-4 py-4">
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                  Kolejny start
                </div>
                <div className="mt-2 text-[18px] leading-6 text-ink">
                  {nextSession?.topicName ?? "Wszystko gotowe"}
                </div>
                <div className="mt-1 text-sm text-ink-muted">
                  {nextSession?.subjectName ??
                    nextSession?.subjectKey ??
                    "Możesz wrócić do materiałów albo zaplanować coś nowego."}
                </div>
              </div>

              <div className="rounded-sm border border-rule bg-paper px-4 py-4">
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                  Dziś zajmie Ci to
                </div>
                <div className="mt-2 text-[18px] leading-6 text-ink">
                  {formatMinutes(totalMinutes)}
                </div>
                <div className="mt-1 text-sm text-ink-muted">
                  całego planu, w tym {formatMinutes(pendingMinutes)} do
                  zrobienia od teraz
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-4">
          {isLoading && (
            <div className="h-40 animate-pulse rounded-sm border border-rule bg-paper-2" />
          )}

          {error && (
            <div className="rounded-sm border border-rating-1/20 bg-rating-1/8 p-4 text-[15px] text-rating-1">
              {error.message}
            </div>
          )}

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
                    dni do terminu
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: "/calendar" })}
                  className="mt-5 rounded-sm bg-amber text-paper hover:bg-[#ffcc4a]"
                >
                  Otwórz plan
                </Button>
              </>
            ) : (
              <div className="mt-4 text-sm leading-6 text-ink-muted">
                Brak aktywnego terminu. Dodaj sprawdzian, a planner sam rozpisze
                powtórki.
              </div>
            )}
          </div>

          <div className="rounded-sm border border-rule bg-paper-2 p-5">
            <div className="mono text-[12px] uppercase tracking-[0.16em] text-ink-muted">
              Szybkie akcje
            </div>
            <div className="mt-4 grid gap-2.5">
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
        </aside>
      </div>

      <section className="mt-6 rounded-sm border border-rule bg-paper-2 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-4">
          <div>
            <h2 className="display text-[25px] font-normal text-ink">
              Plan krok po kroku
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Kliknij w pierwszą wolną sesję i nie zastanawiaj się nad resztą.
            </p>
          </div>
          <span className="mono text-[12px] uppercase tracking-[0.16em] text-ink-faint">
            {completedSessions} / {todaySessions.length} ukończone
          </span>
        </div>

        {todaySessions.length === 0 ? (
          <div className="pt-4">
            <Empty
              icon={<CoffeeIcon size={44} weight="duotone" />}
              title="Brak sesji na dziś"
              description="Nic na dziś w planie. Dodaj materiał albo ustaw nadchodzący sprawdzian — scheduler rozpisze powtórki."
              contents={
                <div className="flex flex-wrap justify-center gap-2.5">
                  <Button
                    variant="primary"
                    icon={CalendarPlusIcon}
                    onClick={() => navigate({ to: "/calendar" })}
                  >
                    Zaplanuj sprawdzian
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate({ to: "/browse" })}
                  >
                    Przejrzyj karty
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {todaySessions.map((session, index) => {
              const isDone = session.status === "completed";
              const isRecommended = !isDone && session.id === nextSession?.id;
              const subjKey = toSubjectKey(session.subjectKey);

              return (
                <Button
                  key={session.id}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "group w-full justify-start rounded-sm border border-rule bg-paper text-left transition-all hover:-translate-y-px hover:bg-paper",
                    isDone && "opacity-60",
                  )}
                  onClick={() => !isDone && onStartSession(session.id)}
                >
                  <div className="flex w-full flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:gap-6">
                    <div className="flex flex-1 items-start gap-3 md:min-w-0">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-sm border border-rule bg-kumo-base mono text-[12px] text-ink-faint">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                            {session.subjectName ??
                              session.subjectKey ??
                              "Bez przedmiotu"}
                          </span>
                          {isRecommended && (
                            <span className="rounded-sm border border-amber/20 bg-amber/10 px-2 py-0.5 mono text-[10px] uppercase tracking-[0.14em] text-amber">
                              Polecane teraz
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          {subjKey && (
                            <span
                              className={cn(
                                "h-2 w-2 shrink-0 rounded-full",
                                SUBJECT_BG[subjKey],
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              "display text-[18px] leading-[1.25] sm:text-[21px]",
                              isDone
                                ? "text-ink-faint line-through decoration-rule-strong"
                                : "text-ink",
                            )}
                          >
                            {session.topicName ?? "Bez nazwy tematu"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                          {isDone
                            ? "Sesja ukończona — możesz przejść dalej."
                            : `Do zrobienia w około ${formatMinutes(session.plannedMinutes)}.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:shrink-0 md:flex-col md:items-end md:gap-3 lg:flex-row lg:items-center">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-sm border border-rule bg-kumo-base px-2.5 py-1 mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                          {formatMinutes(session.plannedMinutes)}
                        </span>
                        <span className="rounded-sm border border-rule bg-kumo-base px-2.5 py-1 mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                          {isDone ? "ukończona" : "gotowa do startu"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="hidden mono text-[11px] uppercase tracking-[0.14em] text-ink-faint sm:inline">
                          {isDone ? "gotowe" : "kliknij, aby zacząć"}
                        </span>
                        <div
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors",
                            isDone
                              ? "border-rule bg-kumo-base text-ink-faint"
                              : "border-amber/25 bg-amber/10 text-amber group-hover:border-amber group-hover:bg-amber group-hover:text-paper",
                          )}
                        >
                          <ArrowRightIcon size={16} weight="bold" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </section>

      <AddExamModal open={addExamOpen} onClose={() => setAddExamOpen(false)} />
    </>
  );
}
