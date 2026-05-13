import { Button } from "@cloudflare/kumo/components/button";
import { CheckIcon, WarningIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageHead } from "../components/layout/PageHead";
import { ProfileAccountSection } from "../components/profile/ProfileAccountSection";
import { ProfileDangerZone } from "../components/profile/ProfileDangerZone";
import { ProfileDataExport } from "../components/profile/ProfileDataExport";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ErrorState } from "../components/ui/ErrorState";
import { useUser } from "../hooks/api/useUser";
import { useSavedFeedback } from "../hooks/useSavedFeedback";
import { apiDelete } from "../lib/api";
import { apiResultMessage, linkEmail, sendMagicLink } from "../lib/api";
import { type ApiError } from "../lib/error";
import { OkResponseSchema } from "../lib/schemas";

export function ProfilePage() {
  const { t } = useTranslation();
  const { data: userData } = useUser();

  const isGuest = userData?.isGuest ?? true;
  const savedEmail = userData?.email ?? "";
  const name = userData?.name ?? t("nav.profile");

  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("auth.email") ?? savedEmail;
  });

  useEffect(() => {
    if (savedEmail && !savedEmail.startsWith("guest-")) {
      setEmail(savedEmail);
    }
  }, [savedEmail]);

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

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

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
    window.location.href = "/today";
  };

  const handleConfirmEmail = async () => {
    setConfirmError(null);
    setConfirmLoading(true);
    localStorage.setItem("auth.email", email);
    const res = await linkEmail(email);
    setConfirmLoading(false);
    if (!res.ok) {
      setConfirmError(apiResultMessage(res) ?? "Nie udało się wysłać linku.");
      return;
    }
    alert("Link weryfikacyjny został wysłany na podany adres e-mail.");
  };

  const handleSendMagicLink = async () => {
    setSendError(null);
    setSendLoading(true);
    localStorage.setItem("auth.email", email);
    const res = await sendMagicLink(email);
    setSendLoading(false);
    if (!res.ok) {
      setSendError(apiResultMessage(res) ?? "Nie udało się wysłać linku.");
      return;
    }
    alert("Link logowania został wysłany na podany adres e-mail.");
  };

  return (
    <>
      <PageHead
        eyebrow={t("profile.eyebrow")}
        title={
          <>
            {t("profile.title").split("<em>")[0]}
            <em>{t("profile.title").match(/<em>(.*?)<\/em>/)?.[1]}</em>
          </>
        }
      />

      <div className="flex flex-col gap-10 max-w-[600px]">
        {isGuest && (
          <div className="enter enter-d1 p-4 bg-paper-3 border border-rule-strong rounded-md flex gap-4">
            <WarningIcon
              size={24}
              weight="fill"
              className="text-amber shrink-0"
            />
            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold text-ink m-0">
                {t("profile.guestWarning")}
              </h3>
              <p className="text-sm text-ink-muted m-0">
                {t("profile.guestDescription")}
              </p>
            </div>
          </div>
        )}
        <ProfileHeader name={name} initial={initial} email={email} />
        <ProfileAccountSection
          email={email}
          setEmail={setEmail}
          isGuest={isGuest}
          onConfirmEmail={handleConfirmEmail}
          onSendMagicLink={handleSendMagicLink}
          confirmLoading={confirmLoading}
          sendLoading={sendLoading}
          confirmError={confirmError}
          sendError={sendError}
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
            {t("profile.saveChanges")}
          </Button>
          {saved && (
            <span className="mono text-[14px] uppercase text-rating-4 flex items-center gap-1.5">
              <CheckIcon size={12} weight="bold" />
              {t("common.saved")}
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
