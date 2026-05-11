import { Button } from "@cloudflare/kumo/components/button";
import { Input } from "@cloudflare/kumo/components/input";
import { Label } from "@cloudflare/kumo/components/label";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { LoginHeader } from "../components/ui/LoginHeader";
import { useTheme } from "../hooks/useTheme";
// import { authClient, authErrorMessage } from "../lib/auth";

export function SignUpPage() {
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Hasło musi mieć co najmniej 8 znaków.");
      return;
    }
    if (password !== confirm) {
      setError("Hasła nie są identyczne.");
      return;
    }
    setError("");
    setLoading(true);
    // Auth disabled temporarily
    // const { error: authError } = await authClient.signUp.email({
    //   name,
    //   email,
    //   password,
    // });
    setLoading(false);
    // if (authError) {
    //   setError(authErrorMessage(authError, "signup"));
    //   return;
    // }
    navigate({ to: "/today" });
  }

  return (
    <div className="min-h-dvh flex flex-col bg-kumo-base overflow-y-auto">
      <LoginHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        actionTo="/login"
        actionLabel="Zaloguj się"
      />

      <main className="flex-1 flex items-center justify-center md:px-5 md:py-10">
        <div className="w-full md:max-w-105 enter">
          <div className="bg-transparent md:border md:border-rule md:rounded-sm p-8 md:p-10">
            <h1 className="text-[22px] mb-5 font-semibold text-ink">
              Utwórz konto
            </h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-[14px]">
                  Nazwa użytkownika
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jan"
                  aria-label="username"
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-rule text-ink placeholder:text-ink-faint"
                  required
                />
              </div>

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
                <Label htmlFor="password" className="text-[14px]">
                  Hasło
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-label="password"
                    autoComplete="new-password"
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

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password" className="text-[14px]">
                  Powtórz hasło
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    aria-label="Confirm Password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full border-rule text-ink placeholder:text-ink-faint pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    shape="square"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Ukryj hasło" : "Pokaż hasło"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors p-0"
                  >
                    {showConfirm ? (
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
                {loading ? "Tworzenie konta…" : "Zarejestruj się"}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-1 text-[14px] text-ink-muted mt-5">
              <span>Masz już konto?</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate({ to: "/login" })}
                className="text-amber bg-transparent hover:text-black transition-colors"
              >
                Zaloguj się
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
