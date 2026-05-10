import { Button } from "@cloudflare/kumo/components/button";
import { CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { PageHead } from "../components/layout/PageHead";
import { ProfileAccountSection } from "../components/profile/ProfileAccountSection";
import { ProfileDangerZone } from "../components/profile/ProfileDangerZone";
import { ProfileDataExport } from "../components/profile/ProfileDataExport";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ErrorState } from "../components/ui/ErrorState";
import { useSavedFeedback } from "../hooks/useSavedFeedback";
import { apiDelete } from "../lib/api";
import { type ApiError } from "../lib/error";
import { OkResponseSchema } from "../lib/schemas";
// import { authClient } from "../lib/auth";

export function ProfilePage() {
  // Auth disabled temporarily
  // const { data: session } = authClient.useSession();
  // const user = session?.user;

  const name = "Użytkownik";
  const email = "";
  const initial = (name[0] || email[0] || "?").toUpperCase();

  const [language, setLanguage] = useState(
    () => localStorage.getItem("profile.language") ?? "pl",
  );
  const [timezone, setTimezone] = useState(
    () => localStorage.getItem("profile.timezone") ?? "Europe/Warsaw",
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<ApiError | null>(null);
  const { saved, markSaved } = useSavedFeedback(2200);

  const handleSave = () => {
    localStorage.setItem("profile.language", language);
    localStorage.setItem("profile.timezone", timezone);
    markSaved();
  };

  const handleDelete = async () => {
    setDeleteError(null);
    const res = await apiDelete("/api/users/me", OkResponseSchema);
    if (!res.ok) {
      setDeleteError(res.error);
      return;
    }
    // Auth disabled temporarily
    // await authClient.signOut();
    window.location.href = "/today";
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
        <ProfileHeader name={name} initial={initial} email={email} />

        <ProfileAccountSection
          email={email}
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
            className="bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] font-semibold px-7 py-3"
          >
            Zapisz zmiany
          </Button>
          {saved && (
            <span className="mono text-[14px] uppercase text-rating-4 flex items-center gap-1.5">
              <CheckIcon size={12} weight="bold" />
              Zapisano
            </span>
          )}
        </section>

        <ProfileDataExport />

        <ProfileDangerZone
          confirmDelete={confirmDelete}
          setConfirmDelete={setConfirmDelete}
          onDelete={handleDelete}
        />

        {deleteError && <ErrorState error={deleteError} />}
      </div>
    </>
  );
}
