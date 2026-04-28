import { Button, Meter } from "@cloudflare/kumo";
import { XIcon } from "@phosphor-icons/react";

type Props = {
  current: number;
  total: number;
  progress: number;
  onExit: () => void;
};

export function ReviewHeader({ current, total, progress, onExit }: Props) {
  return (
    <div className="flex items-center gap-5 px-6 py-4 border-b border-rule">
      <Button
        variant="ghost"
        icon={XIcon}
        onClick={onExit}
        className="text-ink-muted hover:text-amber mono text-[14px] uppercase shrink-0"
      >
        Zamknij
      </Button>
      <div className="flex-1 min-w-0">
        <Meter
          label="Postęp sesji"
          value={Math.round(progress * 100)}
          customValue={`${current} / ${total}`}
          indicatorClassName="bg-amber"
        />
      </div>
    </div>
  );
}
