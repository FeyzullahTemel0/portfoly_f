import { getImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const image = await getImage(key.join("/"));
  if (!image) return new Response("Not found", { status: 404 });
  const headers: Record<string, string> = {
    "Content-Type": image.contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (image.length) headers["Content-Length"] = String(image.length);
  return new Response(image.stream, { headers });
}
