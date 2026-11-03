import { connectDb } from "@/lib/db";
import { AD_POSITIONS, isAdPosition } from "@/lib/ads";
import { Ad } from "@/models/ad";

export const dynamic = "force-dynamic";

// Seçilen sayfa ve konum için süresi geçerli, ağırlığa göre rastgele bir reklam döndürür.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = (url.searchParams.get("page") ?? "").slice(0, 20);
  const position = url.searchParams.get("pos") ?? "";
  const noStore = { "Cache-Control": "no-store" };
  if (!isAdPosition(position) || !/^[a-z]+$/.test(page)) return Response.json({ ad: null }, { headers: noStore });

  try {
    await connectDb();
    const now = new Date();
    const ads = await Ad.find({
      active: true,
      position,
      pages: { $in: ["all", page] },
      imageUrl: { $ne: "" },
      $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }],
    }).lean();
    if (ads.length === 0) return Response.json({ ad: null }, { headers: noStore });

    const total = ads.reduce((sum, ad) => sum + ad.weight, 0);
    let pick = Math.random() * total;
    const chosen = ads.find((ad) => (pick -= ad.weight) < 0) ?? ads[0];
    const spec = AD_POSITIONS[position];
    return Response.json(
      {
        ad: {
          id: String(chosen._id),
          image: chosen.imageUrl,
          mobileImage: chosen.mobileImageUrl,
          alt: chosen.alt || chosen.advertiser,
          desktop: chosen.imageWidth && chosen.imageHeight ? [chosen.imageWidth, chosen.imageHeight] : spec.desktop,
          mobile: chosen.mobileImageWidth && chosen.mobileImageHeight ? [chosen.mobileImageWidth, chosen.mobileImageHeight] : spec.mobile,
          maxWidth: spec.desktop[0],
          maxHeight: Math.max(180, Math.min(700, spec.desktop[1] * 2)),
          mobileMaxWidth: spec.mobile[0],
        },
      },
      { headers: noStore },
    );
  } catch (error) {
    console.error("Reklam alınamadı:", error);
    return Response.json({ ad: null }, { headers: noStore });
  }
}
