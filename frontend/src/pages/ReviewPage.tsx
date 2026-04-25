import { useCallback, useEffect, useRef, useState } from "react";

import { ReviewCard } from "../components/review/ReviewCard";
import { ReviewDoneScreen } from "../components/review/ReviewDoneScreen";
import { ReviewHeader } from "../components/review/ReviewHeader";
import { ReviewRatings } from "../components/review/ReviewRatings";

import type { Card, Rating } from "../types";

type Props = {
  cards: Card[];
  onExit: () => void;
};

const reviewShellCls = "fixed inset-0 light:bg-kumo-base z-50 flex flex-col";

export function ReviewPage({ cards, onExit }: Props) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = cards[idx];
  const progress = done ? 1 : idx / cards.length;

  const handleRate = useCallback(
    (r: Rating) => {
      setRatings((prev) => [...prev, r]);
      if (idx + 1 >= cards.length) {
        setDone(true);
      } else {
        setFlipped(false);
        timeoutRef.current = setTimeout(() => setIdx((i) => i + 1), 100);
      }
    },
    [idx, cards.length],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!current) return null;

  if (done) {
    return (
      <ReviewDoneScreen
        ratings={ratings}
        total={cards.length}
        onExit={onExit}
      />
    );
  }

  return (
    <div className={reviewShellCls}>
      <ReviewHeader
        current={idx + 1}
        total={cards.length}
        progress={progress}
        onExit={onExit}
      />

      <div className="flex-1 grid place-items-center p-6 [perspective:1800px]">
        <ReviewCard
          card={current}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
        />
      </div>

      <ReviewRatings flipped={flipped} onRate={handleRate} />
    </div>
  );
}
