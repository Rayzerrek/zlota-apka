import { STUDY_STATS } from "../../data/mock";

export function TodayStats() {
  return (
    <div className="grid grid-cols-2 border border-rule rounded-sm bg-paper-2">
      <div className="p-[18px] flex flex-col gap-1">
        <div className="display font-normal text-[43px] leading-none text-ink">
          <em className="italic text-amber">{STUDY_STATS.streakDays}</em>
        </div>
        <div className="mono text-[16px] tracking-[0.16em] uppercase text-ink-faint">
          dni z rzędu
        </div>
      </div>
      <div className="p-[18px] flex flex-col gap-1 border-l border-rule">
        <div className="display mono font-normal text-[43px] leading-none text-ink">
          {STUDY_STATS.weekMinutes}
        </div>
        <div className="mono text-[16px] tracking-[0.16em] uppercase text-ink-faint">
          min w tym tygodniu
        </div>
      </div>
    </div>
  );
}
