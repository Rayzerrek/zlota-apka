import { Button } from "@cloudflare/kumo";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { DoneStep } from "../components/onboarding/DoneStep";
import { StepPanel } from "../components/onboarding/StepPanel";
import { SubjectsStep } from "../components/onboarding/SubjectsStep";
import { WelcomeStep } from "../components/onboarding/WelcomeStep";
import { cn } from "../utils/cn";

import type { SubjectKey } from "../types";

const STEPS = 3;

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Set<SubjectKey>>(new Set());
  const [dir, setDir] = useState<1 | -1>(1);

  const toggleSubject = (key: SubjectKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const goNext = () => {
    if (step < STEPS) {
      setDir(1);
      setStep((s) => s + 1);
    } else {
      localStorage.setItem("onboarding_done", "1");
      navigate("/today", { replace: true });
    }
  };

  const goBack = () => {
    if (step > 1) {
      setDir(-1);
      setStep((s) => s - 1);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 0%, rgba(242,184,48,0.06), transparent 60%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(110,168,255,0.035), transparent 70%), var(--color-paper)",
        }}
      />

      <div className="relative w-full max-w-[520px] flex flex-col gap-8">
        <div className="flex items-center justify-center gap-2">
          <div
            className={cn(
              "h-1 w-8 rounded-full transition-all duration-500",
              step === 1 ? "bg-amber" : step > 1 ? "bg-amber/40" : "bg-rule",
            )}
          />
          <div
            className={cn(
              "h-1 w-8 rounded-full transition-all duration-500",
              step === 2 ? "bg-amber" : step > 2 ? "bg-amber/40" : "bg-rule",
            )}
          />
          <div
            className={cn(
              "h-1 w-8 rounded-full transition-all duration-500",
              step === 3 ? "bg-amber" : "bg-rule",
            )}
          />
        </div>

        <div className="relative min-h-[380px]">
          <StepPanel key={step} direction={dir} step={step}>
            {step === 1 && <WelcomeStep />}
            {step === 2 && (
              <SubjectsStep selected={selected} onToggle={toggleSubject} />
            )}
            {step === 3 && <DoneStep selectedCount={selected.size} />}
          </StepPanel>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={step === 1}
            className={cn(
              "text-ink-muted transition-opacity duration-200",
              step === 1 ? "opacity-0 pointer-events-none" : "opacity-100",
            )}
          >
            <ArrowLeftIcon size={16} className="mr-1.5" />
            Wstecz
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={goNext}
            disabled={step === 2 && selected.size === 0}
            className="bg-amber border-amber text-paper hover:bg-amber/90 hover:border-amber/90 font-semibold disabled:opacity-50"
          >
            {step === STEPS ? (
              <>
                Przejdź do aplikacji
                <CheckCircleIcon size={16} className="ml-1.5" />
              </>
            ) : (
              <>
                Dalej
                <ArrowRightIcon size={16} className="ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
