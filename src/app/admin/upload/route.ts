import { getAdminEmail } from "@/lib/auth";
import { allowedImageTypes, MAX_UPLOAD_BYTES, putImage } from "@/lib/storage";

export async function POST(request: Request) {
  if (!(await getAdminEmail())) return Response.json({ error: "Oturum gerekli." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folder = form?.get("folder");
  if (!(file instanceof File) || typeof folder !== "string") return Response.json({ error: "Geçersiz istek." }, { status: 400 });
  if (!allowedImageTypes.includes(file.type)) return Response.json({ error: "Yalnızca JPG, PNG, WebP, GIF veya AVIF yüklenebilir." }, { status: 415 });
  if (file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "Görsel 4 MB'tan küçük olmalı." }, { status: 413 });

  try {
    const result = await putImage(folder, Buffer.from(await file.arrayBuffer()), file.type);
    if (!result) return Response.json({ error: "Depolama ayarlı değil veya klasör geçersiz." }, { status: 400 });
    return Response.json(result);
  } catch (error) {
    console.error("Görsel yüklenemedi:", error);
    return Response.json({ error: "Görsel yüklenemedi." }, { status: 500 });
  }
}
