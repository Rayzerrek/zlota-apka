import { Button } from "@cloudflare/kumo";
import { CheckIcon } from "@phosphor-icons/react";

import { cn } from "../../utils/cn";

type Props = {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
};

export function ThemeOption({ active, onClick, icon, label }: Props) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-4 py-3.5 border rounded-xs text-[17px] font-medium transition-all duration-200 text-left justify-start",
        active
          ? "border-amber text-ink bg-[linear-gradient(180deg,var(--color-amber-wash),transparent_80%),var(--color-paper-2)]"
          : "border-rule bg-kumo-base text-ink-muted hover:border-rule-strong hover:text-ink",
      )}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <CheckIcon size={14} weight="bold" className="ml-auto text-amber" />
      )}
    </Button>
  );
}
