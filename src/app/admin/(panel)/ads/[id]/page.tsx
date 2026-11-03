import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { AdminHeader } from "@/components/admin/page-header";
import { isValidPlacement } from "@/lib/ads";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { isStorageConfigured } from "@/lib/storage";
import { Ad, adStatus } from "@/models/ad";
import type { AdInput } from "../../ads-actions";
import { AdForm } from "./ad-form";

const toDateInput = (value: Date | null) => (value ? new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 10) : "");

export default async function AdEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placement?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { placement } = await searchParams;
  const isNew = id === "new";

  let initial: AdInput = {
    advertiser: "",
    title: "",
    description: "",
    placements: placement && isValidPlacement(placement) ? [placement] : [],
    imageUrl: "",
    imagePublicId: "",
    imageWidth: 0,
    imageHeight: 0,
    linkUrl: "",
    startsAt: "",
    endsAt: "",
    active: true,
    priority: 0,
    note: "",
  };
  let stats: { impressions: number; clicks: number } | undefined;

  await connectDb();
  if (!isNew) {
    if (!mongoose.isValidObjectId(id)) notFound();
    const doc = await Ad.findById(id).lean();
    if (!doc) notFound();
    initial = {
      advertiser: doc.advertiser,
      title: doc.title,
      description: doc.description,
      placements: doc.placements,
      imageUrl: doc.imageUrl,
      imagePublicId: doc.imagePublicId,
      imageWidth: doc.imageWidth,
      imageHeight: doc.imageHeight,
      linkUrl: doc.linkUrl,
      startsAt: toDateInput(doc.startsAt),
      endsAt: toDateInput(doc.endsAt),
      active: doc.active,
      priority: doc.priority,
      note: doc.note,
    };
    stats = { impressions: doc.impressions, clicks: doc.clicks };
  }

  // Doluluk: bu reklam hariç, yayındaki ve planlanan reklamlar.
  const others = await Ad.find(isNew ? {} : { _id: { $ne: id } }).lean();
  const occupancy: Record<string, number> = {};
  for (const ad of others) {
    const state = adStatus(ad);
    if (state === "live" || state === "scheduled") for (const item of ad.placements) occupancy[item] = (occupancy[item] ?? 0) + 1;
  }

  return (
    <>
      <AdminHeader title={isNew ? "Yeni reklam" : "Reklamı düzenle"} text="Konumu seçin, reklamı hazırlayın ve yayın tarihini belirleyin." />
      <AdForm id={isNew ? null : id} initial={initial} occupancy={occupancy} ready={isStorageConfigured()} stats={stats} />
    </>
  );
}
