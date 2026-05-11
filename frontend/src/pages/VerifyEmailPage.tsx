import { useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function VerifyEmailPage() {
  const { token } = useSearch({ from: "/verify-email" });
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    window.location.href = `/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  }, [token]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-kumo-base">
      <div className="text-center">
        {status === "loading" && (
          <>
            <p className="text-lg text-ink">Weryfikowanie adresu e-mail…</p>
            <p className="text-sm text-ink-muted mt-2">
              To potrwa tylko chwilę.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-lg text-red-400">Brak tokenu weryfikacyjnego.</p>
            <p className="text-sm text-ink-muted mt-2">
              Upewnij się, że używasz pełnego linku z wiadomości e-mail.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
