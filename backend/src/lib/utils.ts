import { HTTPException } from "hono/http-exception";
const authRateLimit = new Map<string, { count: number; resetAt: number }>();

export function checkAuthRateLimit(ip: string) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const max = 20;

  const entry = authRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    authRateLimit.set(ip, { count: 1, resetAt: now + windowMs });
    return;
  }
  entry.count++;
  if (entry.count > max) {
    throw new HTTPException(429, { message: "Too many requests" });
  }
}
