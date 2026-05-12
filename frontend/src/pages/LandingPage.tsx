import { Button } from "@cloudflare/kumo/components/button";
import {
  ArrowRightIcon,
  BrainIcon,
  CalendarBlankIcon,
  CameraIcon,
  CardsIcon,
  ChartBarIcon,
  ClockIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef } from "react";

import { ThemeButton } from "../components/ui/ThemeButton";
import { useTheme } from "../hooks/useTheme";

function BentoCard({
  icon: Icon,
  title,
  description,
  className = "",
  children,
}: {
  icon: typeof SparkleIcon;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-lg border border-rule bg-paper-2 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber/20 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(242,184,48,0.06),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md border border-rule bg-paper text-amber">
          <Icon size={20} weight="duotone" />
        </div>
        <h3 className="display text-[20px] font-medium text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      </div>
      {children && <div className="relative z-10 mt-4">{children}</div>}
    </div>
  );
}

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleScroll = () => {
      const scrolled = window.scrollY > 16;
      header.classList.toggle("is-scrolled", scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-amber/[0.07] blur-[120px] animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-sub-mat/[0.05] blur-[100px] animate-float-delayed" />
      </div>

      <header
        ref={headerRef}
        className="landing-header z-20 mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 md:px-8"
      >
        <span className="display text-[24px] font-semibold leading-none tracking-tight">
          <span className="text-amber">Recurs</span>
        </span>

        <nav className="flex items-center gap-3">
          <ThemeButton theme={theme} onToggleTheme={toggleTheme} />
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/today" })}
            className="hidden rounded-sm bg-amber px-5 text-paper hover:bg-[#ffcc4a] sm:inline-flex"
          >
            Rozpocznij
          </Button>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pb-24 pt-12 text-center md:px-8 md:pb-32 md:pt-20">
          <div className="animate-enter enter-d1 mb-8 inline-flex items-center gap-2 rounded-full border border-amber/20 bg-amber/5 px-4 py-1.5 text-sm text-amber">
            <SparkleIcon size={14} weight="fill" />
            Nauka z głową
          </div>

          <h1 className="animate-enter enter-d2 display max-w-4xl text-[clamp(2.8rem,9vw,6.5rem)] font-light leading-[0.95] tracking-tight">
            Ucz się mądrzej,{" "}
            <span className="gradient-text font-medium">nie&nbsp;dłużej.</span>
          </h1>

          <p className="animate-enter enter-d3 mt-7 max-w-lg text-[17px] leading-relaxed text-ink-muted">
            Recurs łączy fiszki, terminarz sprawdzianów i notatki generowane
            przez AI w jednym miejscu. Śledź postępy, powtarzaj materiał i nigdy
            nie daj się zaskoczyć na klasówce.
          </p>

          <div className="animate-enter enter-d4 mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate({ to: "/today" })}
              className="rounded-sm bg-amber px-8 text-paper hover:bg-[#ffcc4a] hover:-translate-y-px hover:shadow-[0_0_30px_rgba(242,184,48,0.2)] active:translate-y-0 transition-all font-semibold"
            >
              Rozpocznij naukę
              <ArrowRightIcon size={18} weight="bold" className="ml-1.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-sm"
            >
              Zobacz jak działa
            </Button>
          </div>

          <div className="animate-enter enter-d4 relative mt-16 w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-lg border border-rule bg-paper-2 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-rule px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-rating-1/60" />
                <div className="h-3 w-3 rounded-full bg-rating-3/60" />
                <div className="h-3 w-3 rounded-full bg-rating-4/60" />
                <div className="ml-4 h-2 w-24 rounded-full bg-rule" />
              </div>
              <div className="grid grid-cols-[140px_1fr] gap-4 p-4 opacity-60">
                <div className="flex flex-col gap-3">
                  <div className="h-2 w-16 rounded-full bg-rule" />
                  <div className="h-2 w-20 rounded-full bg-rule" />
                  <div className="h-2 w-12 rounded-full bg-amber/30" />
                  <div className="h-2 w-20 rounded-full bg-rule" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-32 rounded-full bg-rule" />
                    <div className="h-3 w-12 rounded-full bg-amber/40" />
                  </div>
                  <div className="h-20 rounded-md border border-rule bg-paper" />
                  <div className="h-20 rounded-md border border-rule bg-paper" />
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-amber/[0.06] blur-2xl" />
          </div>
        </section>

        <section
          id="features"
          className="relative mx-auto max-w-6xl px-5 pb-24 md:px-8 md:pb-32"
        >
          <div className="mb-12 text-center">
            <h2 className="animate-enter display text-[clamp(1.8rem,5vw,3rem)] font-light leading-tight">
              Wszystko, czego potrzebujesz
            </h2>
            <p className="animate-enter enter-d1 mt-4 text-ink-muted">
              Jeden ekosystem do nauki — od fiszek po sprawdziany i notatki AI.
            </p>
          </div>

          <div className="animate-enter enter-d2 grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[200px]">
            <BentoCard
              className="md:col-span-2 md:row-span-2"
              icon={CalendarBlankIcon}
              title="Terminarz sprawdzianów"
              description="Dodaj sprawdziany i miej zawsze przed oczami ile dni zostało do każdego terminu. Recurs przypomni Ci, kiedy czas zacząć powtórki."
            >
              <div className="mt-auto flex items-end gap-2 pt-6">
                <span className="display text-[64px] font-light leading-none text-amber">
                  14
                </span>
                <span className="mono pb-2 text-[12px] uppercase tracking-wider text-ink-faint">
                  dni do klasówki
                </span>
              </div>
            </BentoCard>

            <BentoCard
              icon={CardsIcon}
              title="Fiszki"
              description="Twórz zestawy fiszek do każdego przedmiotu i powtarzaj materiał w swoim tempie."
            />

            <BentoCard
              icon={CameraIcon}
              title="Skaner notatek"
              description="Zrób zdjęcie notatek z zeszytu — Recurs zamieni je w cyfrowe fiszki gotowe do nauki."
            />

            <BentoCard
              className="md:row-span-2"
              icon={ChartBarIcon}
              title="Statystyki nauki"
              description="Śledź swoje postępy w każdym przedmiocie i sprawdzaj, które tematy wymagają jeszcze pracy."
            >
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-rule">
                    <div className="h-full w-[78%] rounded-full bg-amber" />
                  </div>
                  <span className="mono text-[13px] text-ink-muted">78%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-rule">
                    <div className="h-full w-[45%] rounded-full bg-sub-mat" />
                  </div>
                  <span className="mono text-[13px] text-ink-muted">45%</span>
                </div>
              </div>
            </BentoCard>

            <BentoCard
              className="md:col-span-2"
              icon={BrainIcon}
              title="Notatki generowane przez AI"
              description="Podaj temat i przedmiot — Recurs wygeneruje zwięzłą notatkę, którą możesz zapisać i przeglądać przed sprawdzianem."
            />

            <BentoCard
              icon={ClockIcon}
              title="Timer nauki"
              description="Ucz się w skupieniu dzięki wbudowanemu timerowi z sesjami i przerwami."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row md:px-8">
          <span className="display text-[18px] font-medium leading-none">
            <span className="text-amber">Recurs</span>
          </span>
          <span className="mono text-[12px] text-ink-faint">
            © {new Date().getFullYear()} Recurs. Ucz się mądrzej.
          </span>
        </div>
      </footer>
    </div>
  );
}
