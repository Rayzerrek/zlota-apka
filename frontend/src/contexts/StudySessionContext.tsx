import { createContext, useCallback, useContext, useState } from "react";

import { type ActiveSession } from "../types";

const StudySessionContext = createContext<{
  activeSession: ActiveSession;
  startSession: (id: string) => void;
  endSession: () => void;
} | null>(null);

export function StudySessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSession, setActiveSession] = useState<ActiveSession>(null);

  const startSession = useCallback((id: string) => {
    setActiveSession({ sessionId: id, startedAt: Date.now() });
  }, []);

  const endSession = useCallback(() => {
    setActiveSession(null);
  }, []);

  return (
    <StudySessionContext.Provider
      value={{ activeSession, startSession, endSession }}
    >
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession() {
  const ctx = useContext(StudySessionContext);
  if (!ctx) {
    throw new Error("useStudySession must be used within StudySessionProvider");
  }
  return ctx;
}
