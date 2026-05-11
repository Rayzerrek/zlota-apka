import { type PlannedSession, generatePlan } from "./scheduler";

type ExamPlanInput = {
  materialSize: "small" | "medium" | "large";
  difficulty: number;
};

type TopicInput = {
  id: string;
};

type AvailabilityInput = {
  dayOfWeek: number;
  availableMinutes: number;
};

export function generateExamPlan(
  exam: ExamPlanInput,
  topics: TopicInput[],
  availability: AvailabilityInput[],
  todayIso: string,
  examDateIso: string,
) {
  const plannedSessions = generatePlan(
    exam,
    topics,
    availability,
    todayIso,
    examDateIso,
  );

  return {
    plannedSessions,
    daysUntilExam: Math.max(
      0,
      Math.floor(
        (new Date(examDateIso).getTime() - new Date(todayIso).getTime()) /
          86_400_000,
      ),
    ),
    dailyMinutes: availability.reduce(
      (sum, item) => sum + item.availableMinutes,
      0,
    ),
  };
}

export function createStudySessions(
  plannedSessions: PlannedSession[],
  input: {
    userId: string;
    examId: string;
    schedulerRunId: string;
  },
) {
  return plannedSessions.map((session) => ({
    ...session,
    userId: input.userId,
    examId: input.examId,
    schedulerRunId: input.schedulerRunId,
  }));
}
