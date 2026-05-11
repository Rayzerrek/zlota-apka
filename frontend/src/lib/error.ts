import { z } from "zod";

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
      return typeof error.message === "string" ? error.message : "Błąd serwera";
    case "validation":
      return `Błąd walidacji odpowiedzi: ${error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ")}`;
    case "invalid_response":
      return "Nieprawidłowy format odpowiedzi serwera";
  }
}

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
