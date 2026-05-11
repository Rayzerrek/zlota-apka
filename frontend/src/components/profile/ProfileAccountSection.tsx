import { useState } from "react";

import { cn } from "../../utils/cn";
import { ProfileField } from "./ProfileField";

const LANGUAGES: { value: string; label: string }[] = [
  { value: "pl", label: "Polski" },
  { value: "en", label: "English" },
];

const TIMEZONES: { value: string; label: string }[] = [
  { value: "Europe/Warsaw", label: "Europa / Warszawa (UTC+1)" },
  { value: "Europe/London", label: "Europa / Londyn (UTC+0)" },
  { value: "Europe/Berlin", label: "Europa / Berlin (UTC+1)" },
  { value: "Europe/Paris", label: "Europa / Paryż (UTC+1)" },
  { value: "America/New_York", label: "Ameryka / Nowy Jork (UTC−5)" },
  { value: "America/Los_Angeles", label: "Ameryka / Los Angeles (UTC−8)" },
  { value: "Asia/Tokyo", label: "Azja / Tokio (UTC+9)" },
  { value: "UTC", label: "UTC" },
];

const inputCls =
  "w-full px-3.5 py-3 bg-kumo-base border border-rule rounded-[2px] text-ink text-[18px] outline-none transition-colors duration-200 hover:border-rule-strong focus:border-amber";

type Props = {
  email: string;
  setEmail?: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  isGuest?: boolean;
  onConfirmEmail?: () => void;
  onSendMagicLink?: () => void;
  confirmLoading?: boolean;
  sendLoading?: boolean;
  confirmError?: string | null;
  sendError?: string | null;
};

export function ProfileAccountSection({
  email,
  setEmail,
  language,
  setLanguage,
  timezone,
  setTimezone,
  isGuest = false,
  onConfirmEmail,
  onSendMagicLink,
  confirmLoading,
  sendLoading,
  confirmError,
  sendError,
}: Props) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <section className="enter enter-d1 flex flex-col gap-6">
      <div className="pb-3 border-b border-rule flex items-baseline gap-3">
        <span className="mono text-xs text-amber">01 —</span>
        <h2 className="display text-[23px] text-ink">Konto</h2>
      </div>

      <ProfileField
        label="Adres email"
        hint="Używany do logowania i powiadomień."
      >
        <div className="flex flex-col gap-4">
          {!showLogin && (
            <>
              <div className="flex gap-3 items-start">
                <div className="flex-1 min-w-0">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail?.(e.target.value)}
                    readOnly={!isGuest}
                    disabled={!isGuest}
                    placeholder={isGuest ? "Wpisz swój adres e-mail" : ""}
                    className={cn(
                      inputCls,
                      !isGuest && "opacity-60 cursor-not-allowed",
                    )}
                    autoComplete="email"
                  />
                </div>
                {isGuest && email.trim() !== "" && (
                  <button
                    type="button"
                    disabled={confirmLoading}
                    className="shrink-0 px-4 py-3 bg-amber text-paper rounded-[2px] font-medium transition-colors hover:bg-[#ffcc4a] text-sm disabled:opacity-60"
                    onClick={onConfirmEmail}
                  >
                    {confirmLoading ? "Wysyłanie…" : "Potwierdź"}
                  </button>
                )}
              </div>
              {confirmError && (
                <p className="text-sm text-red-400">{confirmError}</p>
              )}
              {isGuest && (
                <div className="text-sm text-ink-muted">
                  Masz już konto?{" "}
                  <button
                    type="button"
                    onClick={() => setShowLogin(true)}
                    className="text-amber hover:underline font-medium"
                  >
                    Zaloguj się
                  </button>
                </div>
              )}
            </>
          )}

          {showLogin && isGuest && (
            <div className="p-4 bg-paper-3 border border-rule rounded-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink m-0">
                  Zaloguj się
                </h3>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  Wróć
                </button>
              </div>
              <p className="text-sm text-ink-muted m-0">
                Wpisz adres e-mail powiązany z Twoim kontem. Wyślemy Ci
                jednorazowy link (Magic Link), dzięki któremu zalogujesz się
                bezpiecznie bez użycia hasła.
              </p>
              <div className="flex gap-3 items-start mt-2">
                <input
                  type="email"
                  placeholder="twój@email.pl"
                  defaultValue={email}
                  onChange={(e) => setEmail?.(e.target.value)}
                  className={cn(inputCls, "flex-1 min-w-0")}
                />
                <button
                  type="button"
                  disabled={sendLoading}
                  className="shrink-0 px-4 py-3 bg-amber text-paper rounded-[2px] font-medium transition-colors hover:bg-[#ffcc4a] text-sm disabled:opacity-60"
                  onClick={onSendMagicLink}
                >
                  {sendLoading ? "Wysyłanie…" : "Wyślij link"}
                </button>
              </div>
              {sendError && <p className="text-sm text-red-400">{sendError}</p>}
            </div>
          )}
        </div>
      </ProfileField>

      <ProfileField label="Język interfejsu">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={cn(inputCls, "select-chevron")}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </ProfileField>

      <ProfileField label="Strefa czasowa">
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className={cn(inputCls, "select-chevron")}
        >
          {TIMEZONES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </ProfileField>
    </section>
  );
}
