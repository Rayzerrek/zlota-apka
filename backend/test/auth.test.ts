import { beforeEach, describe, expect, it } from "vitest";

import { subjects, user } from "../src/db/schema";
import { app, createEnv, resetTestState, setDb, setSession } from "./harness";

beforeEach(() => {
  resetTestState();
});

describe("auth middleware", () => {
  it("allows guest access through guest cookie", async () => {
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
      {
        method: "GET",
        headers: { Cookie: "guest_user_id=guest-1" },
      },
      createEnv(),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(await response.json()).toEqual([]);
  });

  it("bootstraps one guest session and persists the cookie", async () => {
    setSession(null);
    let insertedUserId = "";

    setDb(({ kind, table, values }) => {
      if (kind === "insert" && table === user) {
        insertedUserId = String((values as { id: string }).id);
        return [];
      }
      return [];
    });

    const response = await app.request(
      "/api/auth/guest",
      { method: "POST" },
      createEnv(),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      userId: insertedUserId,
      isGuest: true,
    });
    expect(response.headers.get("set-cookie")).toContain(
      `guest_user_id=${insertedUserId}`,
    );
  });
});
