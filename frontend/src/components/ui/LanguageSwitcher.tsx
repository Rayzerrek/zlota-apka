import { useTranslation } from "react-i18next";

import { cn } from "../../utils/cn";

type Props = {
  className?: string;
};

export function LanguageSwitcher({ className }: Props) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <div
      className={cn(
        "flex items-center bg-paper-3 rounded-sm p-0.5 ring-1 ring-rule",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => i18n.changeLanguage("pl")}
        className={cn(
          "px-2 py-1 rounded-xs mono text-[12px] uppercase cursor-pointer transition-all duration-200",
          currentLang === "pl"
            ? "bg-paper-2 text-ink ring-1 ring-rule-strong"
            : "text-ink-faint hover:text-ink-muted",
        )}
      >
        PL
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage("en")}
        className={cn(
          "px-2 py-1 rounded-xs mono text-[12px] uppercase cursor-pointer transition-all duration-200",
          currentLang === "en"
            ? "bg-paper-2 text-ink ring-1 ring-rule-strong"
            : "text-ink-faint hover:text-ink-muted",
        )}
      >
        EN
      </button>
    </div>
  );
}
