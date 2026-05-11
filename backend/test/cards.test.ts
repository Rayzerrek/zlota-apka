import { beforeEach, describe, expect, it } from "vitest";

import { reviewHistory } from "../src/db/schema";
import { app, createEnv, resetTestState, setDb } from "./harness";

beforeEach(() => {
  resetTestState();
});

describe("card routes", () => {
  it("serves review history from the mounted cards route", async () => {
    setDb(({ kind, table }) => {
      if (kind === "select" && table === reviewHistory) {
        return [
          {
            id: "review-1",
            cardId: "card-1",
            sessionId: null,
            rating: 3,
            stateBefore: 0,
            stabilityBefore: 1,
            difficultyBefore: 5,
            scheduledDays: 2,
            elapsedDays: 1,
            reviewedAt: new Date().toISOString(),
          },
        ];
      }
      return [];
    });

    const response = await app.request(
      "/api/cards/review-history",
      { method: "GET" },
      createEnv(),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject([
      {
        id: "review-1",
        cardId: "card-1",
      },
    ]);
  });
});
