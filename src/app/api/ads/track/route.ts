import mongoose from "mongoose";
import { connectDb } from "@/lib/db";
import { Ad } from "@/models/ad";

export const dynamic = "force-dynamic";

// Reklam görüntülenme sayacı (yalnızca görünür alana girdiğinde istemci çağırır).
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!mongoose.isValidObjectId(id)) return new Response(null, { status: 400 });
  try {
    await connectDb();
    await Ad.updateOne({ _id: id, active: true }, { $inc: { impressions: 1 } });
  } catch (error) {
    console.error("Görüntülenme sayılamadı:", error);
  }
  return new Response(null, { status: 204 });
}
