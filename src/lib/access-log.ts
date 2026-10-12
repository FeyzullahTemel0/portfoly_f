import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { connectDb } from "@/lib/db";
import { AccessEvent, type AccessEventType } from "@/models/access-event";

function sourceIp(headers: Headers) {
  const raw =
    headers.get("cf-connecting-ip") ||
    headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
    "";
  return raw.trim().slice(0, 64);
}

// Aylık değişen HMAC anahtarı IP'yi saklamadan yaklaşık tekil ziyaret sayımı sağlar.
function sourceKey(ip: string, month = new Date().toISOString().slice(0, 7)) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !ip || ip === "unknown") return "";
  return createHmac("sha256", secret).update(`${month}:${ip}`).digest("hex").slice(0, 20);
}

function classify(headers: Headers) {
  const ua = (headers.get("user-agent") ?? "").toLowerCase();
  const device = /ipad|tablet/.test(ua) ? "tablet" : /mobile|iphone|android/.test(ua) ? "mobile" : ua ? "desktop" : "unknown";
  const browser = /edg\//.test(ua) ? "edge" : /firefox\//.test(ua) ? "firefox" : /chrome\//.test(ua) && !/edg\//.test(ua) ? "chrome" : /safari\//.test(ua) && !/chrome\//.test(ua) ? "safari" : "other";
  return { device, browser } as const;
}

function safeReferrerHost(value: unknown) {
  if (typeof value !== "string" || value.length > 1000) return "";
  try {
    return new URL(value).hostname.slice(0, 160);
  } catch {
    return "";
  }
}

const pageViewHits = new Map<string, number[]>();
const PAGE_VIEW_WINDOW_MS = 60_000;
const MAX_PAGE_VIEWS_PER_WINDOW = 90;

function canRecordPageView(key: string) {
  const now = Date.now();
  const hits = (pageViewHits.get(key) ?? []).filter((time) => now - time < PAGE_VIEW_WINDOW_MS);
  if (hits.length >= MAX_PAGE_VIEWS_PER_WINDOW) return false;
  hits.push(now);
  pageViewHits.set(key, hits);
  if (pageViewHits.size > 5000) {
    for (const [entryKey, times] of pageViewHits) {
      if (times.every((time) => now - time >= PAGE_VIEW_WINDOW_MS)) pageViewHits.delete(entryKey);
    }
  }
  return true;
}

export function isTrackablePath(path: string) {
  return /^\/(tr|en)(?:\/|$)/.test(path) && !path.startsWith("/tr/admin") && !path.startsWith("/en/admin");
}

export async function recordPageView(input: {
  path: string;
  referrer?: unknown;
  headers: Headers;
}) {
  const path = input.path.split(/[?#]/, 1)[0].slice(0, 240);
  if (!isTrackablePath(path)) return false;
  const ip = sourceIp(input.headers);
  const key = sourceKey(ip);
  if (!canRecordPageView(key || "unknown")) return false;

  try {
    const { device, browser } = classify(input.headers);
    await connectDb();
    await AccessEvent.create({
      type: "page_view",
      path,
      referrerHost: safeReferrerHost(input.referrer),
      device,
      browser,
      sourceKey: key,
    });
    return true;
  } catch (error) {
    console.warn("Ziyaret kaydı yazılamadı:", error instanceof Error ? error.message : "unknown error");
    return false;
  }
}

export async function recordSecurityEvent(type: Extract<AccessEventType, "login_failed" | "login_rate_limited" | "login_success">) {
  try {
    const requestHeaders = await headers();
    const key = sourceKey(sourceIp(requestHeaders));
    const path = "/admin/login";
    const { device, browser } = classify(requestHeaders);
    await connectDb();
    await AccessEvent.create({ type, path, referrerHost: "", device, browser, sourceKey: key });
  } catch (error) {
    console.warn("Güvenlik olayı kaydedilemedi:", error instanceof Error ? error.message : "unknown error");
  }
}
