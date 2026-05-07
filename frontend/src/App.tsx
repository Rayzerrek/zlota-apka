import { Outlet } from "@tanstack/react-router";

import "./App.css";
import { NotificationToast } from "./components/notifications/NotificationToast";
import { StudyTimer } from "./components/study/StudyTimer";
import { useStudySession } from "./contexts/StudySessionContext";

export default function App() {
  const { activeSession, endSession } = useStudySession();

  return (
    <>
      <NotificationToast />
      <Outlet />
      {activeSession && (
        <StudyTimer
          key={activeSession.sessionId}
          sessionId={activeSession.sessionId}
          onExit={endSession}
        />
      )}
    </>
  );
}
