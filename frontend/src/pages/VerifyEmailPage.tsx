import { useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { verifyEmail } from "../lib/api";
import { apiErrorMessage } from "../lib/error";

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const { token, status } = useSearch({ from: "/verify-email" });
  const [pageStatus, setPageStatus] = useState<"loading" | "success" | "error">(
    status === "success" ? "success" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "success") return;
    if (!token) {
      setPageStatus("error");
      setErrorMessage(t("verify.noVerifyToken"));
      return;
    }

    let cancelled = false;
    void (async () => {
      const res = await verifyEmail(token);
      if (cancelled) return;
      if (res.ok) {
        setPageStatus("success");
      } else {
        setPageStatus("error");
        setErrorMessage(apiErrorMessage(res.error));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, status, t]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-kumo-base">
      <div className="text-center max-w-md px-6">
        {pageStatus === "loading" && (
          <>
            <p className="text-lg text-ink">{t("verify.verifyingEmail")}</p>
            <p className="text-sm text-ink-muted mt-2">
              {t("verify.justAMoment")}
            </p>
          </>
        )}
        {pageStatus === "success" && (
          <>
            <p className="text-lg text-ink font-semibold">
              {t("verify.emailVerified")}
            </p>
            <p className="text-sm text-ink-muted mt-2">
              {t("verify.emailVerifiedDescription")}
            </p>
            <a
              href="/today"
              className="inline-block mt-6 px-6 py-3 bg-amber text-paper rounded-sm font-medium hover:bg-[#ffcc4a] transition-colors"
            >
              {t("verify.goToApp")}
            </a>
          </>
        )}
        {pageStatus === "error" && (
          <>
            <p className="text-lg text-red-400">
              {errorMessage ?? t("verify.verifyFailed")}
            </p>
            <p className="text-sm text-ink-muted mt-2">
              {t("verify.checkLink")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
