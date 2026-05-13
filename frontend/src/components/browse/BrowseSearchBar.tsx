import { Input } from "@cloudflare/kumo/components/input";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

type Props = {
  value: string;
  onChange: (v: string) => void;
  resultCount: number;
};

export function BrowseSearchBar({ value, onChange, resultCount }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-rule rounded-sm mb-5 bg-paper-2">
      <MagnifyingGlassIcon size={16} className="text-ink-faint shrink-0" />
      <Input
        type="search"
        placeholder={t("browse.searchPlaceholder")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={t("browse.searchLabel")}
        className="flex-1 bg-transparent ring-0 shadow-none rounded-none px-0 h-auto text-ink text-[18px] border-0"
      />
      <span className="mono text-xs text-ink-faint">{resultCount}</span>
    </div>
  );
}
