import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { type Env } from "./lib/auth";
import { createDb } from "./lib/db";
import { generateScheduledNotifications } from "./lib/scheduled-notifications";
import { cardsRouter } from "./routes/cards";
import { dashboardRouter } from "./routes/dashboard";
import { examsRouter } from "./routes/exams";
import { notesRouter } from "./routes/notes";
import { notificationsRouter } from "./routes/notifications";
import { onboardingRouter } from "./routes/onboarding";
import scanRouter from "./routes/scan";
import { sessionsRouter } from "./routes/sessions";
import { subjectsRouter } from "./routes/subjects";
import { topicsRouter } from "./routes/topics";
import { usersRouter } from "./routes/users";

function createCorsMiddleware(origins: string[]) {
  return cors({
    origin: (origin) => {
      if (!origins.includes(origin)) return null;
      return origin;
    },
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });
}

export function createApp() {
  const app = new OpenAPIHono<{ Bindings: Env }>();

  app.use("/api/*", async (c, next) => {
    const origins = (c.env.FRONTEND_URL ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const corsMiddleware = createCorsMiddleware(origins);
    return corsMiddleware(c, next);
  });

  app.route("/api/notes", notesRouter);
  app.route("/api/scan", scanRouter);
  app.route("/api/onboarding", onboardingRouter);
  app.route("/api/users", usersRouter);
  app.route("/api/subjects", subjectsRouter);
  app.route("/api/exams", examsRouter);
  app.route("/api/notifications", notificationsRouter);
  app.route("/api/dashboard", dashboardRouter);
  app.route("/api/sessions", sessionsRouter);
  app.route("/api/topics", topicsRouter);
  app.route("/api/cards", cardsRouter);

  app.doc("/api/doc", {
    openapi: "3.0.0",
    info: { title: "API", version: "1.0.0" },
  });

  app.get("/", (c) => {
    return c.text("Działa");
  });

  app.get("/api/reference", Scalar({ url: "/api/doc" }));

  app.onError((err, c) => {
    console.error("Unhandled app error", {
      path: c.req.path,
      method: c.req.method,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return c.json({ error: "Internal server error" }, 500);
  });

  return app;
}

export const app = createApp();

export default {
  fetch: app.fetch,
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    _ctx: ExecutionContext,
  ) {
    const db = createDb(env);
    const today = new Date().toISOString().slice(0, 10);
    await generateScheduledNotifications(db, today, new Date());
  },
} satisfies ExportedHandler<Env>;
