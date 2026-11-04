"use server";

import { revalidatePath } from "next/cache";
import { connectDb } from "@/lib/db";
import { hashReviewToken } from "@/lib/review-token";
import { isOwnImageUrl, keyFromUrl } from "@/lib/storage";
import { CustomerReview, ReviewLink } from "@/models/customer-review";

export async function submitCustomerReview(
  token: string,
  input: { businessName: string; logoUrl: string; text: string; rating: number; consent: boolean },
): Promise<{ ok: boolean; error?: "invalid" | "required" | "failed" }> {
  const businessName = typeof input?.businessName === "string" ? input.businessName.trim().slice(0, 120) : "";
  const logoUrl = typeof input?.logoUrl === "string" ? input.logoUrl.trim().slice(0, 500) : "";
  const text = typeof input?.text === "string" ? input.text.trim().slice(0, 1200) : "";
  const rating = Number(input?.rating);
  const consent = input?.consent === true;
  const logoPublicId = keyFromUrl(logoUrl);

  if (!businessName || businessName.length < 2 || !text || text.length < 20 || !Number.isInteger(rating) || rating < 1 || rating > 5 || !consent) {
    return { ok: false, error: "required" };
  }
  if (!isOwnImageUrl(logoUrl) || !logoPublicId.startsWith("rovax/reviews/")) return { ok: false, error: "required" };
  if (!/^[A-Za-z0-9_-]{40,48}$/.test(token)) return { ok: false, error: "invalid" };

  try {
    await connectDb();
    const now = new Date();
    const link = await ReviewLink.findOneAndUpdate(
      { tokenHash: hashReviewToken(token), expiresAt: { $gt: now }, usedAt: null, revokedAt: null },
      { $set: { usedAt: now } },
      { new: true },
    ).lean();
    if (!link) return { ok: false, error: "invalid" };

    await CustomerReview.create({ businessName, logoUrl, logoPublicId, text, rating, status: "pending", linkId: link._id, approvedAt: null });
    revalidatePath("/admin/reviews");
    return { ok: true };
  } catch (error) {
    console.error("Müşteri yorumu kaydedilemedi:", error);
    return { ok: false, error: "failed" };
  }
}
