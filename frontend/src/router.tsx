import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import {
  type ComponentType,
  type FunctionComponent,
  Suspense,
  lazy,
} from "react";
import { z } from "zod";

import App from "./App";
import {
  ErrorBoundary,
  RouteErrorFallback,
} from "./components/layout/ErrorBoundary";
import { PageSkeleton } from "./components/layout/PageSkeleton";
import { Shell } from "./components/layout/Shell";
import { useTheme } from "./hooks/useTheme";

function withSuspense<P extends object>(
  Component: ComponentType<P>,
): FunctionComponent<P> {
  return function Suspended(props: P) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

const TodayPage = withSuspense(
  lazy(() =>
    import("./pages/TodayPage").then((m) => ({ default: m.TodayPage })),
  ),
);
const CalendarPage = withSuspense(
  lazy(() =>
    import("./pages/CalendarPage").then((m) => ({ default: m.CalendarPage })),
  ),
);
const StatsPage = withSuspense(
  lazy(() =>
    import("./pages/StatsPage").then((m) => ({ default: m.StatsPage })),
  ),
);
const LandingPage = withSuspense(
  lazy(() =>
    import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })),
  ),
);
const BrowsePage = withSuspense(
  lazy(() =>
    import("./pages/BrowsePage").then((m) => ({ default: m.BrowsePage })),
  ),
);
const ScannerPage = withSuspense(
  lazy(() =>
    import("./pages/ScannerPage").then((m) => ({ default: m.ScannerPage })),
  ),
);
const ProfilePage = withSuspense(
  lazy(() =>
    import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
  ),
);
const SettingsPage = withSuspense(
  lazy(() =>
    import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
  ),
);
const NotePage = withSuspense(
  lazy(() => import("./pages/NotePage").then((m) => ({ default: m.NotePage }))),
);
const NoteGeneratorPage = withSuspense(
  lazy(() =>
    import("./pages/NoteGeneratorPage").then((m) => ({
      default: m.NoteGeneratorPage,
    })),
  ),
);
const GeneratedNotePage = withSuspense(
  lazy(() =>
    import("./pages/GeneratedNotePage").then((m) => ({
      default: m.GeneratedNotePage,
    })),
  ),
);
const ReviewPage = withSuspense(
  lazy(() =>
    import("./pages/ReviewPage").then((m) => ({ default: m.ReviewPage })),
  ),
);
const VerifyEmailPage = withSuspense(
  lazy(() =>
    import("./pages/VerifyEmailPage").then((m) => ({
      default: m.VerifyEmailPage,
    })),
  ),
);
const VerifyLoginPage = withSuspense(
  lazy(() =>
    import("./pages/VerifyLoginPage").then((m) => ({
      default: m.VerifyLoginPage,
    })),
  ),
);

const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  ),
  errorComponent: RouteErrorFallback,
});

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
  errorComponent: RouteErrorFallback,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/site" />,
});

const siteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "site",
  component: LandingPage,
});

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "verify-email",
  validateSearch: z.object({
    token: z.string().optional(),
    status: z.string().optional(),
  }),
  component: VerifyEmailPage,
});

const verifyLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "verify-login",
  validateSearch: z.object({ token: z.string() }),
  component: VerifyLoginPage,
});

const todayRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "today",
  component: TodayPage,
});

const calendarRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "calendar",
  component: CalendarPage,
});

const browseRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "browse",
  component: BrowsePage,
});

const statsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "stats",
  component: StatsPage,
});

const scannerRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "scanner",
  component: ScannerPage,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "profile",
  component: ProfilePage,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "settings",
  component: SettingsPage,
});

const notesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "notes/$examId",
  component: NotePage,
});

const noteNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "note/new",
  component: NoteGeneratorPage,
});

const noteIdRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "note/$id",
  component: GeneratedNotePage,
});

const reviewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "review/$sessionId",
  component: ReviewPage,
});

const catchAllRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "*",
  component: () => <Navigate to="/today" />,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  siteRoute,
  verifyEmailRoute,
  verifyLoginRoute,
  layoutRoute.addChildren([
    todayRoute,
    calendarRoute,
    browseRoute,
    statsRoute,
    scannerRoute,
    profileRoute,
    settingsRoute,
    notesRoute,
    noteNewRoute,
    noteIdRoute,
    reviewRoute,
    catchAllRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
