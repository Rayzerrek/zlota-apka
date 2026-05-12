import { vi } from "vitest";

const generateContentMock = vi.fn();

type ResolverArgs = {
  kind: "select" | "insert" | "update" | "delete";
  table: unknown;
  values?: unknown;
  returning?: boolean;
};

type Resolver = (args: ResolverArgs) => unknown;

type FakeDbChain = {
  where?: () => FakeDbChain;
  leftJoin?: () => FakeDbChain;
  orderBy?: () => FakeDbChain;
  limit?: () => FakeDbChain;
  offset?: () => FakeDbChain;
  returning?: () => FakeDbChain;
  values?: (nextValues: unknown) => FakeDbChain;
  set?: (nextValues: unknown) => FakeDbChain;
  from?: (table: unknown) => FakeDbChain;
  then: <TResult1 = unknown, TResult2 = never>(
    onFulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) => Promise<TResult1 | TResult2>;
};

type FakeDb = {
  select: () => FakeDbChain;
  insert: (table: unknown) => FakeDbChain;
  update: (table: unknown) => FakeDbChain;
  delete: (table: unknown) => FakeDbChain;
  transaction: <T>(callback: (tx: FakeDb) => Promise<T>) => Promise<T>;
};

let currentDb: FakeDb;
let currentSession: { user: { id: string } } | null = null;

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(function GoogleGenerativeAI() {
    return {
      getGenerativeModel: () => ({ generateContent: generateContentMock }),
    };
  }),
}));

vi.mock("../src/lib/db", () => ({
  createDb: vi.fn(() => currentDb),
}));

vi.mock("../src/lib/auth", () => ({
  createAuth: vi.fn(() => ({
    api: {
      getSession: vi.fn(async () => currentSession),
    },
  })),
}));

function createThenable<T>(executor: () => T | Promise<T>) {
  return {
    then<TResult1 = T, TResult2 = never>(
      onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
      onRejected?:
        | ((error: unknown) => TResult2 | PromiseLike<TResult2>)
        | null,
    ) {
      return Promise.resolve(executor()).then(onFulfilled, onRejected);
    },
  };
}

export function createFakeDb(resolver: Resolver): FakeDb {
  return {
    select: () => {
      let tableRef: unknown;
      return {
        from(table: unknown) {
          tableRef = table;
          return this;
        },
        leftJoin() {
          return this;
        },
        where() {
          return this;
        },
        orderBy() {
          return this;
        },
        limit() {
          return this;
        },
        offset() {
          return this;
        },
        then: createThenable(() =>
          resolver({ kind: "select", table: tableRef }),
        ).then,
      };
    },
    insert: (table: unknown) => {
      let values: unknown;
      let returning = false;
      return {
        values(nextValues: unknown) {
          values = nextValues;
          return this;
        },
        returning() {
          returning = true;
          return this;
        },
        then: createThenable(() =>
          resolver({ kind: "insert", table, values, returning }),
        ).then,
      };
    },
    update: (table: unknown) => {
      let values: unknown;
      let returning = false;
      return {
        set(nextValues: unknown) {
          values = nextValues;
          return this;
        },
        where() {
          return this;
        },
        returning() {
          returning = true;
          return this;
        },
        then: createThenable(() =>
          resolver({ kind: "update", table, values, returning }),
        ).then,
      };
    },
    delete: (table: unknown) => {
      let returning = false;
      return {
        where() {
          return this;
        },
        returning() {
          returning = true;
          return this;
        },
        then: createThenable(() =>
          resolver({ kind: "delete", table, returning }),
        ).then,
      };
    },
    transaction: async <T>(callback: (tx: FakeDb) => Promise<T>) =>
      callback(createFakeDb(resolver)),
  };
}

export function resetTestState() {
  generateContentMock.mockReset();
  currentSession = { user: { id: "user-1" } };
  currentDb = createFakeDb(() => []);
}

export function setDb(resolver: Resolver) {
  currentDb = createFakeDb(resolver);
}

export function setSession(session: { user: { id: string } } | null) {
  currentSession = session;
}

export function createEnv(overrides: Record<string, unknown> = {}) {
  return {
    DATABASE_URL: "postgres://test",
    BETTER_AUTH_SECRET: "secret",
    BETTER_AUTH_URL: "http://localhost:8787",
    EMAIL_FROM: "Recurs <test@example.com>",
    SEND_EMAIL: {
      send: () => Promise.resolve(),
    } as unknown as SendEmail,
    FRONTEND_URL: "http://localhost:5173",
    GOOGLE_CLIENT_ID: "google-id",
    GOOGLE_CLIENT_SECRET: "google-secret",
    ...overrides,
  };
}

export { generateContentMock };
export const { app } = await import("../src/index");
