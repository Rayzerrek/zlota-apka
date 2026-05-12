import { neon } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { EmailMessage } from "cloudflare:email";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema";

import type { BetterAuthOptions } from "better-auth";

export type Env = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  SEND_EMAIL: SendEmail;
  EMAIL_FROM: string;
  FRONTEND_URL?: string;
  GEMINI_API_KEY?: string;
  DEMO_GUEST_ID?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

type AuthInstance = ReturnType<typeof betterAuth>;
const authCache = new WeakMap<object, AuthInstance>();

export function createAuth(env: Env): AuthInstance {
  const cached = authCache.get(env);
  if (cached) return cached;

  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, { schema });
  const betterAuthUrl = env.BETTER_AUTH_URL;
  const isSecureAuth = betterAuthUrl.startsWith("https://");

  const opts: BetterAuthOptions = {
    database: drizzleAdapter(db, { provider: "pg", schema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [
      env.BETTER_AUTH_URL,
      ...(env.FRONTEND_URL
        ? env.FRONTEND_URL.split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []),
    ],
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendAuthEmail(
            env,
            email,
            "Zaloguj się do Powtórek",
            `<p>Kliknij link żeby się zalogować:</p><a href="${url}">${url}</a><p>Link wygasa za 10 minut.</p>`,
          );
        },
      }),
    ],
    advanced: {
      useSecureCookies: isSecureAuth,
      defaultCookieAttributes: {
        sameSite: isSecureAuth ? "none" : "lax",
      },
      cookies: {
        session_token: {
          attributes: {
            sameSite: isSecureAuth ? "none" : "lax",
            secure: isSecureAuth,
          },
        },
      },
    },
    user: {
      additionalFields: {
        grade: { type: "string", required: false },
        onboardingDone: {
          type: "boolean",
          required: false,
          defaultValue: false,
        },
      },
    },
  };
  const auth = betterAuth(opts);

  authCache.set(env, auth);
  return auth;
}

function buildMimeEmail(
  from: string,
  to: string,
  subject: string,
  html: string,
): string {
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    html,
  ].join("\r\n");
}

export async function sendAuthEmail(
  env: Env,
  to: string,
  subject: string,
  html: string,
) {
  const raw = buildMimeEmail(env.EMAIL_FROM, to, subject, html);
  const msg = new EmailMessage(env.EMAIL_FROM, to, raw);
  await env.SEND_EMAIL.send(msg);
}

export type Auth = ReturnType<typeof createAuth>;
