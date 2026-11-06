import { connectDb } from "@/lib/db";
import { AD_SLOTS, isAdSlot, relatedAdPlacements, slotCapacity } from "@/lib/ads";
import { Ad } from "@/models/ad";

export const dynamic = "force-dynamic";

// Seçilen sayfa ve konumdaki yayındaki reklamları öncelik sırasına göre döndürür (yatayda en fazla 4, dikeyde 1).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = (url.searchParams.get("page") ?? "").slice(0, 20);
  const slot = url.searchParams.get("pos") ?? "";
  const headers = { "Cache-Control": "no-store" };
  if (!isAdSlot(slot) || !/^[a-z]+$/.test(page)) return Response.json({ ads: [] }, { headers });

  try {
    await connectDb();
    const now = new Date();
    const placements = relatedAdPlacements(`${page}:${slot}`);
    const docs = await Ad.find({
      active: true,
      placements: { $in: placements },
      $and: [{ $or: [{ startsAt: null }, { startsAt: { $lte: now } }] }, { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] }],
    })
      .sort({ priority: -1, createdAt: 1 })
      .limit(slotCapacity(slot))
      .lean();

    return Response.json(
      {
        slot,
        size: AD_SLOTS[slot].size,
        vertical: AD_SLOTS[slot].orientation === "vertical",
        ads: docs.map((ad) => ({
          id: String(ad._id),
          sponsor: ad.advertiser,
          title: ad.title,
          description: ad.description,
          image: ad.imageUrl,
          width: ad.imageWidth,
          height: ad.imageHeight,
        })),
      },
      { headers },
    );
  } catch (error) {
    console.error("Reklamlar alınamadı:", error);
    return Response.json({ ads: [] }, { headers });
  }
}
