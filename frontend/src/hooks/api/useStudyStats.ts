import { useMemo } from "react";

import { useAllCards } from "./useCards";
import { useAllSessions } from "./useSessions";

export function useStudyStats() {
  const { data: cards, isLoading: cardsLoading } = useAllCards();
  const { data: sessions, isLoading: sessionsLoading } = useAllSessions();

  const stats = useMemo(() => {
    if (!cards || !sessions) {
      return {
        retentionPct: 0,
        streakDays: 0,
        weekMinutes: 0,
        totalCards: 0,
        mature: 0,
        young: 0,
        news: 0,
        subjectRetention: [] as { subject: string; pct: number }[],
        heatmap: [] as number[],
      };
    }

    const totalCards = cards.length;
    const mature = cards.filter(
      (c) => c.state === 2 && c.scheduledDays >= 14,
    ).length;
    const young = cards.filter(
      (c) => c.state === 1 || (c.state === 2 && c.scheduledDays < 14),
    ).length;
    const news = cards.filter((c) => c.state === 0).length;

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekMinutes = sessions
      .filter((s) => {
        const d = new Date(s.scheduledDate);
        return d >= weekStart && d <= weekEnd;
      })
      .reduce((sum, s) => sum + s.plannedMinutes, 0);

    const reviewCards = cards.filter((c) => c.state === 2);
    const retentionPct =
      reviewCards.length > 0
        ? Math.round(
            (reviewCards.filter((c) => c.reps > 3).length /
              reviewCards.length) *
              100,
          )
        : 0;

    return {
      retentionPct,
      streakDays: 0,
      weekMinutes,
      totalCards,
      mature,
      young,
      news,
      subjectRetention: [] as { subject: string; pct: number }[],
      heatmap: [] as number[],
    };
  }, [cards, sessions]);

  return {
    ...stats,
    isLoading: cardsLoading || sessionsLoading,
  };
}
