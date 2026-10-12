import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET tanımlı değil veya 32 karakterden kısa.");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function createToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string): string | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.sub !== "string" || typeof data.exp !== "number") return null;
    return data.exp > Date.now() / 1000 ? data.sub : null;
  } catch {
    return null;
  }
}

// Saklama biçimi: scrypt:<tuz-hex>:<özet-hex> (scripts/admin-setup.mjs ile aynı).
export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = scryptSync(password, Buffer.from(salt, "hex"), 64);
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export async function startSession(email: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, createToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete({ name: COOKIE_NAME, path: "/admin" });
}

export async function getAdminEmail() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

// Her admin sayfasında ve her Server Action içinde çağrılmalıdır.
export async function requireAdmin() {
  const email = await getAdminEmail();
  if (!email) redirect("/admin/login");
  return email;
}
