import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { createAuth, type Env } from "./lib/auth";
import { cardsRouter } from "./routes/cards";
import { dashboardRouter } from "./routes/dashboard";
import { examsRouter } from "./routes/exams";
import { onboardingRouter } from "./routes/onboarding";
import { sessionsRouter } from "./routes/sessions";
import { subjectsRouter } from "./routes/subjects";
import { topicsRouter } from "./routes/topics";
import { usersRouter } from "./routes/users";

const app = new OpenAPIHono<{ Bindings: Env }>();

app.use(
  "/api/*",
  cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.all("/api/auth/*", (c) => {
  try {
    const auth = createAuth(c.env);
    return auth.handler(c.req.raw);
  } catch (error) {
    console.error("Better Auth handler failed", {
      path: c.req.path,
      method: c.req.method,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      hasDatabaseUrl: Boolean(c.env.DATABASE_URL),
      hasBetterAuthSecret: Boolean(c.env.BETTER_AUTH_SECRET),
      hasBetterAuthUrl: Boolean(c.env.BETTER_AUTH_URL),
      hasBetterAuthApiKey: Boolean(c.env.BETTER_AUTH_API_KEY),
      hasResendApiKey: Boolean(c.env.RESEND_API_KEY),
    });
    throw error;
  }
});

app.route("/api/onboarding", onboardingRouter);
app.route("/api/users", usersRouter);
app.route("/api/subjects", subjectsRouter);
app.route("/api/exams", examsRouter);
app.route("/api/dashboard", dashboardRouter);
app.route("/api/sessions", sessionsRouter);

app.doc("/api/doc", {
  openapi: "3.0.0",
  info: { title: "Powtórki API", version: "1.0.0" },
});

app.get("/", (c) => {
  return c.text("Działa");
});

app.get("/api/reference", Scalar({ url: "/api/doc" }));

app.route("/api", topicsRouter);
app.route("/api", cardsRouter);

app.onError((err, c) => {
  console.error("Unhandled app error", {
    path: c.req.path,
    method: c.req.method,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  return c.json({ error: "Internal server error" }, 500);
});

export type AppType = typeof app;

export default app;
