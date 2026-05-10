import { beforeEach, describe, expect, it } from "vitest";

import { subjects, user } from "../src/db/schema";
import { app, createEnv, resetTestState, setDb, setSession } from "./harness";

beforeEach(() => {
  resetTestState();
});

describe("auth middleware", () => {
  it("allows guest access through DEMO_GUEST_ID and persists the cookie", async () => {
    setSession(null);
    setDb(({ kind, table }) => {
      if (kind === "select" && table === user) {
        return [{ id: "guest-1", isGuest: true }];
      }
      if (kind === "select" && table === subjects) {
        return [];
      }
      return [];
    });

    const response = await app.request(
      "/api/subjects",
      { method: "GET" },
      createEnv({ DEMO_GUEST_ID: "guest-1" }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain(
      "guest_user_id=guest-1",
    );
    expect(await response.json()).toEqual([]);
  });
});
