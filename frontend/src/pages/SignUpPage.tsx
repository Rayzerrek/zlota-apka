import { Button, Input } from "@cloudflare/kumo";
import {
  EyeIcon,
  EyeSlashIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router";

type Props = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function SignUpPage({ theme, onToggleTheme }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col bg-kumo-base">
      <header className="flex items-center justify-between px-5 py-4 md:px-10">
        <span className="display italic font-semibold text-[26px] text-amber leading-none">
          Nazwa
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            icon={
              theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />
            }
            aria-label="Zmień motyw"
            onClick={onToggleTheme}
          />
          <Button variant="outline" onClick={() => navigate("/login")}>
            Zaloguj się
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center md:px-5 md:py-10">
        <div className="w-full md:max-w-[420px] enter">
          <div className="bg-transparent md:border md:border-rule md:rounded-[4px] p-8 md:p-10">
            <h1 className="text-[22px] mb-5 font-semibold text-ink">
              Utwórz konto
            </h1>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-[14px]">
                  Adres e-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jan@kowalski.pl"
                  autoComplete="email"
                  className="w-full border-rule text-ink placeholder:text-ink-faint"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-[14px]">
                  Hasło
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full border-rule text-ink placeholder:text-ink-faint pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors bg-transparent border-0 cursor-pointer p-0 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon size={15} />
                    ) : (
                      <EyeIcon size={15} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirm-password" className="text-[14px]">
                  Powtórz hasło
                </label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full border-rule text-ink placeholder:text-ink-faint pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? "Ukryj hasło" : "Pokaż hasło"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors bg-transparent border-0 cursor-pointer p-0 flex items-center"
                  >
                    {showConfirm ? (
                      <EyeSlashIcon size={15} />
                    ) : (
                      <EyeIcon size={15} />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-1 justify-center bg-amber border-amber text-paper hover:bg-amber/90 hover:border-amber/90"
              >
                Zarejestruj się
              </Button>
            </form>

            <div className="flex items-center justify-center gap-1 text-[14px] text-ink-muted mt-5">
              <span>Masz już konto?</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/login")}
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
