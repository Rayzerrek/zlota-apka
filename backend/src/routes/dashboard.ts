import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq, gte, lt, lte, sql } from "drizzle-orm";

import { exams, studySessions, subjects, topics } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { dashboardResponseSchema } from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const dashboardRoute = createRoute({
  method: "get",
  path: "/dashboard",
  tags: ["Dashboard"],
  responses: {
    200: {
      description: "Dashboard summary",
      content: { "application/json": { schema: dashboardResponseSchema } },
    },
  },
});

export const dashboardRouter = new OpenAPIHono<HonoEnv>();

dashboardRouter.use(requireAuth);

dashboardRouter.openapi(dashboardRoute, async (c) => {
  const db = createDb(c.env);
  const userId = c.get("userId");
  const today = isoDate(new Date());

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const sessionSelect = {
    id: studySessions.id,
    scheduledDate: studySessions.scheduledDate,
    plannedMinutes: studySessions.plannedMinutes,
    sessionType: studySessions.sessionType,
    status: studySessions.status,
    topicId: studySessions.topicId,
    topicName: topics.name,
    subjectKey: subjects.key,
    subjectName: subjects.name,
  };

  const [todaySessions, overdueStats, upcomingExams, weekSessions] =
    await Promise.all([
      db
        .select(sessionSelect)
        .from(studySessions)
        .leftJoin(topics, eq(studySessions.topicId, topics.id))
        .leftJoin(subjects, eq(topics.subjectId, subjects.id))
        .where(
          and(
            eq(studySessions.userId, userId),
            eq(studySessions.scheduledDate, today),
          ),
        ),

      db
        .select({ count: sql<number>`count(*)` })
        .from(studySessions)
        .where(
          and(
            eq(studySessions.userId, userId),
            lt(studySessions.scheduledDate, today),
            eq(studySessions.status, "planned"),
          ),
        ),

      db
        .select({
          id: exams.id,
          name: exams.name,
          examDate: exams.examDate,
          difficulty: exams.difficulty,
          materialSize: exams.materialSize,
          subjectKey: subjects.key,
          subjectName: subjects.name,
        })
        .from(exams)
        .leftJoin(subjects, eq(exams.subjectId, subjects.id))
        .where(and(eq(exams.userId, userId), gte(exams.examDate, today)))
        .orderBy(exams.examDate)
        .limit(5),

      db
        .select({ id: studySessions.id, status: studySessions.status })
        .from(studySessions)
        .where(
          and(
            eq(studySessions.userId, userId),
            gte(studySessions.scheduledDate, isoDate(weekStart)),
            lte(studySessions.scheduledDate, isoDate(weekEnd)),
          ),
        ),
    ]);

  const weekCompleted = weekSessions.filter(
    (s) => s.status === "completed",
  ).length;

  return c.json(
    {
      today: todaySessions,
      overdueCount: Number(overdueStats[0]?.count ?? 0),
      upcomingExams,
      week: {
        total: weekSessions.length,
        completed: weekCompleted,
        progressPercent:
          weekSessions.length > 0
            ? Math.round((weekCompleted / weekSessions.length) * 100)
            : 0,
      },
    },
    200,
  );
});
