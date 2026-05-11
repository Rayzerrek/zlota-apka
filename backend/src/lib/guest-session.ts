import { eq } from "drizzle-orm";
import { getCookie, setCookie } from "hono/cookie";

import {
  cards,
  exams,
  notes,
  notifications,
  studySessions,
  subjects,
  topics,
  user,
  userAvailability,
} from "../db/schema";
import { createAuth } from "./auth";
import { createDb } from "./db";

import type { HonoEnv } from "./factory";
import type { Context } from "hono";
import type { CookieOptions } from "hono/utils/cookie";

const GUEST_COOKIE_NAME = "guest_user_id";

function guestCookieOptions(env: { BETTER_AUTH_URL?: string }): CookieOptions {
  const secure = env.BETTER_AUTH_URL
    ? env.BETTER_AUTH_URL.startsWith("https://")
    : true;

  return {
    httpOnly: true,
    secure,
    sameSite: secure ? "None" : "Lax",
    partitioned: secure ? true : undefined,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  };
}

async function findGuestUserId(
  c: Context<HonoEnv>,
  guestId: string,
): Promise<string | null> {
  const db = createDb(c.env);

  try {
    const guestUser = await db
      .select({ id: user.id, isGuest: user.isGuest })
      .from(user)
      .where(eq(user.id, guestId))
      .limit(1);

    if (guestUser.length > 0 && guestUser[0].isGuest) {
      return guestUser[0].id;
    }
  } catch (err) {
    console.warn("[auth] failed to look up guest user:", err);
  }

  return null;
}

async function copyDemoData(
  db: ReturnType<typeof createDb>,
  fromUserId: string,
  toUserId: string,
) {
  const demoSubjects = await db
    .select()
    .from(subjects)
    .where(eq(subjects.userId, fromUserId));

  const subjectIdMap = new Map<string, string>();
  if (demoSubjects.length > 0) {
    const newSubjects = demoSubjects.map((s) => {
      const newId = crypto.randomUUID();
      subjectIdMap.set(s.id, newId);
      return {
        id: newId,
        userId: toUserId,
        key: s.key,
        name: s.name,
        color: s.color,
        difficulty: s.difficulty,
      };
    });
    await db.insert(subjects).values(newSubjects);
  }

  const demoExams = await db
    .select()
    .from(exams)
    .where(eq(exams.userId, fromUserId));

  const examIdMap = new Map<string, string>();
  if (demoExams.length > 0) {
    const newExams = demoExams.map((e) => {
      const newId = crypto.randomUUID();
      examIdMap.set(e.id, newId);
      return {
        id: newId,
        userId: toUserId,
        subjectId: subjectIdMap.get(e.subjectId) ?? e.subjectId,
        name: e.name,
        examDate: e.examDate,
        difficulty: e.difficulty,
        materialSize: e.materialSize,
        notes: e.notes,
        createdAt: e.createdAt,
      };
    });
    await db.insert(exams).values(newExams);
  }

  const demoTopics = await db
    .select()
    .from(topics)
    .where(eq(topics.userId, fromUserId));

  const topicIdMap = new Map<string, string>();
  if (demoTopics.length > 0) {
    const newTopics = demoTopics.map((t) => {
      const newId = crypto.randomUUID();
      topicIdMap.set(t.id, newId);
      return {
        id: newId,
        userId: toUserId,
        subjectId: subjectIdMap.get(t.subjectId) ?? t.subjectId,
        examId: t.examId ? (examIdMap.get(t.examId) ?? t.examId) : null,
        name: t.name,
        position: t.position,
        createdAt: t.createdAt,
      };
    });
    await db.insert(topics).values(newTopics);
  }

  const demoAvailability = await db
    .select()
    .from(userAvailability)
    .where(eq(userAvailability.userId, fromUserId));

  if (demoAvailability.length > 0) {
    await db.insert(userAvailability).values(
      demoAvailability.map((a) => ({
        userId: toUserId,
        dayOfWeek: a.dayOfWeek,
        availableMinutes: a.availableMinutes,
      })),
    );
  }

  const demoSessions = await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.userId, fromUserId));

  if (demoSessions.length > 0) {
    await db.insert(studySessions).values(
      demoSessions.map((s) => ({
        userId: toUserId,
        examId: s.examId ? (examIdMap.get(s.examId) ?? null) : null,
        topicId: s.topicId ? (topicIdMap.get(s.topicId) ?? null) : null,
        schedulerRunId: s.schedulerRunId,
        scheduledDate: s.scheduledDate,
        plannedMinutes: s.plannedMinutes,
        actualMinutes: s.actualMinutes,
        sessionType: s.sessionType,
        status: s.status,
        notes: s.notes,
        evaluationScore: s.evaluationScore,
        completedScope: s.completedScope,
        difficultyNotes: s.difficultyNotes,
        completedAt: s.completedAt,
        createdAt: s.createdAt,
      })),
    );
  }

  const demoCards = await db
    .select()
    .from(cards)
    .where(eq(cards.userId, fromUserId));

  const cardsToCopy = demoCards
    .map((card) => {
      const newTopicId = topicIdMap.get(card.topicId);
      if (!newTopicId) return null;
      return {
        userId: toUserId,
        topicId: newTopicId,
        front: card.front,
        back: card.back,
        source: card.source,
        stability: card.stability,
        difficulty: card.difficulty,
        elapsedDays: card.elapsedDays,
        scheduledDays: card.scheduledDays,
        reps: card.reps,
        lapses: card.lapses,
        state: card.state,
        lastReview: card.lastReview,
        due: card.due,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (cardsToCopy.length > 0) {
    await db.insert(cards).values(cardsToCopy);
  }

  const demoNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, fromUserId));

  const notesToCopy = demoNotes
    .map((n) => {
      const newTopicId = topicIdMap.get(n.topicId);
      if (!newTopicId) return null;
      return {
        userId: toUserId,
        topicId: newTopicId,
        content: n.content,
        source: n.source,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (notesToCopy.length > 0) {
    await db.insert(notes).values(notesToCopy);
  }

  const demoNotifications = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, fromUserId));

  if (demoNotifications.length > 0) {
    await db.insert(notifications).values(
      demoNotifications.map((n) => ({
        userId: toUserId,
        type: n.type,
        category: n.category,
        priority: n.priority,
        title: n.title,
        description: n.description,
        actionUrl: n.actionUrl,
        payload: n.payload,
        scheduledFor: n.scheduledFor,
        sentAt: n.sentAt,
        readAt: n.readAt,
        dismissedAt: n.dismissedAt,
        createdAt: n.createdAt,
      })),
    );
  }
}

async function createGuestUser(c: Context<HonoEnv>): Promise<string> {
  const db = createDb(c.env);
  const newGuestId = crypto.randomUUID();
  const now = new Date();

  await db.insert(user).values({
    id: newGuestId,
    name: "Gość",
    email: `guest-${newGuestId}@local`,
    emailVerified: true,
    isGuest: true,
    createdAt: now,
    updatedAt: now,
  });

  const demoGuestId = c.env.DEMO_GUEST_ID?.trim();
  if (demoGuestId) {
    try {
      const demoExists = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, demoGuestId))
        .limit(1);

      if (demoExists.length > 0) {
        await copyDemoData(db, demoGuestId, newGuestId);
      }
    } catch (err) {
      console.warn("[guest-session] failed to copy demo data:", err);
    }
  }

  return newGuestId;
}

function persistGuestCookie(c: Context<HonoEnv>, guestId: string) {
  setCookie(c, GUEST_COOKIE_NAME, guestId, guestCookieOptions(c.env));
}

export type ResolvedUser = {
  userId: string;
  isGuest: boolean;
};

export async function resolveUser(c: Context<HonoEnv>): Promise<ResolvedUser> {
  const headerGuestId = c.req.header("x-guest-user-id");
  if (headerGuestId) {
    const existingGuestId = await findGuestUserId(c, headerGuestId);
    if (existingGuestId) {
      console.log("[auth] resolved guest from header:", existingGuestId);
      return { userId: existingGuestId, isGuest: true };
    }
  }

  const cookieGuestId = getCookie(c, GUEST_COOKIE_NAME);
  if (cookieGuestId) {
    const existingGuestId = await findGuestUserId(c, cookieGuestId);
    if (existingGuestId) {
      console.log("[auth] resolved guest from cookie:", existingGuestId);
      return { userId: existingGuestId, isGuest: true };
    }
  }

  try {
    const auth = createAuth(c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session) {
      return { userId: session.user.id, isGuest: false };
    }
  } catch (err) {
    console.warn("[auth] getSession failed, falling back to guest:", err);
  }

  try {
    const newGuestId = await createGuestUser(c);
    persistGuestCookie(c, newGuestId);
    console.log("[auth] created new guest user:", newGuestId);
    return { userId: newGuestId, isGuest: true };
  } catch (err) {
    console.error("[auth] failed to create guest user:", err);
    throw err;
  }
}
