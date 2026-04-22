import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { subjects } from "../db/schema";
import { createDb } from "../lib/db";
import { requireAuth } from "../middleware/auth";

import type { HonoEnv } from "../lib/factory";

const createSchema = z.object({
  key: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  difficulty: z.number().int().min(1).max(5),
});

const patchSchema = createSchema.partial();

const idParams = z.object({ id: z.string() });

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
      content: { "application/json": { schema: createSchema } },
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
    params: idParams,
    body: {
      content: { "application/json": { schema: patchSchema } },
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
  request: { params: idParams },
  responses: {
    200: { description: "Deleted" },
    404: { description: "Not found" },
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
