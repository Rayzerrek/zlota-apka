import { cn } from "../../utils/cn";

import type { Rating } from "../../types";

const RATING_LABELS: Record<Rating, { label: string; sub: string }> = {
  1: { label: "Nie wiem", sub: "od nowa" },
  2: { label: "Ledwo", sub: "trudne" },
  3: { label: "OK", sub: "z wysiłkiem" },
  4: { label: "Łatwo", sub: "pewnie" },
  5: { label: "Idealnie", sub: "natychmiast" },
};

const RATINGS: readonly Rating[] = [1, 2, 3, 4, 5];

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

type Props = {
  flipped: boolean;
  onRate: (r: Rating) => void;
};

export function ReviewRatings({ flipped, onRate }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2.5 px-6 pb-6 pt-5 max-w-[720px] w-full mx-auto">
      {RATINGS.map((r) => (
        <button
          key={r}
          type="button"
          disabled={!flipped}
          onClick={() => onRate(r)}
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
  );
}
