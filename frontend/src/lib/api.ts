import { z } from "zod";

import type { ApiResult } from "../types/api";

export type { ApiResult } from "../types/api";
export type {
  ApiDashboard,
  ApiDashboardExam,
  ApiDashboardSession,
  ApiExam,
  ApiSession,
  ApiSubject,
  ApiTopic,
  ExamCreateResponse,
} from "../types/api";

const BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL ?? "");

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

async function request<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  init?: RequestInit,
): Promise<ApiResult<z.infer<TSchema>>> {
  try {
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
): Promise<ApiResult<z.infer<TSchema>>> {
  return request(path, schema);
}

export function apiPost<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  body: unknown,
): Promise<ApiResult<z.infer<TSchema>>> {
  return request(path, schema, { method: "POST", body: JSON.stringify(body) });
}

export function apiPatch<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  body: unknown,
): Promise<ApiResult<z.infer<TSchema>>> {
  return request(path, schema, { method: "PATCH", body: JSON.stringify(body) });
}

export function apiDelete<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
): Promise<ApiResult<z.infer<TSchema>>> {
  return request(path, schema, { method: "DELETE" });
}
