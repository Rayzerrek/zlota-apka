import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router";

import "./App.css";
import { BrowsePage } from "./app/browse/page";
import { CalendarPage } from "./app/calendar/page";
import { ProfilePage } from "./app/profile/page";
import { ReviewPage } from "./app/review/page";
import { SettingsPage } from "./app/settings/page";
import { StatsPage } from "./app/stats/page";
import { TodayPage } from "./app/today/page";
import { Shell } from "./components/Shell";
import { CARDS, SESSIONS, TODAY } from "./data/mock";

function App() {
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const raw = localStorage.getItem("theme");
    return raw === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.mode = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

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
      <Shell theme={theme} onToggleTheme={toggleTheme}>
        <Routes>
          <Route
            path="/today"
            element={
              <TodayPage
                onStart={() => setReviewSessionId("__all_today__")}
                onOpenSession={(id) => setReviewSessionId(id)}
              />
            }
          />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route
            path="/profile"
            element={<ProfilePage theme={theme} onThemeChange={setTheme} />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </Shell>

      {reviewSessionId && reviewCards.length > 0 && (
        <ReviewPage
          cards={reviewCards}
          onExit={() => setReviewSessionId(null)}
        />
      )}
    </>
  );
}

export default App;
