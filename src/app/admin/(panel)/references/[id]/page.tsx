import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { connectDb } from "@/lib/db";
import { Reference } from "@/models/reference";
import type { ReferenceInput } from "../../actions";
import { ReferenceForm } from "./reference-form";

const blank: ReferenceInput = {
  slug: "",
  name: "",
  website: "",
  sectorTr: "",
  sectorEn: "",
  sectorDe: "",
  sectorFr: "",
  sectorAr: "",
  descriptionTr: "",
  descriptionEn: "",
  descriptionDe: "",
  descriptionFr: "",
  descriptionAr: "",
  logoUrl: "",
  logoPublicId: "",
  gallery: [],
  order: 0,
  visible: true,
};

export default async function ReferenceEditPage({ params }: PageProps<"/admin/references/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !mongoose.isValidObjectId(id)) notFound();

  let initial = blank;
  if (!isNew) {
    await connectDb();
    const doc = await Reference.findById(id).lean();
    if (!doc) notFound();
    initial = {
      slug: doc.slug ?? "",
      name: doc.name,
      website: doc.website,
      sectorTr: doc.sector.tr,
      sectorEn: doc.sector.en,
      sectorDe: doc.sector.de ?? "",
      sectorFr: doc.sector.fr ?? "",
      sectorAr: doc.sector.ar ?? "",
      descriptionTr: doc.description.tr,
      descriptionEn: doc.description.en,
      descriptionDe: doc.description.de ?? "",
      descriptionFr: doc.description.fr ?? "",
      descriptionAr: doc.description.ar ?? "",
      logoUrl: doc.logoUrl,
      logoPublicId: doc.logoPublicId,
      gallery: (doc.gallery ?? []).map((image) => ({
        url: image.url,
        publicId: image.publicId,
        captionTr: image.caption.tr,
        captionEn: image.caption.en,
        descriptionTr: image.description.tr,
        descriptionEn: image.description.en,
      })),
      order: doc.order,
      visible: doc.visible,
    };
  }

  return (
    <>
      <Link href="/admin/references" className="mb-4 inline-block text-sm text-muted hover:text-foreground">← Tüm referanslar</Link>
      <AdminHeader title={isNew ? "Yeni referans" : initial.name} />
      <ReferenceForm id={isNew ? null : id} initial={initial} cloudinaryReady={isCloudinaryConfigured()} />
    </>
  );
}
