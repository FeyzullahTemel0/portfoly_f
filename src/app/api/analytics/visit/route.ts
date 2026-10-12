import { NextResponse, type NextRequest } from "next/server";
import { recordPageView } from "@/lib/access-log";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return new NextResponse(null, { status: 403 });
  try {
    if (new URL(origin).host !== request.headers.get("host")) {
      return new NextResponse(null, { status: 403 });
    }
  } catch {
    return new NextResponse(null, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 2048) return new NextResponse(null, { status: 413 });
  if (request.cookies.get("analytics_consent")?.value !== "accepted") {
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 2048) return new NextResponse(null, { status: 413 });
    const payload: unknown = JSON.parse(rawBody);
    if (typeof payload !== "object" || payload === null) return new NextResponse(null, { status: 400 });
    const data = payload as Record<string, unknown>;
    if (typeof data.path !== "string" || data.path.length > 240) {
      return new NextResponse(null, { status: 204 });
    }
    await recordPageView({ path: data.path, referrer: data.referrer, headers: request.headers });
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
