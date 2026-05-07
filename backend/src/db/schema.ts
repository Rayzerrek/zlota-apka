import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  grade: text("grade"),
  onboardingDone: boolean("onboarding_done").notNull().default(false),
  isGuest: boolean("is_guest").notNull().default(false),
  settings: jsonb("settings").$type<Record<string, unknown>>(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const subjects = pgTable("subjects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  difficulty: smallint("difficulty").notNull().default(3),
});

export const exams = pgTable(
  "exams",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    examDate: date("exam_date").notNull(),
    difficulty: smallint("difficulty").notNull().default(3),
    materialSize: text("material_size", {
      enum: ["small", "medium", "large"],
    })
      .notNull()
      .default("medium"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_exams_date").on(t.userId, t.examDate)],
);

export const topics = pgTable(
  "topics",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    examId: text("exam_id").references(() => exams.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("idx_topics_exam").on(t.examId)],
);

export const notes = pgTable("notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  topicId: text("topic_id")
    .notNull()
    .references(() => topics.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  source: text("source", { enum: ["manual", "ai"] })
    .notNull()
    .default("manual"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const generatedNotes = pgTable("generated_notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  subject: text("subject"),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cards = pgTable(
  "cards",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    front: text("front").notNull(),
    back: text("back").notNull(),
    source: text("source", { enum: ["manual", "ai"] })
      .notNull()
      .default("manual"),
    // FSRS fields
    stability: real("stability").notNull().default(0),
    difficulty: real("difficulty").notNull().default(5),
    elapsedDays: integer("elapsed_days").notNull().default(0),
    scheduledDays: integer("scheduled_days").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    lapses: integer("lapses").notNull().default(0),
    state: smallint("state").notNull().default(0),
    lastReview: timestamp("last_review"),
    due: timestamp("due").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_cards_due").on(t.userId, t.due),
    index("idx_cards_topic").on(t.topicId),
    index("idx_cards_state").on(t.userId, t.state),
  ],
);

export const userAvailability = pgTable("user_availability", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  dayOfWeek: smallint("day_of_week").notNull(),
  availableMinutes: integer("available_minutes").notNull().default(60),
});

export const studySessions = pgTable(
  "study_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    examId: text("exam_id").references(() => exams.id, {
      onDelete: "set null",
    }),
    topicId: text("topic_id").references(() => topics.id, {
      onDelete: "set null",
    }),
    schedulerRunId: text("scheduler_run_id"),
    scheduledDate: date("scheduled_date").notNull(),
    plannedMinutes: integer("planned_minutes").notNull(),
    actualMinutes: integer("actual_minutes"),
    sessionType: text("session_type", {
      enum: ["study", "review", "quick_review"],
    })
      .notNull()
      .default("study"),
    status: text("status", {
      enum: ["planned", "completed", "skipped"],
    })
      .notNull()
      .default("planned"),
    notes: text("notes"),
    evaluationScore: smallint("evaluation_score"),
    completedScope: text("completed_scope", {
      enum: ["yes", "no", "partially"],
    }),
    difficultyNotes: text("difficulty_notes"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_sessions_date").on(t.userId, t.scheduledDate),
    index("idx_sessions_status").on(t.userId, t.status),
  ],
);

export const reviewHistory = pgTable(
  "review_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => studySessions.id, {
      onDelete: "set null",
    }),
    rating: smallint("rating").notNull(),
    stateBefore: smallint("state_before").notNull(),
    stabilityBefore: real("stability_before").notNull(),
    difficultyBefore: real("difficulty_before").notNull(),
    scheduledDays: integer("scheduled_days").notNull(),
    elapsedDays: integer("elapsed_days").notNull(),
    reviewedAt: timestamp("reviewed_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_reviews_user").on(t.userId, t.reviewedAt),
    index("idx_reviews_card").on(t.cardId, t.reviewedAt),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    category: text("category", {
      enum: ["exam", "session", "review", "ai", "system"],
    })
      .notNull()
      .default("system"),
    priority: text("priority", {
      enum: ["low", "medium", "high"],
    })
      .notNull()
      .default("medium"),
    title: text("title").notNull(),
    description: text("description"),
    actionUrl: text("action_url"),
    payload: jsonb("payload"),
    scheduledFor: timestamp("scheduled_for"),
    sentAt: timestamp("sent_at"),
    readAt: timestamp("read_at"),
    dismissedAt: timestamp("dismissed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_notifications_user").on(t.userId, t.createdAt),
    index("idx_notifications_user_read").on(t.userId, t.readAt),
    index("idx_notifications_user_scheduled").on(t.userId, t.scheduledFor),
  ],
);

export const schedulerRuns = pgTable("scheduler_runs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  examId: text("exam_id").references(() => exams.id, { onDelete: "set null" }),
  daysUntilExam: integer("days_until_exam").notNull(),
  topicsCount: integer("topics_count").notNull(),
  dailyMinutes: integer("daily_minutes").notNull(),
  sessionsCreated: integer("sessions_created").notNull(),
  planJson: jsonb("plan_json"),
  ranAt: timestamp("ran_at").notNull().defaultNow(),
});
