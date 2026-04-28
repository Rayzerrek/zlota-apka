import { Outlet } from "@tanstack/react-router";
import { useMemo } from "react";

import "./App.css";
import { useReview } from "./contexts/ReviewContext";
import { CARDS, SESSIONS, TODAY } from "./data/mock";
import { ReviewPage } from "./pages/ReviewPage";

export default function App() {
  const { reviewSessionId, setReviewSessionId } = useReview();

  const reviewCards = useMemo(() => {
    if (!reviewSessionId) return [];
    if (reviewSessionId === "__all_today__") {
      return CARDS.filter((c) => c.dueISO === TODAY);
    }
    const session = SESSIONS.find((s) => s.id === reviewSessionId);
    if (!session) return [];
    return session.cardIds
      .map((id) => CARDS.find((c) => c.id === id))
      .filter((c): c is (typeof CARDS)[number] => Boolean(c));
  }, [reviewSessionId]);

  return (
    <>
      <Outlet />
      {reviewSessionId && reviewCards.length > 0 && (
        <ReviewPage
          cards={reviewCards}
          onExit={() => setReviewSessionId(null)}
        />
      )}
    </>
  );
}
