import { beforeEach, describe, expect, it } from "vitest";

import { subjects } from "../src/db/schema";
import { app, createEnv, resetTestState, setDb } from "./harness";

beforeEach(() => {
  resetTestState();
});

describe("subjects key normalization", () => {
  it("normalizes alias keys during subject creation", async () => {
    setDb(({ kind, table, values }) => {
      if (kind === "insert" && table === subjects) {
        const payload = values as {
          key: string;
          name: string;
          color: string;
          difficulty: number;
          userId: string;
        };

        return [
          {
            id: "subject-1",
            userId: payload.userId,
            key: payload.key,
            name: payload.name,
            color: payload.color,
            difficulty: payload.difficulty,
          },
        ];
      }
      return [];
    });

    const response = await app.request(
      "/api/subjects",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "math",
          name: "Matematyka",
          color: "#6ea8ff",
          difficulty: 3,
        }),
      },
      createEnv(),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({ key: "mat" });
  });

  it("rejects unsupported subject keys", async () => {
    const response = await app.request(
      "/api/subjects",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "geografia",
          name: "Geografia",
          color: "#6ea8ff",
          difficulty: 3,
        }),
      },
      createEnv(),
    );

    expect(response.status).toBe(400);
  });
});
