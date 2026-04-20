import { Button } from "@cloudflare/kumo";
import { ArrowRightIcon, FlameIcon } from "@phosphor-icons/react";

import { PageHead } from "../../components/PageHead";
import { EXAMS, SESSIONS, STUDY_STATS, TODAY } from "../../data/mock";
import { dayLong, daysBetween, longDate } from "../../utils/date";
import { SUBJECTS, subjectName } from "../../utils/subjects";
import { cn } from "../../utils/utils";

type Props = {
  onStart: () => void;
  onOpenSession: (id: string) => void;
};

export function TodayPage({ onStart, onOpenSession }: Props) {
  const todaySessions = SESSIONS.filter((s) => s.dateISO === TODAY);
  const nextExam = [...EXAMS]
    .filter((e) => e.dateISO >= TODAY)
    .sort((a, b) => a.dateISO.localeCompare(b.dateISO))[0];

  const examDays = nextExam ? daysBetween(TODAY, nextExam.dateISO) : null;

  return (
    <>
      <PageHead
        eyebrow={`${dayLong(TODAY)} · ${longDate(TODAY)}`}
        title={
          <>
            <span className="text-amber">Hello</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1.3fr_1fr] min-[900px]:gap-14">
        <div className="enter enter-d1 flex flex-col gap-[18px] relative">
          <p className="text-base text-ink-muted max-w-[38ch] leading-[1.5]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Est,
            aliquam! Doloremque ducimus corporis nulla impedit facilis illum
            veniam? Alias at repellat accusantium quas. Culpa ducimus fugiat ea,
            atque iusto cum?
          </p>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <Button
              size="lg"
              variant="ghost"
              onClick={onStart}
              className="bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] hover:-translate-y-px active:translate-y-0 transition-all font-semibold px-7 py-4 tracking-[0.02em]"
            >
              Zacznij powtórkę
              <ArrowRightIcon size={18} weight="bold" className="ml-1" />
            </Button>
          </div>
        </div>

        <aside className="enter enter-d2 flex flex-col gap-7">
          {nextExam && (
            <div className="relative overflow-hidden flex flex-col gap-3.5 p-[22px_22px_24px] border border-rule rounded-[3px] bg-[linear-gradient(180deg,rgba(242,184,48,0.04),transparent_60%),var(--color-paper-2)]">
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(135deg,transparent,transparent_18px,rgba(242,184,48,0.02)_18px,rgba(242,184,48,0.02)_19px)]"
              />
              <div className="relative mono text-[10px] tracking-[0.18em] uppercase text-amber flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-px after:opacity-40 after:bg-[linear-gradient(90deg,var(--color-amber),transparent)]">
                Najbliższy sprawdzian
              </div>
              <div className="relative display italic text-[32px] font-medium leading-none text-ink">
                {nextExam.name}
              </div>
              <div className="relative flex items-baseline gap-2.5">
                <span className="mono font-light text-[72px] leading-[0.9] tracking-[-0.04em] text-amber">
                  {examDays}
                </span>
                <span className="mono text-xs text-ink-muted tracking-[0.16em] uppercase">
                  {examDays === 1 ? "dzień" : "dni"}
                  <br />
                  do terminu
                </span>
              </div>
              <div className="relative mono text-xs text-ink-muted mt-1.5 flex justify-between pt-3 border-t border-dashed border-rule-strong">
                <span>{subjectName(nextExam.subject)}</span>
                <span>{longDate(nextExam.dateISO)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 border border-rule rounded-sm bg-paper-2">
            <div className="p-[18px] flex flex-col gap-1">
              <div className="display font-normal text-[36px] leading-none text-ink">
                <em className="italic text-amber">{STUDY_STATS.streakDays}</em>
              </div>
              <div className="mono text-[10px] tracking-[0.16em] uppercase text-ink-faint">
                <FlameIcon
                  size={10}
                  style={{ marginRight: 4, verticalAlign: -1 }}
                />
                dni z rzędu
              </div>
            </div>
            <div className="p-[18px] flex flex-col gap-1 border-l border-rule">
              <div className="display mono font-normal text-[36px] leading-none text-ink">
                {STUDY_STATS.weekMinutes}
              </div>
              <div className="mono text-[10px] tracking-[0.16em] uppercase text-ink-faint">
                min w tym tygodniu
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-16">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-rule">
          <h2 className="display font-normal text-[22px] tracking-[-0.01em] text-ink flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.08em]">
              01 —
            </span>{" "}
            Plan dnia
          </h2>
          <span className="mono text-[11px] tracking-[0.14em] uppercase text-ink-faint">
            {todaySessions.filter((s) => s.done).length} /{" "}
            {todaySessions.length} ukończone
          </span>
        </div>

        {todaySessions.map((s, idx) => {
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
                  "mono text-[13px] tracking-[0.04em]",
                  s.done ? "text-ink-faint" : "text-ink-muted",
                )}
              >
                {s.timeOfDay}
              </span>
              <span className="flex flex-col gap-1 min-w-0">
                <span className="flex items-center gap-2 mono text-[10px] tracking-[0.2em] uppercase text-ink-muted">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: subj.color }}
                  />
                  {subj.name}
                </span>
                <span
                  className={cn(
                    "display font-normal text-[18px] leading-[1.2] tracking-[-0.005em]",
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
    </>
  );
}
