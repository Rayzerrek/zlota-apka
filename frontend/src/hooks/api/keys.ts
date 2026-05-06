export const queryKeys = {
  dashboard: ["dashboard"] as const,
  notifications: ["notifications"] as const,
  exams: ["exams"] as const,
  exam: (id: string) => ["exams", id] as const,
  sessions: (params?: { date?: string; from?: string; to?: string }) =>
    ["sessions", params ?? {}] as const,
  allSessions: ["sessions", "all"] as const,
  session: (id: string) => ["sessions", id] as const,
  cardsDue: ["cards", "due"] as const,
  allCards: ["cards", "all"] as const,
  cardsByTopic: (topicId: string) => ["topics", topicId, "cards"] as const,
  subjects: ["subjects"] as const,
  topicsByExam: (examId: string) => ["exams", examId, "topics"] as const,
  generatedNote: (id: string) => ["generated-notes", id] as const,
  user: ["user"] as const,
  reviewHistory: ["review-history"] as const,
};
