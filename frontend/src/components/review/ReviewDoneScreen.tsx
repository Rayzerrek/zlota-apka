import { Button } from "@cloudflare/kumo";
import { ArrowRightIcon, XIcon } from "@phosphor-icons/react";

import type { Rating } from "../../types";

type Props = {
  ratings: Rating[];
  total: number;
  onExit: () => void;
};

export function ReviewDoneScreen({ ratings, total, onExit }: Props) {
  const correct = ratings.filter((r) => r >= 3).length;
  const wrong = ratings.length - correct;

  return (
    <div className="fixed inset-0 bg-kumo-base light:bg-kumo-base z-50 flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-rule relative">
        <Button
          variant="ghost"
          icon={XIcon}
          onClick={onExit}
          className="text-ink-muted hover:text-amber mono text-[14px] uppercase"
        >
          Zamknij
        </Button>
        <span className="mono text-[14px] uppercase text-ink-muted">
          <span className="text-ink font-semibold">Ukończono</span>
        </span>
        <span className="w-20" />
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-amber transition-[width] duration-[0.4s] [transition-timing-function:var(--ease-out)]" />
      </div>
      <div className="flex-1 grid place-items-center p-6 [perspective:1800px]">
        <div className="text-center flex flex-col items-center gap-5 px-10 py-10">
          <div className="display italic text-[123px] text-amber leading-[0.9] font-light">
            ✓
          </div>
          <div className="display font-normal text-[39px] [&_em]:italic [&_em]:text-amber">
            <em>Koniec</em> sesji.
          </div>
          <p className="text-ink-muted max-w-[40ch]">
            Dobra robota. Kolejne powtórki zaplanowaliśmy na podstawie ocen —
            karty „idealne" wrócą za dłużej, trudne wrócą jutro.
          </p>
          <div className="flex gap-9 mt-4 py-5 border-t border-b border-rule">
            <div className="flex flex-col gap-1">
              <div className="display text-[37px] leading-none text-rating-4">
                {correct}
              </div>
              <div className="mono text-[13px] uppercase text-ink-faint">
                Poprawnych
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="display text-[37px] leading-none text-rating-1">
                {wrong}
              </div>
              <div className="mono text-[13px] uppercase text-ink-faint">
                Do poprawy
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="display text-[37px] leading-none text-ink">
                {total}
              </div>
              <div className="mono text-[13px] uppercase text-ink-faint">
                Razem
              </div>
            </div>
          </div>
          <Button
            size="lg"
            variant="ghost"
            onClick={onExit}
            className="bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] font-semibold px-7 py-4"
          >
            Wróć do planu
            <ArrowRightIcon size={18} weight="bold" className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
