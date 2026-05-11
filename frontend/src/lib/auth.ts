import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authBaseURL = import.meta.env.DEV
  ? window.location.origin
  : import.meta.env.VITE_API_URL;

if (!import.meta.env.DEV && !authBaseURL) {
  throw new Error(
    "VITE_API_URL is not set. Define it in .env.production or as an environment variable before building.",
  );
}

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [magicLinkClient()],
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
  if (error.code === "PASSWORD_TOO_SHORT")
    return "Hasło jest za krótkie. Użyj co najmniej 8 znaków.";
  if (context === "login") return "Nie udało się zalogować. Spróbuj ponownie.";
  return "Nie udało się utworzyć konta. Spróbuj ponownie.";
}
