import { Button } from "@cloudflare/kumo";
import { XIcon } from "@phosphor-icons/react";

type Props = {
  current: number;
  total: number;
  progress: number;
  onExit: () => void;
};

export function ReviewHeader({ current, total, progress, onExit }: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-rule relative">
      <Button
        variant="ghost"
        icon={XIcon}
        onClick={onExit}
        className="text-ink-muted hover:text-amber mono text-[11px] tracking-[0.16em] uppercase"
      >
        Zamknij
      </Button>
      <span className="mono text-[11px] tracking-[0.16em] uppercase text-ink-muted">
        <span className="text-ink font-semibold">{current}</span> / {total}
      </span>
      <span className="w-20" />
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-amber transition-[width] duration-[0.4s] [transition-timing-function:var(--ease-out)]"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
