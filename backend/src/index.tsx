import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";

import { type Env } from "./lib/auth";
import { cardsRouter } from "./routes/cards";
import { dashboardRouter } from "./routes/dashboard";
import { examsRouter } from "./routes/exams";
import { onboardingRouter } from "./routes/onboarding";
import { sessionsRouter } from "./routes/sessions";
import { subjectsRouter } from "./routes/subjects";
import { topicsRouter } from "./routes/topics";
import { usersRouter } from "./routes/users";
import scanRouter from './routes/scan'; // Upewnij się, że w tym pliku jest "export default"

const app = new OpenAPIHono<{ Bindings: Env }>();

// 1. NAJPIERW DEFINIUJEMY FUNKCJĘ CORS
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

// 2. POTEM URUCHAMIAMY MIDDLEWARE DLA WSZYSTKICH ŚCIEŻEK /api/*
app.use("/api/*", async (c, next) => {
  const origins = (c.env.FRONTEND_URL ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const corsMiddleware = createCorsMiddleware(origins);
  return corsMiddleware(c, next);
});

// 3. DOPIERO TERAZ DEFINIUJEMY ROUTY (Wszystkie pod CORS)
app.route('/api/scan', scanRouter);
app.route("/api/onboarding", onboardingRouter);
app.route("/api/users", usersRouter);
app.route("/api/subjects", subjectsRouter);
app.route("/api/exams", examsRouter);
app.route("/api/dashboard", dashboardRouter);
app.route("/api/sessions", sessionsRouter);
app.route("/api", topicsRouter);
app.route("/api", cardsRouter);

// Reszta konfiguracji...
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

export default app;