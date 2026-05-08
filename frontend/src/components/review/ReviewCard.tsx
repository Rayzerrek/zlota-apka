import { cn } from "../../utils/cn";
import { SUBJECTS, SUBJECT_BG } from "../../utils/subjects";

import type { Card } from "../../types";

const faceBaseCls =
  "absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] flex flex-col p-[40px_48px] border border-rule-strong rounded-[4px] overflow-hidden bg-[linear-gradient(180deg,var(--color-paper-2),var(--color-paper))]";

const faceInsetRuleCls =
  "after:content-[''] after:absolute after:inset-2 after:border after:border-dashed after:border-rule after:pointer-events-none after:rounded-[2px]";

type Props = {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
};

export function ReviewCard({ card, flipped, onFlip }: Props) {
  const subj = SUBJECTS[card.subject];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onFlip}
      className={cn(
        "w-full max-w-[720px] aspect-[3/2] relative cursor-pointer [transform-style:preserve-3d] transition-transform duration-700 [transition-timing-function:var(--ease-spring)] max-[768px]:aspect-[2/3] max-[768px]:max-w-[480px]",
        flipped && "[transform:rotateY(180deg)]",
      )}
    >
      <div className={cn(faceBaseCls, faceInsetRuleCls)}>
        <div className="flex items-center gap-3 mono text-[14px] uppercase text-ink-muted">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              SUBJECT_BG[card.subject],
            )}
          />
          {subj.name} · {card.topic}
          <span className="mono text-[13px] text-ink-faint ml-auto">awers</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-5">
          <div className="display font-light text-[clamp(28px,4.5vw,44px)] leading-[1.2] text-ink max-w-[28ch]">
            {card.question}
          </div>
        </div>
        <div className="mono text-[14px] uppercase text-ink-faint text-center">
          Kliknij lub spacja, aby sprawdzić odpowiedź
        </div>
      </div>

      <div
        className={cn(
          faceBaseCls,
          faceInsetRuleCls,
          "[transform:rotateY(180deg)] !bg-[linear-gradient(180deg,rgba(242,184,48,0.05),transparent_50%),var(--color-paper-2)]",
        )}
      >
        <div className="flex items-center gap-3 mono text-[14px] uppercase text-ink-muted">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              SUBJECT_BG[card.subject],
            )}
          />
          {subj.name} · {card.topic}
          <span className="mono text-[13px] text-ink-faint ml-auto">
            rewers
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-5">
          <div className="display italic font-medium text-[clamp(32px,5vw,52px)] leading-[1.15] text-amber max-w-[28ch]">
            {card.answer}
          </div>
        </div>
        <div className="mono text-[14px] uppercase text-ink-faint text-center">
          Oceń, jak dobrze znałeś odpowiedź
        </div>
      </div>
    </div>
  );
}
