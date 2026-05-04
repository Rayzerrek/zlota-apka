import { Outlet } from "@tanstack/react-router";
import { Suspense, lazy } from "react";

import "./App.css";
import { PageSkeleton } from "./components/layout/PageSkeleton";
import { NotificationToast } from "./components/notifications/NotificationToast";
import { StudyTimer } from "./components/study/StudyTimer";
import { useReview } from "./contexts/ReviewContext";
import { useStudySession } from "./contexts/StudySessionContext";

const ReviewPage = lazy(() =>
  import("./pages/ReviewPage").then((m) => ({ default: m.ReviewPage })),
);

export default function App() {
  const { reviewSessionId } = useReview();
  const { activeSession, endSession } = useStudySession();

  return (
    <>
      <NotificationToast />
      <Outlet />
      {reviewSessionId && (
        <Suspense fallback={<PageSkeleton />}>
          <ReviewPage />
        </Suspense>
      )}
      {activeSession && (
        <StudyTimer sessionId={activeSession.sessionId} onExit={endSession} />
      )}
    </>
  );
}
