import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? window.location.origin,
});

export type AuthError = {
  code?: string;
  message?: string;
  status: number;
  statusText: string;
};

export function authErrorMessage(
  error: AuthError | null,
  context: "login" | "signup",
): string {
  if (!error) return "";
  if (error.code === "USER_ALREADY_EXISTS")
    return "Konto z tym adresem już istnieje.";
  if (error.code === "INVALID_EMAIL_OR_PASSWORD")
    return "Nieprawidłowy e-mail lub hasło.";
  if (context === "login") return "Nie udało się zalogować. Spróbuj ponownie.";
  return "Nie udało się utworzyć konta. Spróbuj ponownie.";
}
