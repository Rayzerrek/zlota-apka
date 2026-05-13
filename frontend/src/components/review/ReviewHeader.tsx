import { Button } from "@cloudflare/kumo/components/button";
import { Meter } from "@cloudflare/kumo/components/meter";
import { XIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

type Props = {
  current: number;
  total: number;
  progress: number;
  onExit: () => void;
  subtitle?: string | null;
};

export function ReviewHeader({
  current,
  total,
  progress,
  onExit,
  subtitle,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-5 px-6 py-4 border-b border-rule">
      <Button
        variant="ghost"
        icon={XIcon}
        onClick={onExit}
        className="text-ink-muted hover:text-amber mono text-[14px] uppercase shrink-0"
      >
        {t("review.close")}
      </Button>
      <div className="flex-1 min-w-0">
        <Meter
          label={subtitle ?? t("review.reviewProgress")}
          value={Math.round(progress * 100)}
          customValue={`${current} / ${total}`}
          indicatorClassName="bg-amber"
        />
      </div>
    </div>
  );
}
