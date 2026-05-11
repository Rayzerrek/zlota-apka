import { Button } from "@cloudflare/kumo/components/button";
import { Input } from "@cloudflare/kumo/components/input";
import { Label } from "@cloudflare/kumo/components/label";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { LoginHeader } from "../components/ui/LoginHeader";
import { useTheme } from "../hooks/useTheme";
import { sendMagicLink } from "../lib/api";
import { apiResultMessage } from "../lib/api";

export function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("auth.email") ?? "";
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    localStorage.setItem("auth.email", email);
    const res = await sendMagicLink(email);
    setLoading(false);
    if (!res.ok) {
      setError(apiResultMessage(res) ?? "Nie udało się wysłać linku.");
      return;
    }
    setSent(true);
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    setLoading(false);
    navigate({ to: "/today" });
  }

  return (
    <div className="min-h-dvh flex flex-col bg-kumo-base overflow-y-auto">
      <LoginHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        actionTo="/sign-up"
        actionLabel="Zarejestruj się"
      />

      <main className="flex-1 flex items-center justify-center md:px-5 md:py-10">
        <div className="w-full md:max-w-[420px] enter">
          <div className="bg-transparent md:border md:border-rule md:rounded-[4px] p-8 md:p-10">
            <h1 className="text-[22px] mb-5 font-semibold text-ink">
              Zaloguj się
            </h1>

            {sent ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-ink-muted">
                  Link logowania został wysłany na <strong>{email}</strong>.
                  Sprawdź skrzynkę e-mail i kliknij w link, aby się zalogować.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSent(false)}
                  className="text-amber bg-transparent hover:text-black transition-colors"
                >
                  Wyślij ponownie
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-[14px]">
                    Adres e-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="jan@kowalski.pl"
                    autoComplete="email"
                    aria-label="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-rule text-ink placeholder:text-ink-faint"
                    required
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-red-400 -mt-1">{error}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full mt-1 justify-center bg-amber border-amber text-paper hover:bg-amber/90 hover:border-amber/90 disabled:opacity-60"
                >
                  {loading ? "Wysyłanie…" : "Wyślij link logowania"}
                </Button>
              </form>
            )}

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-rule" />
              <span className="text-[12px] text-ink-faint">lub</span>
              <div className="flex-1 h-px bg-rule" />
            </div>

            <Button
              variant="outline"
              disabled={loading}
              onClick={handleGoogle}
              className="w-full justify-center gap-2 disabled:opacity-60"
            >
              <GoogleIcon />
              Kontynuuj z Google
            </Button>

            <div className="flex items-center justify-center gap-1 text-[14px] text-ink-muted mt-5">
              <span>Nie masz konta?</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate({ to: "/sign-up" })}
                className="text-amber bg-transparent hover:text-black transition-colors"
              >
                Zarejestruj się
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.68 3.68 0 0 1-1.6 2.42v2h2.58c1.51-1.39 2.4-3.44 2.4-5.88Z"
        fill="#4285F4"
      />
      <path
        d="M8 16c2.16 0 3.97-.72 5.3-1.94l-2.59-2a4.8 4.8 0 0 1-7.15-2.52H.9v2.07A8 8 0 0 0 8 16Z"
        fill="#34A853"
      />
      <path
        d="M3.56 9.54A4.82 4.82 0 0 1 3.3 8c0-.54.09-1.06.25-1.54V4.39H.9A8 8 0 0 0 0 8c0 1.29.31 2.51.9 3.61l2.66-2.07Z"
        fill="#FBBC05"
      />
      <path
        d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.38-2.38A8 8 0 0 0 .9 4.39L3.56 6.46A4.77 4.77 0 0 1 8 3.18Z"
        fill="#EA4335"
      />
    </svg>
  );
}
