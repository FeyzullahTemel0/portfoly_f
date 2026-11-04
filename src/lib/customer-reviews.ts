import "server-only";
import { cache } from "react";
import { connectDb } from "@/lib/db";
import { CustomerReview } from "@/models/customer-review";

export type PublicCustomerReview = { id: string; businessName: string; logoUrl: string; text: string; rating: number };

export const getApprovedReviews = cache(async (): Promise<PublicCustomerReview[]> => {
  try {
    await connectDb();
    const docs = await CustomerReview.find({ status: "approved" }).sort({ approvedAt: -1 }).limit(24).lean();
    return docs.map((doc) => ({ id: String(doc._id), businessName: doc.businessName, logoUrl: doc.logoUrl, text: doc.text, rating: doc.rating }));
  } catch (error) {
    console.error("Müşteri yorumları yüklenemedi:", error);
    return [];
  }
});
