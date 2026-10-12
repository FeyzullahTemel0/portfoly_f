import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

export async function getClientIp() {
  const requestHeaders = await headers();
  const forwarded =
    requestHeaders.get("cf-connecting-ip") ||
    requestHeaders.get("x-vercel-forwarded-for");
  return forwarded?.split(",")[0].trim() || "unknown";
}

// Ham IP adresi saklanmaz, yalnızca geri döndürülemez kısa bir özeti tutulur.
export function hashIp(ip: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return "";
  return createHmac("sha256", secret)
    .update(ip)
    .digest("hex")
    .slice(0, 16);
}

type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();
const reportedRateLimits = new Map<string, number>();

export function isRateLimited(key: string, max: number) {
  const entry = attempts.get(key);
  return !!entry && entry.resetAt > Date.now() && entry.count >= max;
}

export function recordAttempt(key: string, windowMs: number) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    entry.count += 1;
  }
}

export function shouldReportRateLimit(key: string, windowMs: number) {
  const now = Date.now();
  const until = reportedRateLimits.get(key) ?? 0;
  if (until > now) return false;
  reportedRateLimits.set(key, now + windowMs);
  if (reportedRateLimits.size > 5000) {
    for (const [entryKey, expiry] of reportedRateLimits) if (expiry <= now) reportedRateLimits.delete(entryKey);
  }
  return true;
}
