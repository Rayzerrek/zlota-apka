import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { PageHead } from "../components/layout/PageHead";
import { useSavedFeedback } from "../hooks/useSavedFeedback";
import { cn } from "../utils/cn";

export function SettingsPage() {
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("settings.notifications") !== "false",
  );
  const [dailyTarget, setDailyTarget] = useState(() => {
    const raw = localStorage.getItem("settings.dailyTarget");
    const n = raw !== null ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : 20;
  });
  const [sound, setSound] = useState(
    () => localStorage.getItem("settings.sound") === "true",
  );
  const { saved, markSaved } = useSavedFeedback(1600);

  function handleNotificationsChange(v: boolean) {
    setNotifications(v);
    localStorage.setItem("settings.notifications", String(v));
    markSaved();
  }

  function handleSoundChange(v: boolean) {
    setSound(v);
    localStorage.setItem("settings.sound", String(v));
    markSaved();
  }

  function handleDailyTargetChange(v: number) {
    setDailyTarget(v);
    localStorage.setItem("settings.dailyTarget", String(v));
    markSaved();
  }

  return (
    <>
      <PageHead
        eyebrow="Preferencje"
        title={
          <>
            <em>Ustawienia</em>
          </>
        }
      />

      <div className="flex flex-col gap-8 max-w-[600px]">
        <section className="enter enter-d1 flex flex-col gap-6">
          <div className="pb-3 border-b border-rule flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="mono text-xs text-amber tracking-[0.16em]">
                01 —
              </span>
              <h2 className="display text-[20px] tracking-[-0.01em] text-ink">
                Nauka
              </h2>
            </div>
            {saved && (
              <span className="mono text-[10px] tracking-[0.14em] uppercase text-rating-4 flex items-center gap-1.5">
                <CheckIcon size={11} weight="bold" />
                Zapisano
              </span>
            )}
          </div>

          <ToggleRow
            label="Powiadomienia"
            hint="Codzienne przypomnienia o powtórkach."
            checked={notifications}
            onChange={handleNotificationsChange}
          />

          <ToggleRow
            label="Dźwięki"
            hint="Subtelne dźwięki przy ocenianiu kart."
            checked={sound}
            onChange={handleSoundChange}
          />

          <label className="flex items-center justify-between gap-6 py-4 border-b border-dashed border-rule">
            <div className="flex flex-col gap-1">
              <span className="text-[15px] text-ink">Dzienny limit kart</span>
              <span className="text-[12px] text-ink-faint">
                Maksymalna liczba nowych kart dziennie.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={dailyTarget}
                onChange={(e) =>
                  handleDailyTargetChange(Number(e.target.value))
                }
                className="range-amber"
              />
              <span className="mono text-[20px] text-amber tabular-nums w-[48px] text-right">
                {dailyTarget}
              </span>
            </div>
          </label>
        </section>

        <section className="enter enter-d2 flex flex-col gap-4">
          <div className="pb-3 border-b border-rule flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.16em]">
              02 —
            </span>
            <h2 className="display text-[20px] tracking-[-0.01em] text-ink">
              O aplikacji
            </h2>
          </div>
          <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-[14px]">
            <dt className="mono text-[11px] text-ink-faint tracking-[0.14em] uppercase self-center">
              Wersja
            </dt>
            <dd className="mono text-ink-muted">0.0.0 — dev</dd>
            <dt className="mono text-[11px] text-ink-faint tracking-[0.14em] uppercase self-center">
              Build
            </dt>
            <dd className="mono text-ink-muted">local</dd>
          </dl>
        </section>
      </div>
    </>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-6 py-4 border-b border-dashed border-rule cursor-pointer">
      <div className="flex flex-col gap-1">
        <span className="text-[15px] text-ink">{label}</span>
        {hint && <span className="text-[12px] text-ink-faint">{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-[38px] h-[22px] p-0 rounded-full cursor-pointer shrink-0 border transition-all duration-[0.25s]",
          checked ? "bg-amber border-amber" : "bg-paper-2 border-rule",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-[0.25s] [transition-timing-function:var(--ease-spring)]",
            checked ? "translate-x-4 bg-paper" : "bg-ink-muted",
          )}
        />
      </button>
    </label>
  );
}
