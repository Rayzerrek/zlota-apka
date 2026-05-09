import { Button } from "@cloudflare/kumo/components/button";
import { WarningCircleIcon } from "@phosphor-icons/react";

import { cn } from "../../utils/cn";

type Props = {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon: typeof WarningCircleIcon;
  tone: "warning" | "info";
  eyebrow: string;
};

export function TodayReminderCard({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  tone,
  eyebrow,
}: Props) {
  return (
    <div
      className={cn(
        "rounded-sm border p-4 sm:p-5",
        tone === "warning"
          ? "border-amber/30 bg-[linear-gradient(180deg,rgba(242,184,48,0.12),rgba(242,184,48,0.04))]"
          : "border-rule bg-paper",
      )}
    >
      <div className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-start min-[720px]:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-sm border",
              tone === "warning"
                ? "border-amber/25 bg-amber/12 text-amber"
                : "border-rule bg-kumo-base text-ink-muted",
            )}
          >
            <Icon size={18} weight="fill" />
          </div>
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              {eyebrow}
            </div>
            <h3 className="mt-2 text-[18px] leading-6 text-ink">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              {description}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          className="shrink-0 rounded-sm"
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}
