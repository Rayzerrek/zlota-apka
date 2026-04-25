export type ApiSubject = {
  id: string;
  key: string;
  name: string;
  color: string;
  difficulty: number;
};

export type ApiTopic = {
  id: string;
  name: string;
  position: number;
};

export type ApiSession = {
  id: string;
  topicId: string;
  scheduledDate: string;
  plannedMinutes: number;
  sessionType: string;
  status: string;
};

export type ApiExam = {
  id: string;
  subjectId: string;
  name: string;
  examDate: string;
  difficulty: number;
  materialSize: "small" | "medium" | "large";
};

export type ExamCreateResponse = {
  exam: ApiExam;
  topics: ApiTopic[];
  sessions: ApiSession[];
  schedulerRunId: string;
};

export type ApiDashboardSession = {
  id: string;
  scheduledDate: string;
  plannedMinutes: number;
  sessionType: string;
  status: string;
  topicId: string | null;
  topicName: string | null;
  subjectKey: string | null;
  subjectName: string | null;
};

export type ApiDashboardExam = {
  id: string;
  name: string;
  examDate: string;
  difficulty: number;
  materialSize: "small" | "medium" | "large";
  subjectKey: string | null;
  subjectName: string | null;
};

export type ApiDashboard = {
  today: ApiDashboardSession[];
  overdue: { id: string }[];
  upcomingExams: ApiDashboardExam[];
  week: { total: number; completed: number; progressPercent: number };
};

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; status: number; message: string };
export type ApiResult<T> = ApiOk<T> | ApiErr;
