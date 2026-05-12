import { useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { verifyEmail } from "../lib/api";
import { apiErrorMessage } from "../lib/error";

export function VerifyEmailPage() {
  const { token, status } = useSearch({ from: "/verify-email" });
  const [pageStatus, setPageStatus] = useState<"loading" | "success" | "error">(
    status === "success" ? "success" : "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "success") return;
    if (!token) {
      setPageStatus("error");
      setErrorMessage("Brak tokenu weryfikacyjnego.");
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
  }, [token, status]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-kumo-base">
      <div className="text-center max-w-md px-6">
        {pageStatus === "loading" && (
          <>
            <p className="text-lg text-ink">Weryfikowanie adresu e-mail…</p>
            <p className="text-sm text-ink-muted mt-2">
              To potrwa tylko chwilę.
            </p>
          </>
        )}
        {pageStatus === "success" && (
          <>
            <p className="text-lg text-ink font-semibold">
              Adres e-mail został zweryfikowany
            </p>
            <p className="text-sm text-ink-muted mt-2">
              Twoje konto jest teraz aktywne. Możesz korzystać z aplikacji na
              dowolnym urządzeniu logując się tym adresem e-mail.
            </p>
            <a
              href="/today"
              className="inline-block mt-6 px-6 py-3 bg-amber text-paper rounded-sm font-medium hover:bg-[#ffcc4a] transition-colors"
            >
              Przejdź do aplikacji
            </a>
          </>
        )}
        {pageStatus === "error" && (
          <>
            <p className="text-lg text-red-400">
              {errorMessage ?? "Nie udało się zweryfikować adresu e-mail."}
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
