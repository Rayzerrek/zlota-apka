import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import App from "./App";
import { PageSkeleton } from "./components/layout/PageSkeleton";
import { Shell } from "./components/layout/Shell";
import { useReview } from "./contexts/ReviewContext";
import { useStudySession } from "./contexts/StudySessionContext";
import { useTheme } from "./hooks/useTheme";
import { BrowsePage } from "./pages/BrowsePage";
import { NotePage } from "./pages/NotePage";
import { ProfilePage } from "./pages/ProfilePage";
import { ScannerPage } from "./pages/ScannerPage";
import { SettingsPage } from "./pages/SettingsPage";
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
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const SignUpPage = lazy(() =>
  import("./pages/SignUpPage").then((m) => ({ default: m.SignUpPage })),
);

const rootRoute = createRootRoute({
  component: App,
});

// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   Auth disabled temporarily
//   return <>{children}</>;
// }

function ShellLayout() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Shell theme={theme} onToggleTheme={toggleTheme}>
      <Outlet />
    </Shell>
  );
}

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_layout",
  component: ShellLayout,
});

function TodayPageWrapper() {
  const { setReviewSessionId } = useReview();
  const { startSession } = useStudySession();
  return (
    <TodayPage
      onStart={() => setReviewSessionId("__all_today__")}
      onStartSession={startSession}
    />
  );
}

function LandingPageWrapper() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LandingPage theme={theme} onToggleTheme={toggleTheme} />
    </Suspense>
  );
}

function ProfilePageWrapper() {
  return <ProfilePage />;
}

function CalendarPageWrapper() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CalendarPage />
    </Suspense>
  );
}

function StatsPageWrapper() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StatsPage />
    </Suspense>
  );
}

function BrowsePageWrapper() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BrowsePage />
    </Suspense>
  );
}

function ScannerPageWrapper() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ScannerPage />
    </Suspense>
  );
}

function LoginPageWrapper() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LoginPage theme={theme} onToggleTheme={toggleTheme} />
    </Suspense>
  );
}

function SignUpPageWrapper() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SignUpPage theme={theme} onToggleTheme={toggleTheme} />
    </Suspense>
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/site" />,
});

const siteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "site",
  component: LandingPageWrapper,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  component: LoginPageWrapper,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "sign-up",
  component: SignUpPageWrapper,
});

const todayRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "today",
  component: TodayPageWrapper,
});

const calendarRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "calendar",
  component: CalendarPageWrapper,
});

const browseRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "browse",
  component: BrowsePageWrapper,
});

const statsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "stats",
  component: StatsPageWrapper,
});

const scannerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "scanner",
  component: ScannerPageWrapper,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "profile",
  component: ProfilePageWrapper,
});

function SettingsPageWrapper() {
  const { theme, setTheme } = useTheme();
  return <SettingsPage theme={theme} onThemeChange={setTheme} />;
}

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "settings",
  component: SettingsPageWrapper,
});

const notesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "notes/$examId",
  component: NotePage,
});

const catchAllRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "*",
  component: () => <Navigate to="/today" />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  siteRoute,
  loginRoute,
  signUpRoute,
  layoutRoute.addChildren([
    todayRoute,
    calendarRoute,
    browseRoute,
    statsRoute,
    scannerRoute,
    profileRoute,
    settingsRoute,
    notesRoute,
    catchAllRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
