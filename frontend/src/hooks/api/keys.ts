export const queryKeys = {
  dashboard: ["dashboard"] as const,
  exams: ["exams"] as const,
  exam: (id: string) => ["exams", id] as const,
  sessions: (params?: { date?: string; from?: string; to?: string }) =>
    ["sessions", params ?? {}] as const,
  cardsDue: ["cards", "due"] as const,
  cardsByTopic: (topicId: string) => ["topics", topicId, "cards"] as const,
  subjects: ["subjects"] as const,
  topicsByExam: (examId: string) => ["exams", examId, "topics"] as const,
  user: ["user"] as const,
};
