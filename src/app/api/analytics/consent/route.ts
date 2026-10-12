import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
const COOKIE_NAME = "analytics_consent";
const MAX_AGE = 60 * 60 * 24 * 180;

function hasSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return new NextResponse(null, { status: 403 });
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 512) return new NextResponse(null, { status: 413 });

  let value: unknown;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 512) return new NextResponse(null, { status: 413 });
    value = (JSON.parse(body) as { consent?: unknown }).consent;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (value !== "accepted" && value !== "rejected") return new NextResponse(null, { status: 400 });

  const response = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!hasSameOrigin(request)) return new NextResponse(null, { status: 403 });
  const response = new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
