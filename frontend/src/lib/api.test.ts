import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { apiDelete, apiGet, apiPatch, apiPost } from "./api";

const TestSchema = z.object({ id: z.string(), value: z.number() });

function mockFetch(data: unknown, status = 200) {
  return vi.mocked(fetch).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? "Not Found" : "OK",
    json: () => Promise.resolve(data),
  } as Response);
}

function mockFetchNetworkError() {
  return vi
    .mocked(fetch)
    .mockRejectedValueOnce(new TypeError("Failed to fetch"));
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("apiGet", () => {
  it("returns data on success", async () => {
    mockFetch({ id: "1", value: 42 });
    const result = await apiGet("/test", TestSchema);

    expect(result).toEqual({ ok: true, data: { id: "1", value: 42 } });
    expect(fetch).toHaveBeenCalledWith("/test", {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("returns error on non-ok response", async () => {
    mockFetch({ error: "Not found" }, 404);
    const result = await apiGet("/test", TestSchema);

    expect(result).toEqual({ ok: false, status: 404, message: "Not found" });
  });

  it("returns error on network failure", async () => {
    mockFetchNetworkError();
    const result = await apiGet("/test", TestSchema);

    expect(result).toEqual({
      ok: false,
      status: 0,
      message: "Błąd połączenia z serwerem",
    });
  });

  it("returns error on zod validation failure", async () => {
    mockFetch({ id: "1", value: "not-a-number" });
    const result = await apiGet("/test", TestSchema);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("Błąd walidacji odpowiedzi");
      expect(result.message).toContain("value");
    }
  });
});

describe("apiPost", () => {
  it("sends POST with JSON body", async () => {
    mockFetch({ id: "1", value: 10 });

    await apiPost("/test", TestSchema, { value: 10 });

    expect(fetch).toHaveBeenCalledWith("/test", {
      method: "POST",
      body: JSON.stringify({ value: 10 }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("returns parsed data on success", async () => {
    mockFetch({ id: "1", value: 10 });
    const result = await apiPost("/test", TestSchema, { value: 10 });

    expect(result).toEqual({ ok: true, data: { id: "1", value: 10 } });
  });
});

describe("apiPatch", () => {
  it("sends PATCH with JSON body", async () => {
    mockFetch({ id: "1", value: 20 });

    await apiPatch("/test", TestSchema, { value: 20 });

    expect(fetch).toHaveBeenCalledWith("/test", {
      method: "PATCH",
      body: JSON.stringify({ value: 20 }),
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("returns parsed data on success", async () => {
    mockFetch({ id: "1", value: 20 });
    const result = await apiPatch("/test", TestSchema, { value: 20 });

    expect(result).toEqual({ ok: true, data: { id: "1", value: 20 } });
  });
});

describe("apiDelete", () => {
  it("sends DELETE request", async () => {
    mockFetch({ id: "1", value: 99 });

    await apiDelete("/test", TestSchema);

    expect(fetch).toHaveBeenCalledWith("/test", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("returns parsed data on success", async () => {
    mockFetch({ id: "1", value: 99 });
    const result = await apiDelete("/test", TestSchema);

    expect(result).toEqual({ ok: true, data: { id: "1", value: 99 } });
  });
});
