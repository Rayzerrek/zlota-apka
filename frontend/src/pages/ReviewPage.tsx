import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ReviewCard } from "../components/review/ReviewCard";
import { ReviewDoneScreen } from "../components/review/ReviewDoneScreen";
import { ReviewHeader } from "../components/review/ReviewHeader";
import { ReviewRatings } from "../components/review/ReviewRatings";
import { useReview } from "../contexts/ReviewContext";
import { useCardsByTopic, useCardsDue } from "../hooks/api/useCards";
import { useSession } from "../hooks/api/useSessions";
import { adaptApiCardToCard } from "../lib/adapters";

import type { Rating } from "../types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const reviewShellCls =
  "fixed inset-0 z-50 flex flex-col bg-paper/95 backdrop-blur-[18px]";

export function ReviewPage() {
  const { reviewSessionId, setReviewSessionId } = useReview();

  const isAllToday = reviewSessionId === "__all_today__";
  const sessionId = isAllToday ? "" : (reviewSessionId ?? "");

  const { data: dueCards } = useCardsDue();
  const { data: session } = useSession(sessionId);
  const { data: topicCards } = useCardsByTopic(session?.topicId ?? "");

  const cards = useMemo(() => {
    if (!reviewSessionId) return [];
    if (isAllToday) {
      return (dueCards ?? [])
        .filter((c) => c.due.slice(0, 10) <= todayISO())
        .map(adaptApiCardToCard);
    }
    if (!session?.topicId) return [];
    return (topicCards ?? []).map(adaptApiCardToCard);
  }, [reviewSessionId, isAllToday, dueCards, session?.topicId, topicCards]);

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

  if (!current) {
    return (
      <div className={reviewShellCls}>
        <div className="flex-1 grid place-items-center">
          <p className="text-ink-faint display italic text-[25px]">
            Brak kart do powtórki.
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <ReviewDoneScreen
        ratings={ratings}
        total={cards.length}
        onExit={() => setReviewSessionId(null)}
      />
    );
  }

  return (
    <div className={reviewShellCls}>
      <ReviewHeader
        current={idx + 1}
        total={cards.length}
        progress={progress}
        onExit={() => setReviewSessionId(null)}
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
