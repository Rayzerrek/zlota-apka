import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { verifyLogin } from "../lib/api";
import { apiErrorMessage } from "../lib/error";

export function VerifyLoginPage() {
  const { token } = useSearch({ from: "/verify-login" });
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Brak tokenu logowania.");
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
  }, [token, navigate]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-kumo-base">
      <div className="text-center">
        {status === "loading" && (
          <>
            <p className="text-lg text-ink">Logowanie w toku…</p>
            <p className="text-sm text-ink-muted mt-2">
              To potrwa tylko chwilę.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-lg text-red-400">
              {errorMessage ?? "Nie udało się zalogować."}
            </p>
            <p className="text-sm text-ink-muted mt-2">
              Upewnij się, że używasz pełnego linku z wiadomości e-mail.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
