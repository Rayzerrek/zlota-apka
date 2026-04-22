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
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

app.route("/api/onboarding", onboardingRouter);
app.route("/api/subjects", subjectsRouter);
app.route("/api/exams", examsRouter);
app.route("/api", topicsRouter);
app.route("/api/dashboard", dashboardRouter);
app.route("/api/sessions", sessionsRouter);
app.route("/api", cardsRouter);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

app.doc("/api/doc", {
  openapi: "3.0.0",
  info: { title: "Powtórki API", version: "1.0.0" },
});

app.get("/api/reference", Scalar({ url: "/api/doc" }));

export type AppType = typeof app;

export default app;
