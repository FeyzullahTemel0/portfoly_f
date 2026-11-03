import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { AdminHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { isStorageConfigured } from "@/lib/storage";
import { Ad } from "@/models/ad";
import type { AdInput } from "../../manage-actions";
import { AdForm } from "./ad-form";

const emptyAd: AdInput = {
  advertiser: "",
  pages: ["all"],
  position: "top",
  imageUrl: "",
  imagePublicId: "",
  mobileImageUrl: "",
  mobileImagePublicId: "",
  linkUrl: "",
  alt: "",
  startsAt: "",
  endsAt: "",
  active: true,
  weight: 1,
};

const toLocalInput = (value: Date | null) => (value ? new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

export default async function AdEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  let initial = emptyAd;
  let stats: { impressions: number; clicks: number } | undefined;

  if (!isNew) {
    if (!mongoose.isValidObjectId(id)) notFound();
    await connectDb();
    const doc = await Ad.findById(id).lean();
    if (!doc) notFound();
    initial = {
      advertiser: doc.advertiser,
      pages: doc.pages,
      position: doc.position,
      imageUrl: doc.imageUrl,
      imagePublicId: doc.imagePublicId,
      mobileImageUrl: doc.mobileImageUrl,
      mobileImagePublicId: doc.mobileImagePublicId,
      linkUrl: doc.linkUrl,
      alt: doc.alt,
      startsAt: toLocalInput(doc.startsAt),
      endsAt: toLocalInput(doc.endsAt),
      active: doc.active,
      weight: doc.weight,
    };
    stats = { impressions: doc.impressions, clicks: doc.clicks };
  }

  return (
    <>
      <AdminHeader title={isNew ? "Yeni reklam" : "Reklamı düzenle"} text="Reklam verenin görselini yükleyin, gösterileceği sayfaları ve konumu seçin." />
      <AdForm id={isNew ? null : id} initial={initial} ready={isStorageConfigured()} stats={stats} />
    </>
  );
}
