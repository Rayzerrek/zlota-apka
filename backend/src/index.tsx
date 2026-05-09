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

const app = new OpenAPIHono<{ Bindings: Env }>();

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

app.use("/api/*", async (c, next) => {
  const origins = (c.env.FRONTEND_URL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const corsMiddleware = createCorsMiddleware(origins);
  return corsMiddleware(c, next);
});

app.route("/api", notesRouter);
app.route("/api", scanRouter);
app.route("/api", onboardingRouter);
app.route("/api", usersRouter);
app.route("/api", subjectsRouter);
app.route("/api", examsRouter);
app.route("/api", notificationsRouter);
app.route("/api", dashboardRouter);
app.route("/api", sessionsRouter);
app.route("/api", topicsRouter);
app.route("/api", cardsRouter);

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
