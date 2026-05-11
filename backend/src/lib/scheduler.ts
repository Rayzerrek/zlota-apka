const SESSION_MINUTES = {
  small: 20,
  medium: 30,
  large: 45,
} as const;

interface Availability {
  dayOfWeek: number;
  availableMinutes: number;
}

interface Topic {
  id: string;
}

interface ExamInput {
  materialSize: "small" | "medium" | "large";
  difficulty: number;
}

export interface PlannedSession {
  topicId: string;
  scheduledDate: string;
  plannedMinutes: number;
  sessionType: "study";
  status: "planned";
}

export function generatePlan(
  exam: ExamInput,
  topics: Topic[],
  availability: Availability[],
  todayIso: string,
  examDateIso: string,
): PlannedSession[] {
  if (topics.length === 0) return [];

  const minutesPerSession = SESSION_MINUTES[exam.materialSize] ?? 30;

  const slots: string[] = [];
  const cursor = new Date(todayIso);
  const examDay = new Date(examDateIso);

  while (cursor < examDay) {
    const dow = cursor.getDay();
    const avail = availability.find((a) => a.dayOfWeek === dow);
    if (avail && avail.availableMinutes >= minutesPerSession) {
      slots.push(cursor.toISOString().slice(0, 10));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (slots.length === 0) {
    const fallback: PlannedSession[] = topics.map((topic, i) => {
      const d = new Date(todayIso);
      d.setDate(d.getDate() + i);
      return {
        topicId: topic.id,
        scheduledDate: d.toISOString().slice(0, 10),
        plannedMinutes: minutesPerSession,
        sessionType: "study",
        status: "planned",
      };
    });
    return fallback;
  }

  return topics.map((topic, i) => ({
    topicId: topic.id,
    scheduledDate: slots[i % slots.length],
    plannedMinutes: minutesPerSession,
    sessionType: "study",
    status: "planned",
  }));
}
