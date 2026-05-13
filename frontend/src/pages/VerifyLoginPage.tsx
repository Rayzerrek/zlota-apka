import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { verifyLogin } from "../lib/api";
import { apiErrorMessage } from "../lib/error";

export function VerifyLoginPage() {
  const { t } = useTranslation();
  const { token } = useSearch({ from: "/verify-login" });
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage(t("verify.noToken"));
      return;
    }

    let cancelled = false;
    void (async () => {
      const res = await verifyLogin(token);
      if (cancelled) return;
      if (res.ok) {
        await navigate({ to: "/today" });
      } else {
        setStatus("error");
        setErrorMessage(apiErrorMessage(res.error));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, navigate, t]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-kumo-base">
      <div className="text-center">
        {status === "loading" && (
          <>
            <p className="text-lg text-ink">{t("verify.loggingIn")}</p>
            <p className="text-sm text-ink-muted mt-2">
              {t("verify.justAMoment")}
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-lg text-red-400">
              {errorMessage ?? t("verify.loginFailed")}
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
