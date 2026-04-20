import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { ThemeOption } from "../ui/ThemeOption";
import { ProfileField } from "./ProfileField";

type Props = {
  theme: "dark" | "light";
  onThemeChange: (t: "dark" | "light") => void;
};

export function ProfileAppearanceSection({ theme, onThemeChange }: Props) {
  return (
    <section className="enter enter-d2 flex flex-col gap-6">
      <div className="pb-3 border-b border-rule flex items-baseline gap-3">
        <span className="mono text-xs text-amber tracking-[0.16em]">02 —</span>
        <h2 className="display text-[20px] tracking-[-0.01em] text-ink">
          Wygląd
        </h2>
      </div>

      <ProfileField
        label="Motyw"
        hint="Jasny lub ciemny — wybór zapisuje się automatycznie."
      >
        <div className="grid grid-cols-2 gap-2">
          <ThemeOption
            active={theme === "dark"}
            onClick={() => onThemeChange("dark")}
            icon={<MoonIcon size={16} />}
            label="Ciemny"
          />
          <ThemeOption
            active={theme === "light"}
            onClick={() => onThemeChange("light")}
            icon={<SunIcon size={16} />}
            label="Jasny"
          />
        </div>
      </ProfileField>
    </section>
  );
}
