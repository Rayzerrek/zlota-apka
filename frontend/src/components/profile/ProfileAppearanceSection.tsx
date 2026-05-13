import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { ThemeOption } from "../ui/ThemeOption";
import { ProfileField } from "./ProfileField";

type Props = {
  theme: "dark" | "light";
  onThemeChange: (t: "dark" | "light") => void;
};

export function ProfileAppearanceSection({ theme, onThemeChange }: Props) {
  const { t } = useTranslation();

  return (
    <section className="enter enter-d2 flex flex-col gap-6">
      <div className="pb-3 border-b border-rule flex items-baseline gap-3">
        <span className="mono text-xs text-amber">02 —</span>
        <h2 className="display text-[23px] text-ink">
          {t("profile.appearance")}
        </h2>
      </div>

      <ProfileField
        label={t("profile.themeLabel")}
        hint={t("profile.themeHint")}
      >
        <div className="grid grid-cols-2 gap-2">
          <ThemeOption
            active={theme === "dark"}
            onClick={() => onThemeChange("dark")}
            icon={<MoonIcon size={16} />}
            label={t("profile.dark")}
          />
          <ThemeOption
            active={theme === "light"}
            onClick={() => onThemeChange("light")}
            icon={<SunIcon size={16} />}
            label={t("profile.light")}
          />
        </div>
      </ProfileField>
    </section>
  );
}
