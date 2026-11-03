import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { safeUrl } from "@/lib/site";
import { Ad } from "@/models/ad";

export const dynamic = "force-dynamic";

// Tıklamayı sayar ve reklam verenin adresine yönlendirir.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return new Response("Not found", { status: 404 });
  try {
    await connectDb();
    const ad = await Ad.findOneAndUpdate({ _id: id, active: true }, { $inc: { clicks: 1 } }, { new: true }).lean();
    const target = ad ? safeUrl(ad.linkUrl) : "";
    if (!target) return new Response("Not found", { status: 404 });
    return new Response(null, { status: 302, headers: { Location: target, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch (error) {
    console.error("Reklam yönlendirmesi başarısız:", error);
    return new Response("Error", { status: 500 });
  }
}
