import { neon } from "@neondatabase/serverless";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/neon-http";
import { Resend } from "resend";

import * as schema from "../db/schema";

export type Env = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  RESEND_API_KEY: string;
};

export function createAuth(env: Env) {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, { schema });
  const resend = new Resend(env.RESEND_API_KEY);

  return betterAuth({
    database: drizzleAdapter(db, { provider: "pg" }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: [env.BETTER_AUTH_URL],
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await resend.emails.send({
            from: "Powtórki <noreply@twoja-domena.pl>",
            to: email,
            subject: "Zaloguj się do Powtórek",
            html: `<p>Kliknij link żeby się zalogować:</p><a href="${url}">${url}</a><p>Link wygasa za 10 minut.</p>`,
          });
        },
      }),
    ],
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
  });
}

export type Auth = ReturnType<typeof createAuth>;
