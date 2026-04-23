import { Button } from "@cloudflare/kumo";
import { ArrowRightIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router";

type Props = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function LandingPage({ theme, onToggleTheme }: Props) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-kumo-base text-ink overflow-x-hidden p-4 md:p-6">
      <div className="rounded-2xl border-1 overflow-hidden">
        <header className="px-5 md:px-10 h-[60px] flex items-center justify-between gap-4">
          <span className="display italic font-semibold text-[26px] text-amber leading-none shrink-0">
            Nazwa
          </span>

          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              icon={
                theme === "dark" ? (
                  <SunIcon size={16} />
                ) : (
                  <MoonIcon size={16} />
                )
              }
              aria-label="Zmień motyw"
              onClick={onToggleTheme}
            />
            <Button variant="outline" onClick={() => navigate("/login")}>
              Zaloguj się
            </Button>
            <Button variant="outline" onClick={() => navigate("/sign-up")}>
              Zarejestruj się
            </Button>
          </nav>
        </header>

        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_5%_-10%,rgba(242,184,48,0.10),transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_100%,rgba(110,168,255,0.06),transparent_60%)]"
          />

          <div className="relative flex flex-col items-center text-center max-w-6xl mx-auto px-5 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
            <h1 className="display italic font-semibold text-ink leading-none mb-7 text-[clamp(3.2rem,8vw,6.5rem)]">
              Powtórki, <span className="text-amber">które&nbsp;zostają.</span>
            </h1>

            <p className="text-[17px] text-ink-muted leading-relaxed max-w-[500px] mb-10">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Laboriosam saepe minus commodi? Commodi voluptatum libero qui
              reprehenderit necessitatibus voluptas! Ipsa nulla quod ab amet
              vitae nisi voluptatum quas.
            </p>

            <Button
              variant="primary"
              onClick={() => navigate("/sign-up")}
              className="bg-amber border-amber text-paper hover:bg-amber/90 hover:border-amber/90 px-6"
            >
              Rozpocznij
              <ArrowRightIcon size={15} className="ml-1" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
