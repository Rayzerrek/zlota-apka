import {
  Navigate,
  Outlet,
  RootRoute,
  Route,
  Router,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import App from "./App";
import { PageSkeleton } from "./components/layout/PageSkeleton";
import { Shell } from "./components/layout/Shell";
import { useReview } from "./contexts/ReviewContext";
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

const rootRoute = new RootRoute({
  component: App,
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Auth disabled temporarily
  return <>{children}</>;
}

function ShellLayout() {
  const { theme, toggleTheme } = useTheme();
  return (
    <ProtectedRoute>
      <Shell theme={theme} onToggleTheme={toggleTheme}>
        <Outlet />
      </Shell>
    </ProtectedRoute>
  );
}

const layoutRoute = new Route({
  getParentRoute: () => rootRoute,
  id: "_layout",
  component: ShellLayout,
});

function TodayPageWrapper() {
  const { setReviewSessionId } = useReview();
  return (
    <TodayPage
      onStart={() => setReviewSessionId("__all_today__")}
      onOpenSession={(id) => setReviewSessionId(id)}
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
  const { theme, setTheme } = useTheme();
  return <ProfilePage theme={theme} onThemeChange={setTheme} />;
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
  const LoginPage = lazy(() =>
    import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
  );
  return (
    <Suspense fallback={<PageSkeleton />}>
      <LoginPage theme={theme} onToggleTheme={toggleTheme} />
    </Suspense>
  );
}

function SignUpPageWrapper() {
  const { theme, toggleTheme } = useTheme();
  const SignUpPage = lazy(() =>
    import("./pages/SignUpPage").then((m) => ({ default: m.SignUpPage })),
  );
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SignUpPage theme={theme} onToggleTheme={toggleTheme} />
    </Suspense>
  );
}

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/site" />,
});

const siteRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "site",
  component: LandingPageWrapper,
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "login",
  component: LoginPageWrapper,
});

const signUpRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "sign-up",
  component: SignUpPageWrapper,
});

const todayRoute = new Route({
  getParentRoute: () => layoutRoute,
  path: "today",
  component: TodayPageWrapper,
});

const calendarRoute = new Route({
  getParentRoute: () => layoutRoute,
  path: "calendar",
  component: CalendarPageWrapper,
});

const browseRoute = new Route({
  getParentRoute: () => layoutRoute,
  path: "browse",
  component: BrowsePageWrapper,
});

const statsRoute = new Route({
  getParentRoute: () => layoutRoute,
  path: "stats",
  component: StatsPageWrapper,
});

const scannerRoute = new Route({
  getParentRoute: () => layoutRoute,
  path: "scanner",
  component: ScannerPageWrapper,
});

const profileRoute = new Route({
  getParentRoute: () => layoutRoute,
  path: "profile",
  component: ProfilePageWrapper,
});

const settingsRoute = new Route({
  getParentRoute: () => layoutRoute,
  path: "settings",
  component: SettingsPage,
});

const notesRoute = new Route({
  getParentRoute: () => layoutRoute,
  path: "notes/$examId",
  component: NotePage,
});

const catchAllRoute = new Route({
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

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
