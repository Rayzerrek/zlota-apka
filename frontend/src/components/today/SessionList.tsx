import { Button, Empty } from "@cloudflare/kumo";
import {
  ArrowRightIcon,
  CalendarPlusIcon,
  CoffeeIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router";

import { cn } from "../../utils/cn";
import { SUBJECT_BG, SUBJECTS } from "../../utils/subjects";

import type { StudySession } from "../../types";

type Props = {
  sessions: StudySession[];
  onOpenSession: (id: string) => void;
};

export function SessionList({ sessions, onOpenSession }: Props) {
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return (
      <section className="mt-16">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[25px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.08em]">
              01 —
            </span>{" "}
            Plan dnia
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
        <h2 className="display font-normal text-[25px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
          <span className="mono text-xs text-amber tracking-[0.08em]">
            01 —
          </span>{" "}
          Plan dnia
        </h2>
        <span className="mono text-[14px] tracking-[0.14em] uppercase text-ink-faint">
          {sessions.filter((s) => s.done).length} / {sessions.length} ukończone
        </span>
      </div>

      {sessions.map((s, idx) => {
        const subj = SUBJECTS[s.subject];
        return (
          <button
            key={s.id}
            type="button"
            className="enter group grid grid-cols-[52px_1fr_auto] gap-5 items-center py-[18px] px-1 w-full text-left border-b border-rule cursor-pointer transition-[background] duration-200 hover:bg-white/[0.015]"
            style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
            onClick={() => !s.done && onOpenSession(s.id)}
          >
            <span
              className={cn(
                "mono text-[16px] tracking-[0.04em]",
                s.done ? "text-ink-faint" : "text-ink-muted",
              )}
            >
              {s.timeOfDay}
            </span>
            <span className="flex flex-col gap-1 min-w-0">
              <span className="flex items-center gap-2 mono text-[13px] tracking-[0.2em] uppercase text-ink-muted">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    SUBJECT_BG[s.subject],
                  )}
                />
                {subj.name}
              </span>
              <span
                className={cn(
                  "display font-normal text-[21px] leading-[1.2] tracking-[-0.005em]",
                  s.done
                    ? "line-through decoration-rule-strong decoration-[1px] text-ink-faint"
                    : "text-ink",
                )}
              >
                {s.topic}
              </span>
            </span>
            <span className="mono text-sm text-ink flex items-center gap-2.5">
              <span className="text-ink-faint">{s.cardIds.length} kart</span>
              <ArrowRightIcon
                size={16}
                className="text-ink-faint transition-all duration-[0.25s] group-hover:text-amber group-hover:translate-x-1"
              />
            </span>
          </button>
        );
      })}
    </section>
  );
}
