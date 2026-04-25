import { Button, Input } from "@cloudflare/kumo";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { authClient } from "../lib/auth";

type Props = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function LoginPage({ theme, onToggleTheme }: Props) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await authClient.signIn.magicLink({
      email,
      callbackURL: `${window.location.origin}/today`,
    });
    setLoading(false);
    if (authError) {
      setError("Nie udało się wysłać linku. Spróbuj ponownie.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-dvh flex flex-col bg-kumo-base">
      <header className="flex items-center justify-between px-5 py-4 md:px-10">
        <span className="display italic font-semibold text-[26px] text-amber leading-none">
          Nazwa
        </span>
        <Button
          variant="ghost"
          icon={
            theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />
          }
          aria-label="Zmień motyw"
          onClick={onToggleTheme}
        />
      </header>

      <main className="flex-1 flex items-center justify-center md:px-5 md:py-10">
        <div className="w-full md:max-w-[420px] enter">
          <div className="bg-transparent md:border md:border-rule md:rounded-[4px] p-8 md:p-10">
            {sent ? (
              <div className="flex flex-col gap-3">
                <h1 className="text-[22px] font-semibold text-ink tracking-[-0.01em]">
                  Sprawdź skrzynkę
                </h1>
                <p className="text-[14px] text-ink-muted">
                  Wysłaliśmy link do logowania na adres{" "}
                  <span className="text-ink font-medium">{email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-[13px] text-amber bg-transparent border-0 cursor-pointer p-0 text-left hover:text-amber/80 transition-colors"
                >
                  Zmień adres e-mail
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-[22px] mb-5 font-semibold text-ink tracking-[-0.01em]">
                  Zaloguj się
                </h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-[14px]">
                      Adres e-mail
                    </label>
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
                    {loading ? "Wysyłanie…" : "Wyślij link"}
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-1 text-[14px] text-ink-muted mt-5">
                  <span>Nie masz konta?</span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/sign-up")}
                    className="text-amber bg-transparent hover:text-black transition-colors"
                  >
                    Zarejestruj się
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
