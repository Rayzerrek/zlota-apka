import { Button } from "@cloudflare/kumo/components/button";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { cn } from "../../utils/cn";

type Props = {
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  viewMode: "week" | "month";
  onToggleView: () => void;
};

export function CalendarNav({
  onPrev,
  onToday,
  onNext,
  viewMode,
  onToggleView,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5 items-center justify-between">
      <div className="flex gap-2.5 items-center order-2 sm:order-1">
        <Button
          variant="outline"
          icon={CaretLeftIcon}
          onClick={onPrev}
          className="rounded-sm ring-rule-strong text-ink hover:ring-amber hover:text-amber"
        >
          <span className="hidden sm:inline">{t("calendar.prev")}</span>
        </Button>
        <Button
          variant="outline"
          onClick={onToday}
          className="rounded-sm ring-rule-strong text-ink hover:ring-amber hover:text-amber"
        >
          {t("calendar.today")}
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          className="rounded-sm ring-rule-strong text-ink hover:ring-amber hover:text-amber"
        >
          <span className="hidden sm:inline">{t("calendar.next")}</span>
          <CaretRightIcon size={14} />
        </Button>
      </div>

      <div className="flex bg-paper-3 rounded-sm p-0.5 ring-1 ring-rule order-1 sm:order-2">
        <button
          type="button"
          onClick={viewMode === "month" ? onToggleView : undefined}
          className={cn(
            "px-3 py-1.5 rounded-xs mono text-[13px] uppercase cursor-pointer transition-all duration-200",
            viewMode === "week"
              ? "bg-paper-2 text-ink ring-1 ring-rule-strong"
              : "text-ink-faint hover:text-ink-muted",
          )}
        >
          {t("calendar.week")}
        </button>
        <button
          type="button"
          onClick={viewMode === "week" ? onToggleView : undefined}
          className={cn(
            "px-3 py-1.5 rounded-xs mono text-[13px] uppercase cursor-pointer transition-all duration-200",
            viewMode === "month"
              ? "bg-paper-2 text-ink ring-1 ring-rule-strong"
              : "text-ink-faint hover:text-ink-muted",
          )}
        >
          {t("calendar.month")}
        </button>
      </div>
    </div>
  );
}
