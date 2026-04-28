import { Button, Empty } from "@cloudflare/kumo";
import {
  ArrowRightIcon,
  CalendarPlusIcon,
  CoffeeIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router";

import { cn } from "../../utils/cn";
import { SUBJECT_BG } from "../../utils/subjects";

import type { SubjectKey } from "../../types";
import type { ApiDashboardSession } from "../../types/api";

type Props = {
  sessions: ApiDashboardSession[];
  onOpenSession: (id: string) => void;
};

function toSubjectKey(k: string | null): SubjectKey | null {
  if (k === null) return null;
  if (k in SUBJECT_BG) return k as SubjectKey;
  return null;
}

export function SessionList({ sessions, onOpenSession }: Props) {
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return (
      <section className="mt-16">
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
                onClick={() => navigate("/calendar")}
              >
                Zaplanuj sprawdzian
              </Button>
              <Button variant="secondary" onClick={() => navigate("/browse")}>
                Przejrzyj karty
              </Button>
            </div>
          }
        />
      </section>
    );
  }

  return (
    <section className="mt-16">
      <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
        <h2 className="display font-normal text-[25px] text-ink flex items-baseline gap-3">
          <span className="mono text-xs text-amber">01 —</span> Plan dnia
        </h2>
        <span className="mono text-[14px] uppercase text-ink-faint">
          {sessions.filter((s) => s.status === "completed").length} /{" "}
          {sessions.length} ukończone
        </span>
      </div>

      {sessions.map((s) => {
        const isDone = s.status === "completed";
        const subjKey = toSubjectKey(s.subjectKey);
        return (
          <Button
            key={s.id}
            type="button"
            variant="ghost"
            className="group grid grid-cols-[1fr_auto] gap-5 items-center py-[18px] px-1 w-full text-left border-b border-rule transition-[background] duration-200 hover:bg-white/[0.015] justify-start"
            onClick={() => !isDone && onOpenSession(s.id)}
          >
            <span className="flex flex-col gap-1 min-w-0">
              <span className="flex items-center gap-2 mono text-[13px] uppercase text-ink-muted">
                {subjKey && (
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      SUBJECT_BG[subjKey],
                    )}
                  />
                )}
                {s.subjectName ?? s.subjectKey ?? ""}
              </span>
              <span
                className={cn(
                  "display font-normal text-[21px] leading-[1.2]",
                  isDone
                    ? "line-through decoration-rule-strong decoration-[1px] text-ink-faint"
                    : "text-ink",
                )}
              >
                {s.topicName ?? "—"}
              </span>
            </span>
            <span className="mono text-sm text-ink flex items-center gap-2.5">
              <span className="text-ink-faint">{s.plannedMinutes} min</span>
              <ArrowRightIcon
                size={16}
                className="text-ink-faint transition-all duration-[0.25s] group-hover:text-amber group-hover:translate-x-1"
              />
            </span>
          </Button>
        );
      })}
    </section>
  );
}
