import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";

import { subjects } from "../db/schema";
import { errorResponseSchema } from "../lib/constant";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";
import {
  idParamsSchema,
  okResponseSchema,
  subjectCreateSchema,
  subjectListResponseSchema,
  subjectPatchSchema,
  subjectRowSchema,
} from "../types/schemas";

import type { HonoEnv } from "../lib/factory";

const listRoute = createRoute({
  method: "get",
  path: "/subjects",
  tags: ["Subjects"],
  responses: {
    200: {
      description: "List of subjects",
      content: { "application/json": { schema: subjectListResponseSchema } },
    },
  },
});

const createSubjectRoute = createRoute({
  method: "post",
  path: "/subjects",
  tags: ["Subjects"],
  request: {
    body: {
      content: { "application/json": { schema: subjectCreateSchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Created subject",
      content: { "application/json": { schema: subjectRowSchema } },
    },
  },
});

const patchSubjectRoute = createRoute({
  method: "patch",
  path: "/subjects/{id}",
  tags: ["Subjects"],
  request: {
    params: idParamsSchema,
    body: {
      content: { "application/json": { schema: subjectPatchSchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Updated subject",
      content: { "application/json": { schema: subjectRowSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const deleteSubjectRoute = createRoute({
  method: "delete",
  path: "/subjects/{id}",
  tags: ["Subjects"],
  request: { params: idParamsSchema },
  responses: {
    200: {
      description: "Deleted",
      content: { "application/json": { schema: okResponseSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

export const subjectsRouter = new OpenAPIHono<HonoEnv>();

subjectsRouter.use(requireAuth);

subjectsRouter.openapi(listRoute, async (c) => {
  const db = createDb(c.env);
  const rows = await db
    .select()
    .from(subjects)
    .where(eq(subjects.userId, c.get("userId")));
  return c.json(rows, 200);
});

subjectsRouter.openapi(createSubjectRoute, async (c) => {
  const db = createDb(c.env);
  const [row] = await db
    .insert(subjects)
    .values({ ...c.req.valid("json"), userId: c.get("userId") })
    .returning();
  return c.json(row, 201);
});

subjectsRouter.openapi(patchSubjectRoute, async (c) => {
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
});

subjectsRouter.openapi(deleteSubjectRoute, async (c) => {
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
});
