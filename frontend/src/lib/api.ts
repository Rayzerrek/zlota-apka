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

const BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return {
        ok: false,
        status: res.status,
        message: body.error ?? res.statusText,
      };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, message: "Błąd połączenia z serwerem" };
  }
}

export function apiGet<T>(path: string): Promise<ApiResult<T>> {
  return request<T>(path);
}

export function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function apiPatch<T>(
  path: string,
  body: unknown,
): Promise<ApiResult<T>> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  return request<T>(path, { method: "DELETE" });
}
