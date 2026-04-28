import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { type Env } from "./lib/auth";
// import { createAuth } from "./lib/auth";
// import { checkAuthRateLimit } from "./lib/utils";
import { cardsRouter } from "./routes/cards";
import { dashboardRouter } from "./routes/dashboard";
import { examsRouter } from "./routes/exams";
import { onboardingRouter } from "./routes/onboarding";
import scanRouter from "./routes/scan";
import { sessionsRouter } from "./routes/sessions";
import { subjectsRouter } from "./routes/subjects";
import { topicsRouter } from "./routes/topics";
import { usersRouter } from "./routes/users";
const app = new OpenAPIHono<{ Bindings: Env }>();

app.route("/api/scan", scanRouter);
function createCorsMiddleware(origins: string[]) {
  return cors({
    origin: (origin) => {
      if (origins.includes(origin)) return origin;
      return null;
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

  return createCorsMiddleware(origins)(c, next);
});

app.route("/api/onboarding", onboardingRouter);
app.route("/api/users", usersRouter);
app.route("/api/subjects", subjectsRouter);
app.route("/api/exams", examsRouter);
app.route("/api/dashboard", dashboardRouter);
app.route("/api/sessions", sessionsRouter);

// Auth disabled temporarily
// app.all("/api/auth/**", async (c) => {
//   checkAuthRateLimit(c.req.header("cf-connecting-ip") ?? "unknown");
//   const auth = createAuth(c.env);
//   return auth.handler(c.req.raw);
// });

app.doc("/api/doc", {
  openapi: "3.0.0",
  info: { title: "API", version: "1.0.0" },
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

export default app;
