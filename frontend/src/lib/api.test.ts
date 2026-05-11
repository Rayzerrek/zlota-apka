import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

describe("api guest bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("window", {});
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("bootstraps the guest session once before parallel API requests", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/api/auth/guest")) {
        return new Response(
          JSON.stringify({ userId: "guest-1", isGuest: true }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const { apiGet } = await import("./api");
    const schema = z.array(z.string());

    const [first, second] = await Promise.all([
      apiGet("/api/cards", schema),
      apiGet("/api/subjects", schema),
    ]);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/auth/guest");
  });
});
