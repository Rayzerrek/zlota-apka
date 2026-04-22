import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq, gte, lt, lte } from "drizzle-orm";

import { exams, studySessions } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";

import type { HonoEnv } from "../lib/factory";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const dashboardRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Dashboard"],
  responses: { 200: { description: "Dashboard summary" } },
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

  const [todaySessions, overdueSessions, upcomingExams, weekSessions] =
    await Promise.all([
      db
        .select()
        .from(studySessions)
        .where(
          and(
            eq(studySessions.userId, userId),
            eq(studySessions.scheduledDate, today),
          ),
        ),

      db
        .select()
        .from(studySessions)
        .where(
          and(
            eq(studySessions.userId, userId),
            lt(studySessions.scheduledDate, today),
            eq(studySessions.status, "planned"),
          ),
        ),

      db
        .select()
        .from(exams)
        .where(and(eq(exams.userId, userId), gte(exams.examDate, today)))
        .orderBy(exams.examDate)
        .limit(5),

      db
        .select()
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
      overdue: overdueSessions,
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
