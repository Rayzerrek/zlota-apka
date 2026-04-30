import { cn } from "../../utils/cn";

import type { Rating } from "../../types";

const RATING_LABELS: Record<Rating, { label: string; sub: string }> = {
  1: { label: "Znowu", sub: "od nowa" },
  2: { label: "Trudne", sub: "krótki interwał" },
  3: { label: "Dobre", sub: "standardowo" },
  4: { label: "Łatwe", sub: "długi interwał" },
};

const RATINGS: readonly Rating[] = [1, 2, 3, 4];

const RATING_TEXT: Record<Rating, string> = {
  1: "text-rating-1",
  2: "text-rating-2",
  3: "text-rating-4",
  4: "text-rating-5",
};

const RATING_ACTIVE_BORDER: Record<Rating, string> = {
  1: "hover:border-rating-1 hover:bg-rating-1/15 active:bg-rating-1/25",
  2: "hover:border-rating-2 hover:bg-rating-2/15 active:bg-rating-2/25",
  3: "hover:border-rating-4 hover:bg-rating-4/15 active:bg-rating-4/25",
  4: "hover:border-rating-5 hover:bg-rating-5/15 active:bg-rating-5/25",
};

type Props = {
  flipped: boolean;
  onRate: (r: Rating) => void;
};

export function ReviewRatings({ flipped, onRate }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3 px-6 pb-6 pt-5 max-w-[720px] w-full mx-auto">
      {RATINGS.map((r) => (
        <button
          key={r}
          type="button"
          disabled={!flipped}
          onClick={() => onRate(r)}
          className={cn(
            "flex flex-col items-center gap-1 px-3 py-3 border rounded-sm transition-all duration-200",
            "border-rule bg-paper-2",
            RATING_ACTIVE_BORDER[r],
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-rule disabled:hover:bg-paper-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50",
            "max-[520px]:px-2 max-[520px]:py-2.5",
          )}
        >
          <span
            className={cn(
              "display font-normal text-[28px] leading-none",
              RATING_TEXT[r],
            )}
          >
            {r}
          </span>
          <span className="mono text-[12px] uppercase text-ink-muted max-[520px]:text-[11px]">
            {RATING_LABELS[r].label}
          </span>
          <span className="mono text-[11px] text-ink-faint mt-0.5 max-[520px]:hidden">
            {RATING_LABELS[r].sub}
          </span>
        </button>
      ))}
    </div>
  );
}
