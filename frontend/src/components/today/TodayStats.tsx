import { useStudyStats } from "../../hooks/api/useStudyStats";

export function TodayStats() {
  const { streakDays, weekMinutes, isLoading } = useStudyStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 border border-rule rounded-sm bg-kumo-base animate-pulse">
        <div className="p-[18px] flex flex-col gap-1">
          <div className="display font-normal text-[43px] leading-none text-ink-faint">
            —
          </div>
          <div className="mono text-[16px] uppercase text-ink-faint">
            dni z rzędu
          </div>
        </div>
        <div className="p-[18px] flex flex-col gap-1 border-l border-rule">
          <div className="display mono font-normal text-[43px] leading-none text-ink-faint">
            —
          </div>
          <div className="mono text-[16px] uppercase text-ink-faint">
            min w tym tygodniu
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 border border-rule rounded-sm bg-kumo-base">
      <div className="p-[18px] flex flex-col gap-1">
        <div className="display font-normal text-[43px] leading-none text-ink">
          <em className="italic text-amber">{streakDays}</em>
        </div>
        <div className="mono text-[16px] uppercase text-ink-faint">
          dni z rzędu
        </div>
      </div>
      <div className="p-[18px] flex flex-col gap-1 border-l border-rule">
        <div className="display mono font-normal text-[43px] leading-none text-ink">
          {weekMinutes}
        </div>
        <div className="mono text-[16px] uppercase text-ink-faint">
          min w tym tygodniu
        </div>
      </div>
    </div>
  );
}
