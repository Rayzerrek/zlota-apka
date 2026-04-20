import { Button } from "@cloudflare/kumo";
import {
  CheckIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

import { PageHead } from "../../components/PageHead";
import { STUDENT_CLASS, STUDENT_INITIAL, STUDENT_NAME } from "../../data/mock";
import { cn } from "../../utils/utils";

type Props = {
  theme: "dark" | "light";
  onThemeChange: (t: "dark" | "light") => void;
};

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
  "w-full px-3.5 py-3 bg-paper-2 border border-rule rounded-[2px] text-ink text-[15px] outline-none transition-colors duration-200 hover:border-rule-strong focus:border-amber focus:bg-paper-3";

const ghostBtnCls =
  "inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-rule rounded-[2px] text-ink-muted text-[13px] font-medium cursor-pointer transition-all duration-200 hover:border-rule-strong hover:text-ink";

const dangerBtnCls =
  "inline-flex items-center gap-2 px-4 py-2.5 bg-transparent border border-rating-1 rounded-[2px] text-rating-1 text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-rating-1/8";

const dangerSolidBtnCls =
  "inline-flex items-center gap-2 px-4 py-2.5 bg-rating-1 border border-rating-1 rounded-[2px] text-paper text-[13px] font-medium cursor-pointer transition-all duration-200 hover:bg-[#c94a4a]";

export function ProfilePage({ theme, onThemeChange }: Props) {
  const [email, setEmail] = useState(
    () => localStorage.getItem("profile.email") ?? "kacper@example.com",
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("profile.language") ?? "pl",
  );
  const [timezone, setTimezone] = useState(
    () => localStorage.getItem("profile.timezone") ?? "Europe/Warsaw",
  );
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    localStorage.setItem("profile.email", email);
    localStorage.setItem("profile.language", language);
    localStorage.setItem("profile.timezone", timezone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const handleDelete = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      <PageHead
        eyebrow="Konto"
        title={
          <>
            Twój <em>profil</em>
          </>
        }
      />

      <div className="flex flex-col gap-10 max-w-[600px]">
        <section className="enter flex items-center gap-5">
          <div className="w-[72px] h-[72px] rounded-sm bg-amber text-paper grid place-items-center display italic font-bold text-[32px] shrink-0">
            {STUDENT_INITIAL}
          </div>
          <div className="flex flex-col gap-1">
            <div className="display italic text-[28px] leading-none text-ink">
              {STUDENT_NAME}
            </div>
            <div className="mono text-[11px] text-ink-muted tracking-[0.14em] uppercase">
              {STUDENT_CLASS} · {email}
            </div>
          </div>
        </section>

        <section className="enter enter-d1 flex flex-col gap-6">
          <div className="pb-3 border-b border-rule flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.16em]">
              01 —
            </span>
            <h2 className="display text-[20px] tracking-[-0.01em] text-ink">
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
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
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

        <section className="enter enter-d2 flex flex-col gap-6">
          <div className="pb-3 border-b border-rule flex items-baseline gap-3">
            <span className="mono text-xs text-amber tracking-[0.16em]">
              02 —
            </span>
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

        <section className="enter enter-d3 flex items-center gap-4 pt-2">
          <Button
            size="lg"
            variant="ghost"
            onClick={handleSave}
            className="bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] font-semibold px-7 py-3 tracking-[0.02em]"
          >
            Zapisz zmiany
          </Button>
          {saved && (
            <span className="mono text-[11px] tracking-[0.14em] uppercase text-rating-4 flex items-center gap-1.5">
              <CheckIcon size={12} weight="bold" />
              Zapisano
            </span>
          )}
        </section>

        <section className="enter enter-d4 mt-6 pt-8 border-t border-dashed border-rule">
          <div className="flex items-center gap-2 mb-2">
            <WarningIcon size={14} weight="fill" className="text-rating-1" />
            <span className="mono text-[11px] text-rating-1 tracking-[0.16em] uppercase">
              Strefa niebezpieczna
            </span>
          </div>
          <p className="text-[14px] text-ink-muted leading-[1.55] max-w-[48ch] mb-5">
            Usunięcie profilu jest nieodwracalne. Wszystkie karty, sesje i
            postępy zostaną trwale utracone.
          </p>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={dangerBtnCls}
            >
              <TrashIcon size={14} />
              Usuń profil
            </button>
          ) : (
            <div className="flex flex-col gap-3 p-4 border border-rating-1 rounded-sm bg-rating-1/5">
              <div className="mono text-[11px] tracking-[0.14em] uppercase text-rating-1">
                Czy na pewno?
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDelete}
                  className={dangerSolidBtnCls}
                >
                  <TrashIcon size={14} />
                  Tak, usuń trwale
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className={ghostBtnCls}
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function ProfileField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="mono text-[11px] text-ink-muted tracking-[0.14em] uppercase">
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-[12px] text-ink-faint leading-[1.5]">{hint}</span>
      )}
    </label>
  );
}

function ThemeOption({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-4 py-3.5 border rounded-[2px] text-[14px] font-medium cursor-pointer transition-all duration-200 text-left",
        active
          ? "border-amber text-ink bg-[linear-gradient(180deg,var(--color-amber-wash),transparent_80%),var(--color-paper-2)]"
          : "border-rule bg-paper-2 text-ink-muted hover:border-rule-strong hover:text-ink",
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
