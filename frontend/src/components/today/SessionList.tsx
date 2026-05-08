import { Button } from "@cloudflare/kumo/components/button";
import { Empty } from "@cloudflare/kumo/components/empty";
import {
  ArrowRightIcon,
  CalendarPlusIcon,
  CoffeeIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";

import { cn } from "../../utils/cn";
import { formatMinutes } from "../../utils/date";
import { SUBJECT_BG } from "../../utils/subjects";

import type { SubjectKey } from "../../types";
import type { ApiDashboardSession } from "../../types/api";

type Props = {
  sessions: ApiDashboardSession[];
  onStartSession: (id: string) => void;
  className?: string;
};

function toSubjectKey(k: string | null): SubjectKey | null {
  if (k === null) return null;
  if (k in SUBJECT_BG) return k as SubjectKey;
  return null;
}

export function SessionList({ sessions, onStartSession, className }: Props) {
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return (
      <section className={cn("mt-16", className)}>
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[25px] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber">01 —</span> Plan dnia
          </h2>
        </div>
        <Empty
          icon={<CoffeeIcon size={44} weight="duotone" />}
          title="Brak sesji na dziś"
          description="Nic na dziś w planie. Dodaj materiał albo ustaw nadchodzący sprawdzian — scheduler rozpisze powtórki."
          contents={
            <div className="flex gap-2.5 flex-wrap justify-center">
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
      </section>
    );
  }

  return (
    <section className={cn("mt-16", className)}>
      <div className="flex items-baseline justify-between gap-3 mb-6 pb-4 border-b border-rule/60">
        <h2 className="display font-normal text-[26px] tracking-tight text-ink flex items-baseline gap-3">
          <span className="mono text-[11px] uppercase tracking-widest text-amber">
            01 —
          </span>{" "}
          Plan dnia
        </h2>
        <span className="mono text-[12px] uppercase tracking-widest text-ink-faint bg-kumo-base px-3 py-1 rounded-full">
          <span className="text-ink">
            {sessions.filter((s) => s.status === "completed").length}
          </span>{" "}
          / {sessions.length} ukończone
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {sessions.map((s, idx) => {
          const isDone = s.status === "completed";
          const subjKey = toSubjectKey(s.subjectKey);

          return (
            <button
              key={s.id}
              type="button"
              disabled={isDone}
              className={cn(
                "group relative w-full flex items-center justify-between text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-amber/50",
                isDone
                  ? "bg-paper-2/50 border-transparent opacity-60 cursor-default"
                  : "bg-paper border-rule hover:border-amber/40 hover:bg-amber/[0.02] hover:shadow-[0_4px_20px_-10px_rgba(242,184,48,0.15)] hover:-translate-y-[1px] cursor-pointer",
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => !isDone && onStartSession(s.id)}
            >
              {/* Background gradient effect on hover */}
              {!isDone && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber/0 via-amber/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              )}

              <div className="flex flex-col gap-1.5 min-w-0 relative z-10 pr-4">
                <div className="flex items-center gap-2.5 mono text-[11px] tracking-wider uppercase text-ink-muted">
                  {subjKey && (
                    <span className="relative flex h-2 w-2">
                      {!isDone && (
                        <span
                          className={cn(
                            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-40",
                            SUBJECT_BG[subjKey],
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "relative inline-flex rounded-full h-2 w-2",
                          SUBJECT_BG[subjKey],
                        )}
                      />
                    </span>
                  )}
                  <span
                    className={cn(
                      "truncate",
                      isDone && "line-through decoration-ink-faint/40",
                    )}
                  >
                    {s.subjectName ?? s.subjectKey ?? "Bez przedmiotu"}
                  </span>
                </div>
                <div
                  className={cn(
                    "display font-medium text-[19px] sm:text-[21px] leading-tight truncate",
                    isDone
                      ? "line-through decoration-rule-strong decoration-2 text-ink-faint"
                      : "text-ink group-hover:text-amber transition-colors duration-300",
                  )}
                >
                  {s.topicName ?? "—"}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-4 relative z-10">
                <div
                  className={cn(
                    "mono text-[13px] sm:text-sm transition-colors duration-300",
                    isDone
                      ? "text-ink-faint"
                      : "text-ink-muted group-hover:text-ink",
                  )}
                >
                  {formatMinutes(s.plannedMinutes)}
                </div>
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300",
                    isDone
                      ? "border-transparent bg-kumo-base/50"
                      : "border-rule bg-paper group-hover:border-amber/30 group-hover:bg-amber/10 group-hover:scale-110",
                  )}
                >
                  <ArrowRightIcon
                    size={14}
                    weight={isDone ? "regular" : "bold"}
                    className={cn(
                      "transition-all duration-300",
                      isDone
                        ? "text-ink-faint"
                        : "text-ink-muted group-hover:text-amber group-hover:translate-x-0.5",
                    )}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
