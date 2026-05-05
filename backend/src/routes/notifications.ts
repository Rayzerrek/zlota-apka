import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, desc, eq, isNull } from "drizzle-orm";

import { notifications } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import { idParamsSchema, notificationCreateSchema } from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const listNotificationsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Notifications"],
  responses: { 200: { description: "List of notifications" } },
});

const createNotificationRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Notifications"],
  request: {
    body: {
      content: { "application/json": { schema: notificationCreateSchema } },
      required: true,
    },
  },
  responses: { 201: { description: "Created notification" } },
});

const markReadRoute = createRoute({
  method: "patch",
  path: "/{id}/read",
  tags: ["Notifications"],
  request: { params: idParamsSchema },
  responses: {
    200: { description: "Marked notification as read" },
    404: { description: "Not found" },
  },
});

const markAllReadRoute = createRoute({
  method: "patch",
  path: "/read-all",
  tags: ["Notifications"],
  responses: {
    200: { description: "Marked all notifications as read" },
  },
});

const clearAllRoute = createRoute({
  method: "delete",
  path: "/",
  tags: ["Notifications"],
  responses: {
    200: { description: "Cleared all notifications" },
  },
});

export const notificationsRouter = new OpenAPIHono<HonoEnv>();

notificationsRouter.use(requireAuth);

notificationsRouter.openapi(listNotificationsRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const userId = c.get("userId");

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(100);

    return c.json(rows, 200);
  } catch (err) {
    console.error("GET /notifications failed", err);
    throw err;
  }
});

notificationsRouter.openapi(createNotificationRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const userId = c.get("userId");
    const body = c.req.valid("json");

    const [row] = await db
      .insert(notifications)
      .values({
        userId,
        type: body.type,
        title: body.title,
        description: body.description,
        actionUrl: body.actionUrl,
        category: body.category ?? "system",
        priority: body.priority ?? "medium",
        payload: body.payload,
        scheduledFor: null,
        sentAt: new Date(),
      })
      .returning();

    return c.json(row, 201);
  } catch (err) {
    console.error("POST /notifications failed", err);
    throw err;
  }
});

notificationsRouter.openapi(markReadRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const userId = c.get("userId");
    const id = c.req.valid("param").id;

    const [row] = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning({ id: notifications.id });

    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true }, 200);
  } catch (err) {
    console.error("PATCH /notifications/:id/read failed", err);
    throw err;
  }
});

notificationsRouter.openapi(markAllReadRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const userId = c.get("userId");

    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(eq(notifications.userId, userId), isNull(notifications.readAt)),
      );

    return c.json({ ok: true }, 200);
  } catch (err) {
    console.error("PATCH /notifications/read-all failed", err);
    throw err;
  }
});

notificationsRouter.openapi(clearAllRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const userId = c.get("userId");

    await db.delete(notifications).where(eq(notifications.userId, userId));

    return c.json({ ok: true }, 200);
  } catch (err) {
    console.error("DELETE /notifications failed", err);
    throw err;
  }
});
