import { Button } from "@cloudflare/kumo";
import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { PageHead } from "../components/layout/PageHead";
import { ProfileAccountSection } from "../components/profile/ProfileAccountSection";
import { ProfileAppearanceSection } from "../components/profile/ProfileAppearanceSection";
import { ProfileDangerZone } from "../components/profile/ProfileDangerZone";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { STUDENT_CLASS, STUDENT_INITIAL, STUDENT_NAME } from "../data/mock";
import { useSavedFeedback } from "../hooks/useSavedFeedback";

type Props = {
  theme: "dark" | "light";
  onThemeChange: (t: "dark" | "light") => void;
};

export function ProfilePage({ theme, onThemeChange }: Props) {
  const [email, setEmail] = useState("kacper@example.com");
  const [language, setLanguage] = useState(
    () => localStorage.getItem("profile.language") ?? "pl",
  );
  const [timezone, setTimezone] = useState(
    () => localStorage.getItem("profile.timezone") ?? "Europe/Warsaw",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { saved, markSaved } = useSavedFeedback(2200);

  const handleSave = () => {
    localStorage.setItem("profile.language", language);
    localStorage.setItem("profile.timezone", timezone);
    markSaved();
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
        <ProfileHeader
          name={STUDENT_NAME}
          initial={STUDENT_INITIAL}
          classLabel={STUDENT_CLASS}
          email={email}
        />

        <ProfileAccountSection
          email={email}
          setEmail={setEmail}
          language={language}
          setLanguage={setLanguage}
          timezone={timezone}
          setTimezone={setTimezone}
        />

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
            <span className="mono text-[14px] tracking-[0.14em] uppercase text-rating-4 flex items-center gap-1.5">
              <CheckIcon size={12} weight="bold" />
              Zapisano
            </span>
          )}
        </section>

        <ProfileAppearanceSection theme={theme} onThemeChange={onThemeChange} />

        <ProfileDangerZone
          confirmDelete={confirmDelete}
          setConfirmDelete={setConfirmDelete}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
