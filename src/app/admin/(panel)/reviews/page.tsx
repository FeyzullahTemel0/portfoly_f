import { AdminHeader, DbError } from "@/components/admin/page-header";
import { ReviewsClient } from "@/components/admin/reviews-client";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { CustomerReview, ReviewLink } from "@/models/customer-review";

export const dynamic = "force-dynamic";

export default async function ReviewsAdminPage() {
  await requireAdmin();
  let reviews: { id: string; businessName: string; logoUrl: string; text: string; rating: number; status: "pending" | "approved" | "rejected"; createdAt: string }[] = [];
  let links: { id: string; createdAt: string; expiresAt: string; usedAt: string | null; revokedAt: string | null }[] = [];
  let failed = false;

  try {
    await connectDb();
    const [reviewDocs, linkDocs] = await Promise.all([
      CustomerReview.find().sort({ createdAt: -1 }).limit(200).lean(),
      ReviewLink.find().sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    reviews = reviewDocs.map((doc) => ({
      id: String(doc._id),
      businessName: doc.businessName,
      logoUrl: doc.logoUrl,
      text: doc.text,
      rating: doc.rating,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
    }));
    links = linkDocs.map((doc) => ({
      id: String(doc._id),
      createdAt: doc.createdAt.toISOString(),
      expiresAt: doc.expiresAt.toISOString(),
      usedAt: doc.usedAt?.toISOString() ?? null,
      revokedAt: doc.revokedAt?.toISOString() ?? null,
    }));
  } catch (error) {
    console.error("Yorum paneli yüklenemedi:", error);
    failed = true;
  }

  return (
    <>
      <AdminHeader title="Müşteri yorumları" text="Yorum bağlantısı oluşturun; gelen yorumları inceleyip ana sayfada yayımlayın." />
      {failed && <DbError />}
      <ReviewsClient initialReviews={reviews} initialLinks={links} />
    </>
  );
}
