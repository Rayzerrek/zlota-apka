import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";

import { subjects } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import {
  idParamsSchema,
  subjectCreateSchema,
  subjectPatchSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Subjects"],
  responses: { 200: { description: "List of subjects" } },
});

const createSubjectRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Subjects"],
  request: {
    body: {
      content: { "application/json": { schema: subjectCreateSchema } },
      required: true,
    },
  },
  responses: { 201: { description: "Created subject" } },
});

const patchSubjectRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Subjects"],
  request: {
    params: idParamsSchema,
    body: {
      content: { "application/json": { schema: subjectPatchSchema } },
      required: true,
    },
  },
  responses: {
    200: { description: "Updated subject" },
    404: { description: "Not found" },
  },
});

const deleteSubjectRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Subjects"],
  request: { params: idParamsSchema },
  responses: {
    200: { description: "Deleted" },
    404: { description: "Not found" },
  },
});

export const subjectsRouter = new OpenAPIHono<HonoEnv>();

subjectsRouter.use(requireAuth);

subjectsRouter.openapi(listRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const rows = await db
      .select()
      .from(subjects)
      .where(eq(subjects.userId, c.get("userId")));
    return c.json(rows, 200);
  } catch (err) {
    console.error("GET /subjects failed", err);
    throw err;
  }
});

subjectsRouter.openapi(createSubjectRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const [row] = await db
      .insert(subjects)
      .values({ ...c.req.valid("json"), userId: c.get("userId") })
      .returning();
    return c.json(row, 201);
  } catch (err) {
    console.error("POST /subjects failed", err);
    throw err;
  }
});

subjectsRouter.openapi(patchSubjectRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const [row] = await db
      .update(subjects)
      .set(c.req.valid("json"))
      .where(
        and(
          eq(subjects.id, c.req.valid("param").id),
          eq(subjects.userId, c.get("userId")),
        ),
      )
      .returning();
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row, 200);
  } catch (err) {
    console.error("PATCH /subjects/:id failed", err);
    throw err;
  }
});

subjectsRouter.openapi(deleteSubjectRoute, async (c) => {
  try {
    const db = createDb(c.env);
    const [row] = await db
      .delete(subjects)
      .where(
        and(
          eq(subjects.id, c.req.valid("param").id),
          eq(subjects.userId, c.get("userId")),
        ),
      )
      .returning();
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ ok: true }, 200);
  } catch (err) {
    console.error("DELETE /subjects/:id failed", err);
    throw err;
  }
});
