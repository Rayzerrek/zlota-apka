import { neon } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/neon-http";
import { Resend } from "resend";

import * as schema from "../db/schema";

import type { BetterAuthOptions } from "better-auth";

export type Env = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY: string;
  FRONTEND_URL?: string;
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
  const resend = new Resend(env.RESEND_API_KEY);

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
      enabled: false,
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
          await resend.emails.send({
            from: "Powtórki <onboarding@resend.dev>",
            to: email,
            subject: "Zaloguj się do Powtórek",
            html: `<p>Kliknij link żeby się zalogować:</p><a href="${url}">${url}</a><p>Link wygasa za 10 minut.</p>`,
          });
        },
      }),
    ],
    advanced: {
      useSecureCookies: true,
      cookies: {
        session_token: {
          attributes: {
            sameSite: "none",
            secure: true,
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

export type Auth = ReturnType<typeof createAuth>;
