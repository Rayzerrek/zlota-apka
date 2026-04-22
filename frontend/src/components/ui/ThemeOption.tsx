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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-4 py-3.5 border rounded-[2px] text-[17px] font-medium cursor-pointer transition-all duration-200 text-left",
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
    </button>
  );
}
