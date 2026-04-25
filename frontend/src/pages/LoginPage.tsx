import { Button, Input, Label } from "@cloudflare/kumo";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { LoginHeader } from "../components/ui/LoginHeader";
import { authClient, authErrorMessage } from "../lib/auth";

type Props = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function LoginPage({ theme, onToggleTheme }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authErrorMessage(authError, "login"));
      return;
    }
    navigate("/onboarding");
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    const { error: authError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/onboarding`,
    });
    if (authError) {
      setError("Nie udało się zalogować przez Google. Spróbuj ponownie.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-kumo-base">
      <LoginHeader
        theme={theme}
        onToggleTheme={onToggleTheme}
        actionTo="/sign-up"
        actionLabel="Zarejestruj się"
      />

      <main className="flex-1 flex items-center justify-center md:px-5 md:py-10">
        <div className="w-full md:max-w-[420px] enter">
          <div className="bg-transparent md:border md:border-rule md:rounded-[4px] p-8 md:p-10 ">
            <h1 className="text-[22px] mb-5 font-semibold text-ink tracking-[-0.01em]">
              Zaloguj się
            </h1>

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

              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="password" className="text-[14px]">
                    Hasło
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    tabIndex={-1}
                    className="text-[12px] text-amber tracking-[0.10em] bg-transparent hover:text-amber/80 transition-colors p-0 h-auto"
                  >
                    Zapomniałeś hasła?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-label="current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-rule text-ink placeholder:text-ink-faint pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    shape="square"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors p-0"
                  >
                    {showPassword ? (
                      <EyeSlashIcon size={15} />
                    ) : (
                      <EyeIcon size={15} />
                    )}
                  </Button>
                </div>
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
                {loading ? "Logowanie…" : "Zaloguj się"}
              </Button>
            </form>

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
                onClick={() => navigate("/sign-up")}
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
