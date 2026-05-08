import { CheckIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import { cn } from "../../utils/cn";

type OptionPickerOption = {
  value: string;
  label: string;
  meta?: string;
  color?: string;
};

type Props = {
  value: string;
  options: OptionPickerOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  searchPlaceholder: string;
  emptyText: string;
};

export function OptionPicker({
  value,
  options,
  onChange,
  ariaLabel,
  searchPlaceholder,
  emptyText,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((option) =>
      `${option.label} ${option.meta ?? ""}`.toLowerCase().includes(term),
    );
  }, [options, query]);

  return (
    <div className="w-full rounded-[3px] border border-rule bg-paper-3">
      <div className="border-b border-rule px-2.5 py-2">
        <div className="flex items-center gap-2 rounded-[3px] border border-rule bg-paper px-2.5 py-1.5">
          <MagnifyingGlassIcon size={14} className="text-ink-faint shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
      </div>

      <div
        role="listbox"
        aria-label={ariaLabel}
        className="max-h-44 overflow-y-auto p-1.5"
      >
        {filtered.length === 0 ? (
          <p className="px-2 py-2 text-[13px] text-ink-muted">{emptyText}</p>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((option) => {
              const active = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onChange(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[3px] border px-2.5 py-2 text-left transition-colors",
                    active
                      ? "border-amber/50 bg-amber-wash text-ink"
                      : "border-transparent text-ink-muted hover:border-rule-strong hover:text-ink",
                  )}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-rule-strong"
                    style={
                      option.color ? { background: option.color } : undefined
                    }
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px]">
                    {option.label}
                  </span>
                  {option.meta && (
                    <span className="truncate text-[12px] text-ink-faint">
                      {option.meta}
                    </span>
                  )}
                  {active && (
                    <CheckIcon size={14} weight="bold" className="text-amber" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
