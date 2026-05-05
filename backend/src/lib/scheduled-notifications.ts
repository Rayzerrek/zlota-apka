import { and, eq, gte, lt, sql } from "drizzle-orm";

import { exams, notifications, studySessions, user } from "../db/schema";

import type { Db } from "./db";

export async function generateScheduledNotifications(
  db: Db,
  todayStr: string,
  now: Date,
) {
  const users = await db.select({ id: user.id }).from(user);

  for (const u of users) {
    // Overdue sessions
    const [overdueRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(studySessions)
      .where(
        and(
          eq(studySessions.userId, u.id),
          lt(studySessions.scheduledDate, todayStr),
          eq(studySessions.status, "planned"),
        ),
      );

    const overdueCount = Number(overdueRow?.count ?? 0);

    if (overdueCount > 0) {
      const [existing] = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, u.id),
            eq(notifications.type, "overdue_reminder"),
            sql`DATE(${notifications.scheduledFor}) = ${todayStr}`,
          ),
        )
        .limit(1);

      if (!existing) {
        await db.insert(notifications).values({
          userId: u.id,
          type: "overdue_reminder",
          category: "session",
          priority: "high",
          title:
            overdueCount === 1
              ? "Masz 1 zaległą sesję"
              : `Masz ${overdueCount} zaległe sesje`,
          description:
            "Najlepiej zacząć od pierwszej wolnej pozycji w planie dnia.",
          actionUrl: "/today",
          sentAt: now,
          scheduledFor: new Date(todayStr),
        });
      }
    }

    // Upcoming exam reminder (<= 3 days)
    const [nextExam] = await db
      .select({ id: exams.id, name: exams.name, examDate: exams.examDate })
      .from(exams)
      .where(and(eq(exams.userId, u.id), gte(exams.examDate, todayStr)))
      .orderBy(exams.examDate)
      .limit(1);

    if (nextExam) {
      const examDay = new Date(nextExam.examDate);
      const todayDay = new Date(todayStr);
      const diffMs = examDay.getTime() - todayDay.getTime();
      const examDays = Math.ceil(diffMs / 86_400_000);

      if (examDays >= 0 && examDays <= 3) {
        const [existing] = await db
          .select({ id: notifications.id })
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, u.id),
              eq(notifications.type, "exam_reminder"),
              sql`DATE(${notifications.scheduledFor}) = ${todayStr}`,
            ),
          )
          .limit(1);

        if (!existing) {
          const title =
            examDays === 0
              ? `${nextExam.name} jest dziś`
              : examDays === 1
                ? `${nextExam.name} jest jutro`
                : `${nextExam.name} za ${examDays} dni`;

          const [sessionCountRow] = await db
            .select({ count: sql<number>`count(*)` })
            .from(studySessions)
            .where(
              and(
                eq(studySessions.userId, u.id),
                eq(studySessions.scheduledDate, todayStr),
                eq(studySessions.status, "planned"),
              ),
            );

          const remainingSessions = Number(sessionCountRow?.count ?? 0);

          await db.insert(notifications).values({
            userId: u.id,
            type: "exam_reminder",
            category: "exam",
            priority: examDays <= 1 ? "high" : "medium",
            title,
            description:
              remainingSessions > 0
                ? `Na dziś zostało jeszcze ${remainingSessions} ${remainingSessions === 1 ? "sesja" : "sesje"}.`
                : "Plan na dziś masz już domknięty.",
            actionUrl: "/calendar",
            sentAt: now,
            scheduledFor: new Date(todayStr),
          });
        }
      }
    }
  }
}
