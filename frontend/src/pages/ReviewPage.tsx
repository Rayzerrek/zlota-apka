import { Button } from "@cloudflare/kumo/components/button";
import { XIcon } from "@phosphor-icons/react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ReviewCard } from "../components/review/ReviewCard";
import { ReviewDoneScreen } from "../components/review/ReviewDoneScreen";
import { ReviewHeader } from "../components/review/ReviewHeader";
import { ReviewRatings } from "../components/review/ReviewRatings";
import { useCardsByTopic, useCardsDue } from "../hooks/api/useCards";
import { useDashboard } from "../hooks/api/useDashboard";
import { useSession } from "../hooks/api/useSessions";
import { adaptApiCardToCard } from "../lib/adapters";

import type { Rating } from "../types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

const reviewShellCls =
  "fixed inset-0 z-50 flex flex-col bg-paper/95 backdrop-blur-[18px]";

export function ReviewPage() {
  const { sessionId } = useParams({ from: "/_layout/review/$sessionId" });
  const navigate = useNavigate();

  const isAllToday = sessionId === "today";
  const actualSessionId = isAllToday ? "" : sessionId;

  const { data: dueCards } = useCardsDue();
  const { data: dashboard } = useDashboard();
  const { data: session } = useSession(actualSessionId);
  const { data: topicCards } = useCardsByTopic(session?.topicId ?? "");

  const nextExam = dashboard?.upcomingExams[0] ?? null;
  const reviewLabel =
    isAllToday && nextExam ? `Powtórka przed: ${nextExam.name}` : null;

  const cards = useMemo(() => {
    if (isAllToday) {
      let list = (dueCards ?? []).filter(
        (c) => c.due.slice(0, 10) <= todayISO(),
      );
      if (nextExam?.subjectKey) {
        list = list.filter((c) => c.subjectKey === nextExam.subjectKey);
      }
      return list.map(adaptApiCardToCard);
    }
    if (!session?.topicId) return [];
    return (topicCards ?? []).map(adaptApiCardToCard);
  }, [isAllToday, dueCards, nextExam, session?.topicId, topicCards]);

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
        <div className="flex items-center px-6 py-4 border-b border-rule">
          <Button
            variant="ghost"
            icon={XIcon}
            onClick={() => navigate({ to: "/today" })}
            className="text-ink-muted hover:text-amber mono text-[14px] uppercase"
          >
            Zamknij
          </Button>
        </div>
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
        onExit={() => navigate({ to: "/today" })}
      />
    );
  }

  return (
    <div className={reviewShellCls}>
      <ReviewHeader
        current={idx + 1}
        total={cards.length}
        progress={progress}
        onExit={() => navigate({ to: "/today" })}
        subtitle={reviewLabel}
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
