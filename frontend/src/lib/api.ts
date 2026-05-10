import { z } from "zod";

type ApiOk<T> = { ok: true; data: T };
type ApiErr = { ok: false; status: number; message: string };
export type ApiResult<T> = ApiOk<T> | ApiErr;

const GuestSessionSchema = z.object({
  userId: z.string().min(1),
  isGuest: z.boolean(),
});

let guestSessionReady = false;
let guestSessionPromise: Promise<void> | null = null;

const apiUrlSchema = z.string().url().optional();
const parsedApiUrl = apiUrlSchema.safeParse(import.meta.env.VITE_API_URL);
if (!parsedApiUrl.success) {
  console.error(
    "VITE_API_URL is invalid; falling back to current origin",
    parsedApiUrl.error.issues,
  );
}
const BASE = import.meta.env.DEV
  ? ""
  : parsedApiUrl.success
    ? (parsedApiUrl.data ?? "")
    : "";

export type RequestOptions = { signal?: AbortSignal };

function buildHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  const body = init?.body;
  const method = (init?.method ?? "GET").toUpperCase();

  const shouldSetContentType =
    body != null &&
    method !== "GET" &&
    method !== "HEAD" &&
    !(body instanceof FormData) &&
    !headers.has("Content-Type");

  if (shouldSetContentType) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function ensureGuestSession() {
  if (guestSessionReady || typeof window === "undefined") {
    return;
  }

  if (!guestSessionPromise) {
    guestSessionPromise = (async () => {
      const response = await fetch(`${BASE}/api/auth/guest`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Nie udało się zainicjalizować sesji gościa");
      }

      GuestSessionSchema.parse(await response.json());
      guestSessionReady = true;
    })().finally(() => {
      guestSessionPromise = null;
    });
  }

  await guestSessionPromise;
}

async function request<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  init?: RequestInit,
): Promise<ApiResult<z.infer<TSchema>>> {
  try {
    if (path !== "/api/auth/guest") {
      await ensureGuestSession();
    }

    const res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      ...init,
      headers: buildHeaders(init),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return {
        ok: false,
        status: res.status,
        message: body.error ?? res.statusText,
      };
    }
    const raw = await res.json();
    const data = schema.parse(raw);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    if (err instanceof z.ZodError) {
      return {
        ok: false,
        status: 0,
        message: `Błąd walidacji odpowiedzi: ${err.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ")}`,
      };
    }
    if (err instanceof SyntaxError) {
      return {
        ok: false,
        status: 0,
        message: "Nieprawidłowy format odpowiedzi serwera",
      };
    }
    return { ok: false, status: 0, message: "Błąd połączenia z serwerem" };
  }
}

export function apiGet<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options?: RequestOptions,
): Promise<ApiResult<z.infer<TSchema>>> {
  return request(path, schema, { signal: options?.signal });
}

export function apiPost<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  body: unknown,
  options?: RequestOptions,
): Promise<ApiResult<z.infer<TSchema>>> {
  return request(path, schema, {
    method: "POST",
    body: JSON.stringify(body),
    signal: options?.signal,
  });
}

export function apiPatch<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  body: unknown,
  options?: RequestOptions,
): Promise<ApiResult<z.infer<TSchema>>> {
  return request(path, schema, {
    method: "PATCH",
    body: JSON.stringify(body),
    signal: options?.signal,
  });
}

export function apiDelete<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  options?: RequestOptions,
): Promise<ApiResult<z.infer<TSchema>>> {
  return request(path, schema, { method: "DELETE", signal: options?.signal });
}
