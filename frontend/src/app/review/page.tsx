import { Button } from "@cloudflare/kumo";
import { ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { useState, useCallback } from "react";

import { SUBJECTS } from "../../utils/subjects";
import { cn } from "../../utils/utils";

import type { Card, Rating } from "../../types/types";

type Props = {
  cards: Card[];
  onExit: () => void;
};

const RATING_LABELS: Record<Rating, { label: string; sub: string }> = {
  1: { label: "Nie wiem", sub: "od nowa" },
  2: { label: "Ledwo", sub: "trudne" },
  3: { label: "OK", sub: "z wysiłkiem" },
  4: { label: "Łatwo", sub: "pewnie" },
  5: { label: "Idealnie", sub: "natychmiast" },
};

const RATING_HOVER: Record<Rating, string> = {
  1: "hover:border-rating-1 hover:bg-rating-1/6",
  2: "hover:border-rating-2 hover:bg-rating-2/6",
  3: "hover:border-rating-3 hover:bg-rating-3/6",
  4: "hover:border-rating-4 hover:bg-rating-4/6",
  5: "hover:border-rating-5 hover:bg-rating-5/6",
};

const RATING_NUM_COLOR: Record<Rating, string> = {
  1: "text-rating-1",
  2: "text-rating-2",
  3: "text-rating-3",
  4: "text-rating-4",
  5: "text-rating-5",
};

const reviewShellCls =
  "fixed inset-0 bg-paper z-50 flex flex-col animate-[fadeIn_0.3s_var(--ease-out)]";

const faceBaseCls =
  "absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] flex flex-col p-[40px_48px] border border-rule-strong rounded-[4px] overflow-hidden bg-[linear-gradient(180deg,var(--color-paper-2),var(--color-paper))]";

const faceInsetRuleCls =
  "after:content-[''] after:absolute after:inset-2 after:border after:border-dashed after:border-rule after:pointer-events-none after:rounded-[2px]";

export function ReviewPage({ cards, onExit }: Props) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [done, setDone] = useState(false);

  const current = cards[idx];
  const progress = done ? 1 : idx / cards.length;

  const handleRate = useCallback(
    (r: Rating) => {
      const next = [...ratings, r];
      setRatings(next);
      if (idx + 1 >= cards.length) {
        setDone(true);
      } else {
        setFlipped(false);
        setTimeout(() => setIdx(idx + 1), 100);
      }
    },
    [idx, cards.length, ratings],
  );

  if (!current) return null;

  if (done) {
    const correct = ratings.filter((r) => r >= 3).length;
    const wrong = ratings.length - correct;
    return (
      <div className={reviewShellCls}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-rule relative">
          <Button
            variant="ghost"
            icon={XIcon}
            onClick={onExit}
            className="text-ink-muted hover:text-amber mono text-[11px] tracking-[0.16em] uppercase"
          >
            Zamknij
          </Button>
          <span className="mono text-[11px] tracking-[0.16em] uppercase text-ink-muted">
            <span className="text-ink font-semibold">Ukończono</span>
          </span>
          <span className="w-20" />
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-amber transition-[width] duration-[0.4s] [transition-timing-function:var(--ease-out)]"
            style={{ width: "100%" }}
          />
        </div>
        <div className="flex-1 grid place-items-center p-6 [perspective:1800px]">
          <div className="text-center flex flex-col items-center gap-5 px-10 py-10 animate-[fadeIn_0.5s_var(--ease-out)]">
            <div className="display italic text-[120px] text-amber leading-[0.9] font-light">
              ✓
            </div>
            <div className="display font-normal text-[36px] tracking-[-0.02em] [&_em]:italic [&_em]:text-amber">
              <em>Koniec</em> sesji.
            </div>
            <p className="text-ink-muted max-w-[40ch]">
              Dobra robota. Kolejne powtórki zaplanowaliśmy na podstawie ocen —
              karty „idealne" wrócą za dłużej, trudne wrócą jutro.
            </p>
            <div className="flex gap-9 mt-4 py-5 border-t border-b border-rule">
              <div className="flex flex-col gap-1">
                <div className="display text-[34px] leading-none text-rating-4">
                  {correct}
                </div>
                <div className="mono text-[10px] tracking-[0.16em] uppercase text-ink-faint">
                  Poprawnych
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="display text-[34px] leading-none text-rating-1">
                  {wrong}
                </div>
                <div className="mono text-[10px] tracking-[0.16em] uppercase text-ink-faint">
                  Do poprawy
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="display text-[34px] leading-none text-ink">
                  {cards.length}
                </div>
                <div className="mono text-[10px] tracking-[0.16em] uppercase text-ink-faint">
                  Razem
                </div>
              </div>
            </div>
            <Button
              size="lg"
              variant="ghost"
              onClick={onExit}
              className="bg-amber text-paper rounded-sm hover:bg-[#ffcc4a] font-semibold px-7 py-4 tracking-[0.02em]"
            >
              Wróć do planu
              <ArrowRightIcon size={18} weight="bold" className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subj = SUBJECTS[current.subject];

  return (
    <div className={reviewShellCls}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-rule relative">
        <Button
          variant="ghost"
          icon={XIcon}
          onClick={onExit}
          className="text-ink-muted hover:text-amber mono text-[11px] tracking-[0.16em] uppercase"
        >
          Zamknij
        </Button>
        <span className="mono text-[11px] tracking-[0.16em] uppercase text-ink-muted">
          <span className="text-ink font-semibold">{idx + 1}</span> /{" "}
          {cards.length}
        </span>
        <span className="w-20" />
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-amber transition-[width] duration-[0.4s] [transition-timing-function:var(--ease-out)]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex-1 grid place-items-center p-6 [perspective:1800px]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFlipped((f) => !f)}
          className={cn(
            "w-full max-w-[720px] aspect-[3/2] relative cursor-pointer [transform-style:preserve-3d] transition-transform duration-700 [transition-timing-function:var(--ease-spring)] max-[768px]:aspect-[2/3] max-[768px]:max-w-[480px]",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <div className={cn(faceBaseCls, faceInsetRuleCls)}>
            <div className="flex items-center gap-3 mono text-[11px] tracking-[0.16em] uppercase text-ink-muted">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: subj.color }}
              />
              {subj.name} · {current.topic}
              <span className="mono text-[10px] tracking-[0.24em] text-ink-faint ml-auto">
                awers
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center text-center p-5">
              <div className="display font-light text-[clamp(28px,4.5vw,44px)] leading-[1.2] tracking-[-0.02em] text-ink max-w-[28ch]">
                {current.question}
              </div>
            </div>
            <div className="mono text-[11px] tracking-[0.16em] uppercase text-ink-faint text-center">
              Kliknij lub spacja, żeby odwrócić
            </div>
          </div>

          <div
            className={cn(
              faceBaseCls,
              faceInsetRuleCls,
              "[transform:rotateY(180deg)] !bg-[linear-gradient(180deg,rgba(242,184,48,0.05),transparent_50%),var(--color-paper-2)]",
            )}
          >
            <div className="flex items-center gap-3 mono text-[11px] tracking-[0.16em] uppercase text-ink-muted">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: subj.color }}
              />
              {subj.name} · {current.topic}
              <span className="mono text-[10px] tracking-[0.24em] text-ink-faint ml-auto">
                rewers
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center text-center p-5">
              <div className="display italic font-medium text-[clamp(32px,5vw,52px)] leading-[1.15] tracking-[-0.02em] text-amber max-w-[28ch]">
                {current.answer}
              </div>
            </div>
            <div className="mono text-[11px] tracking-[0.16em] uppercase text-ink-faint text-center">
              Oceń, jak dobrze znałeś odpowiedź
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2.5 px-6 pb-6 pt-5 max-w-[720px] w-full mx-auto">
        {([1, 2, 3, 4, 5] as Rating[]).map((r) => (
          <button
            key={r}
            type="button"
            disabled={!flipped}
            onClick={() => handleRate(r)}
            className={cn(
              "flex flex-col items-center gap-1.5 px-2 pt-4 pb-3.5 bg-transparent border border-rule rounded-[2px] text-ink cursor-pointer transition-all duration-200 hover:-translate-y-0.5 max-[520px]:px-1 max-[520px]:pt-3 max-[520px]:pb-2.5",
              RATING_HOVER[r],
              !flipped && "opacity-[0.35] cursor-not-allowed",
            )}
          >
            <span
              className={cn(
                "display font-normal text-[22px] leading-none",
                RATING_NUM_COLOR[r],
              )}
            >
              {r}
            </span>
            <span className="mono text-[9px] tracking-[0.16em] uppercase text-ink-muted max-[520px]:text-[8px]">
              {RATING_LABELS[r].label}
            </span>
            <span className="mono text-[9px] text-ink-faint mt-0.5 max-[520px]:hidden">
              Klawisz {r}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
