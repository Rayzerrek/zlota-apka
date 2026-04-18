import { useMemo, useState } from "react";
import "./App.css";
import { CARDS, SESSIONS, TODAY } from "./data/mock";
import { Shell } from "./components/Shell";
import { TodayPage } from "./app/today/page";
import { CalendarPage } from "./app/calendar/page";
import { StatsPage } from "./app/stats/page";
import { BrowsePage } from "./app/browse/page";
import { ReviewPage } from "./app/review/page";
import { useRouter } from "./app/router";

function App() {
  const { path } = useRouter();
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);

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
      <Shell path={path}>
        {path === "/today" && (
          <TodayPage
            onStart={() => setReviewSessionId("__all_today__")}
            onOpenSession={(id) => setReviewSessionId(id)}
          />
        )}
        {path === "/calendar" && <CalendarPage />}
        {path === "/browse" && <BrowsePage />}
        {path === "/stats" && <StatsPage />}
      </Shell>

      {reviewSessionId && reviewCards.length > 0 && (
        <ReviewPage cards={reviewCards} onExit={() => setReviewSessionId(null)} />
      )}
    </>
  );
}

export default App;
