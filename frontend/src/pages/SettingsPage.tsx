import { Input } from "@cloudflare/kumo/components/input";
import { Label } from "@cloudflare/kumo/components/label";
import { Switch } from "@cloudflare/kumo/components/switch";
import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PageHead } from "../components/layout/PageHead";
import { ProfileAppearanceSection } from "../components/profile/ProfileAppearanceSection";
import { LanguageSwitcher } from "../components/ui/LanguageSwitcher";
import { useSavedFeedback } from "../hooks/useSavedFeedback";
import { useTheme } from "../hooks/useTheme";

export function SettingsPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("settings.notifications") !== "false",
  );
  const [dailyTarget, setDailyTarget] = useState(() => {
    const raw = localStorage.getItem("settings.dailyTarget");
    const n = raw !== null ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : 20;
  });
  const [sound, setSound] = useState(
    () => localStorage.getItem("settings.sound") === "true",
  );
  const { saved, markSaved } = useSavedFeedback(1600);

  function handleNotificationsChange(v: boolean) {
    setNotifications(v);
    localStorage.setItem("settings.notifications", String(v));
    markSaved();
  }

  function handleSoundChange(v: boolean) {
    setSound(v);
    localStorage.setItem("settings.sound", String(v));
    markSaved();
  }

  function handleDailyTargetChange(v: number) {
    setDailyTarget(v);
    localStorage.setItem("settings.dailyTarget", String(v));
    markSaved();
  }

  return (
    <>
      <PageHead
        eyebrow={t("settings.eyebrow")}
        title={
          <>
            <em>{t("settings.title").replace(/<\/?em>/g, "")}</em>
          </>
        }
      />

      <div className="flex flex-col gap-8 max-w-[600px]">
        <section className="enter enter-d1 flex flex-col gap-6">
          <div className="pb-3 border-b border-rule flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="mono text-xs text-amber">01 —</span>
              <h2 className="display text-[23px] text-ink">
                {t("settings.study")}
              </h2>
            </div>
            {saved && (
              <span className="mono text-[13px] uppercase text-rating-4 flex items-center gap-1.5">
                <CheckIcon size={11} weight="bold" />
                {t("common.saved")}
              </span>
            )}
          </div>

          <Label className="flex items-center justify-between gap-6 py-4 border-b border-dashed border-rule cursor-pointer">
            <div className="flex flex-col gap-1">
              <span className="text-[18px] text-ink">
                {t("settings.notifications")}
              </span>
              <span className="text-[15px] text-ink-faint">
                {t("settings.notificationsHint")}
              </span>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={handleNotificationsChange}
            />
          </Label>

          <Label className="flex items-center justify-between gap-6 py-4 border-b border-dashed border-rule cursor-pointer">
            <div className="flex flex-col gap-1">
              <span className="text-[18px] text-ink">
                {t("settings.sounds")}
              </span>
              <span className="text-[15px] text-ink-faint">
                {t("settings.soundsHint")}
              </span>
            </div>
            <Switch checked={sound} onCheckedChange={handleSoundChange} />
          </Label>

          <Label className="flex items-center justify-between gap-6 py-4 border-b border-dashed border-rule">
            <div className="flex flex-col gap-1">
              <span className="text-[18px] text-ink">
                {t("settings.dailyLimit")}
              </span>
              <span className="text-[15px] text-ink-faint">
                {t("settings.dailyLimitHint")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="range"
                min={5}
                max={100}
                step={5}
                value={dailyTarget}
                onChange={(e) =>
                  handleDailyTargetChange(Number(e.target.value))
                }
                className="range-amber"
              />
              <span className="mono text-[23px] text-amber tabular-nums w-[48px] text-right">
                {dailyTarget}
              </span>
            </div>
          </Label>

          <div className="flex items-center justify-between gap-6 py-4 border-b border-dashed border-rule">
            <div className="flex flex-col gap-1">
              <span className="text-[18px] text-ink">
                {t("settings.language")}
              </span>
              <span className="text-[15px] text-ink-faint">
                {t("settings.languageHint")}
              </span>
            </div>
            <LanguageSwitcher />
          </div>
        </section>

        <ProfileAppearanceSection theme={theme} onThemeChange={setTheme} />

        <section className="enter enter-d2 flex flex-col gap-4">
          <div className="pb-3 border-b border-rule flex items-baseline gap-3">
            <span className="mono text-xs text-amber">03 —</span>
            <h2 className="display text-[23px] text-ink">
              {t("settings.about")}
            </h2>
          </div>
          <dl className="grid grid-cols-[140px_1fr] gap-y-3 text-[17px]">
            <dt className="mono text-[14px] text-ink-faint uppercase self-center">
              {t("settings.version")}
            </dt>
            <dd className="mono text-ink-muted">0.0.0 — dev</dd>
            <dt className="mono text-[14px] text-ink-faint uppercase self-center">
              {t("settings.build")}
            </dt>
            <dd className="mono text-ink-muted">local</dd>
          </dl>
        </section>
      </div>
    </>
  );
}
