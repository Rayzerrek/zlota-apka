import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router";

import "./App.css";
import { Shell } from "./components/layout/Shell";
import { CARDS, SESSIONS, TODAY } from "./data/mock";
import { useTheme } from "./hooks/useTheme";
import { BrowsePage } from "./pages/BrowsePage";
import { CalendarPage } from "./pages/CalendarPage";
import { NotePage } from "./pages/NotePage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StatsPage } from "./pages/StatsPage";
import { TodayPage } from "./pages/TodayPage";

function App() {
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const { theme, setTheme, toggleTheme } = useTheme();

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
          <Route path="/notes/:examId" element={<NotePage />} />
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
