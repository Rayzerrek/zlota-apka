import { z } from "zod";

/**
 * Tagged union representing every expected failure path of the HTTP layer.
 * Components/hooks can pattern-match on `tag` for behaviour and use
 * `apiErrorMessage` for a user-facing string.
 */
export type ApiError =
  | { tag: "network" }
  | { tag: "http"; status: number; message: string }
  | { tag: "validation"; issues: z.core.$ZodIssue[] }
  | { tag: "invalid_response" };

export function apiErrorMessage(error: ApiError): string {
  switch (error.tag) {
    case "network":
      return "Błąd połączenia z serwerem";
    case "http":
      return error.message;
    case "validation":
      return `Błąd walidacji odpowiedzi: ${error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ")}`;
    case "invalid_response":
      return "Nieprawidłowy format odpowiedzi serwera";
  }
}

/**
 * Bridge between Result-style return values and TanStack Query, which expects
 * thrown rejections. The structured `apiError` is preserved so consumers can
 * still match on `tag`; `message` keeps existing `error.message` consumers
 * working without changes.
 */
export class ApiErrorException extends Error {
  readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiErrorMessage(apiError));
    this.name = "ApiErrorException";
    this.apiError = apiError;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiErrorException) return error.apiError;
  return { tag: "network" };
}
