import { Suspense, lazy, useMemo, useState } from "react";
// import { useTranslation } from "react-i18next";

import "./App.css";
import { Navigate, Route, Routes } from "react-router";

import { PageSkeleton } from "./components/layout/PageSkeleton";
import { Shell } from "./components/layout/Shell";
import { CARDS, SESSIONS, TODAY } from "./data/mock";
import { useTheme } from "./hooks/useTheme";
import { authClient } from "./lib/auth";
import { BrowsePage } from "./pages/BrowsePage";
import { LoginPage } from "./pages/LoginPage";
import { NotePage } from "./pages/NotePage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReviewPage } from "./pages/ReviewPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignUpPage } from "./pages/SignUpPage";
import { TodayPage } from "./pages/TodayPage";

const CalendarPage = lazy(() =>
  import("./pages/CalendarPage").then((m) => ({ default: m.CalendarPage })),
);
const StatsPage = lazy(() =>
  import("./pages/StatsPage").then((m) => ({ default: m.StatsPage })),
);
const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })),
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <PageSkeleton />;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function App() {
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);
  const { theme, setTheme, toggleTheme } = useTheme();

  // const t = useTranslation();

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
      <Routes>
        <Route
          path="/site"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <LandingPage theme={theme} onToggleTheme={toggleTheme} />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={<LoginPage theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/sign-up"
          element={<SignUpPage theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
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
                  <Route
                    path="/calendar"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <CalendarPage />
                      </Suspense>
                    }
                  />
                  <Route path="/browse" element={<BrowsePage />} />
                  <Route
                    path="/stats"
                    element={
                      <Suspense fallback={<PageSkeleton />}>
                        <StatsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProfilePage theme={theme} onThemeChange={setTheme} />
                    }
                  />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/notes/:examId" element={<NotePage />} />
                  <Route path="*" element={<Navigate to="/today" replace />} />
                </Routes>
              </Shell>
            </ProtectedRoute>
          }
        />
      </Routes>

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
