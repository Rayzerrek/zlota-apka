import { ArrowRightIcon, FlameIcon, ClockCounterClockwiseIcon } from "@phosphor-icons/react";
import { Button } from "@cloudflare/kumo";
import { EXAMS, SESSIONS, STUDY_STATS, TODAY } from "../../data/mock";
import { SUBJECTS, subjectName } from "../../utils/subjects";
import { dayLong, daysBetween, longDate } from "../../utils/date";
import { PageHead } from "../../components/PageHead";

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
            <h1 className="text-[var(--amber)]">Hello</h1>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-[1.3fr_1fr] min-[900px]:gap-14">
        <div className="flex flex-col gap-[18px] relative enter enter-d1">
          <p className="text-base text-[var(--ink-muted)] max-w-[38ch] leading-[1.5]">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Est, aliquam! Doloremque
            ducimus corporis nulla impedit facilis illum veniam? Alias at repellat accusantium quas.
            Culpa ducimus fugiat ea, atque iusto cum?
          </p>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <Button
              size="lg"
              variant="ghost"
              onClick={onStart}
              className="bg-[var(--amber)] text-[var(--paper)] rounded-sm hover:bg-[#ffcc4a] hover:-translate-y-px active:translate-y-0 transition-all font-semibold px-7 py-4 tracking-[0.02em]"
            >
              Zacznij powtórkę
              <ArrowRightIcon size={18} weight="bold" className="ml-1" />
            </Button>
            <Button
              variant="outline"
              icon={ClockCounterClockwiseIcon}
              className="rounded-sm ring-[var(--rule-strong)] text-[var(--ink)] hover:ring-[var(--amber)] hover:text-[var(--amber)] py-3.5 px-5 text-sm"
            >
              Przełóż na jutro
            </Button>
          </div>
        </div>

        <aside className="flex flex-col gap-7 enter enter-d2">
          {nextExam && (
            <div className="exam-card">
              <div className="exam-eyebrow">Najbliższy sprawdzian</div>
              <div className="exam-title">{nextExam.name}</div>
              <div className="flex items-baseline gap-2.5">
                <span className="days mono">{examDays}</span>
                <span className="days-label">
                  {examDays === 1 ? "dzień" : "dni"}
                  <br />
                  do terminu
                </span>
              </div>
              <div className="mono text-xs text-[var(--ink-muted)] mt-1.5 flex justify-between pt-3 border-t border-dashed border-[var(--rule-strong)]">
                <span>{subjectName(nextExam.subject)}</span>
                <span>{longDate(nextExam.dateISO)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 border border-[var(--rule)] rounded-sm bg-[var(--paper-2)]">
            <div className="p-[18px] flex flex-col gap-1">
              <div className="streak-num">
                <em>{STUDY_STATS.streakDays}</em>
              </div>
              <div className="mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-faint)]">
                <FlameIcon size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                dni z rzędu
              </div>
            </div>
            <div className="p-[18px] flex flex-col gap-1 border-l border-[var(--rule)]">
              <div className="streak-num mono">{STUDY_STATS.weekMinutes}</div>
              <div className="mono text-[10px] tracking-[0.16em] uppercase text-[var(--ink-faint)]">
                min w tym tygodniu
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-16">
        <div className="flex items-baseline justify-between gap-3 mb-5 pb-3 border-b border-[var(--rule)]">
          <h2 className="section-title">
            <span className="num mono">01 —</span> Plan dnia
          </h2>
          <span className="mono text-[11px] tracking-[0.14em] uppercase text-[var(--ink-faint)]">
            {todaySessions.filter((s) => s.done).length} / {todaySessions.length} ukończone
          </span>
        </div>

        {todaySessions.map((s, idx) => {
          const subj = SUBJECTS[s.subject];
          return (
            <button
              key={s.id}
              type="button"
              className="group grid grid-cols-[52px_1fr_auto] gap-5 items-center py-[18px] px-1 w-full text-left border-b border-[var(--rule)] cursor-pointer transition-[background] duration-200 hover:bg-white/[0.015] enter"
              style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
              data-done={s.done}
              onClick={() => !s.done && onOpenSession(s.id)}
            >
              <span
                className={`mono text-[13px] tracking-[0.04em] ${s.done ? "text-[var(--ink-faint)]" : "text-[var(--ink-muted)]"}`}
              >
                {s.timeOfDay}
              </span>
              <span className="flex flex-col gap-1 min-w-0">
                <span className="flex items-center gap-2 mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-muted)]">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: subj.color }}
                  />
                  {subj.name}
                </span>
                <span
                  className={`display font-normal text-[18px] text-[var(--ink)] leading-[1.2] tracking-[-0.005em] ${s.done ? "line-through decoration-[var(--rule-strong)] decoration-[1px] !text-[var(--ink-faint)]" : ""}`}
                >
                  {s.topic}
                </span>
              </span>
              <span className="mono text-sm text-[var(--ink)] flex items-center gap-2.5">
                <span className="text-[var(--ink-faint)]">{s.cardIds.length} kart</span>
                <ArrowRightIcon
                  size={16}
                  className="text-[var(--ink-faint)] transition-all duration-[0.25s] group-hover:text-[var(--amber)] group-hover:translate-x-1"
                />
              </span>
            </button>
          );
        })}
      </section>
    </>
  );
}
