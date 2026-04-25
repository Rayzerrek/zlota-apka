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
  language: string;
  setLanguage: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
};

export function ProfileAccountSection({
  email,
  language,
  setLanguage,
  timezone,
  setTimezone,
}: Props) {
  return (
    <section className="enter enter-d1 flex flex-col gap-6">
      <div className="pb-3 border-b border-rule flex items-baseline gap-3">
        <span className="mono text-xs text-amber tracking-[0.16em]">01 —</span>
        <h2 className="display text-[23px] tracking-[-0.01em] text-ink">
          Konto
        </h2>
      </div>

      <ProfileField
        label="Adres email"
        hint="Używany do logowania i powiadomień."
      >
        <input
          type="email"
          value={email}
          readOnly
          disabled
          className={cn(inputCls, "opacity-60 cursor-not-allowed")}
          autoComplete="email"
        />
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
