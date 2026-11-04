import { allowedImageTypes, MAX_UPLOAD_BYTES, putImage } from "@/lib/storage";
import { connectDb } from "@/lib/db";
import { hashReviewToken } from "@/lib/review-token";
import { ReviewLink } from "@/models/customer-review";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  const file = form?.get("file");
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{40,48}$/.test(token) || !(file instanceof File)) {
    return Response.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (!allowedImageTypes.includes(file.type)) return Response.json({ error: "Bu görsel biçimi desteklenmiyor." }, { status: 415 });
  if (file.size < 1 || file.size > MAX_UPLOAD_BYTES) return Response.json({ error: "Görsel en fazla 4 MB olabilir." }, { status: 413 });

  try {
    await connectDb();
    const now = new Date();
    const link = await ReviewLink.findOneAndUpdate(
      { tokenHash: hashReviewToken(token), expiresAt: { $gt: now }, usedAt: null, revokedAt: null, uploadCount: { $lt: 3 } },
      { $inc: { uploadCount: 1 } },
      { new: true, projection: { _id: 1 } },
    ).lean();
    if (!link) return Response.json({ error: "Bu bağlantı kullanılamıyor veya görsel yükleme sınırına ulaşıldı." }, { status: 410 });

    const result = await putImage("rovax/reviews", Buffer.from(await file.arrayBuffer()), file.type);
    if (!result) return Response.json({ error: "Görsel deposu şu anda kullanılamıyor." }, { status: 503 });
    return Response.json({ url: result.url });
  } catch (error) {
    console.error("Müşteri logosu yüklenemedi:", error);
    return Response.json({ error: "Görsel yüklenemedi." }, { status: 500 });
  }
}
