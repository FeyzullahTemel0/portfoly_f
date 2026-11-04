import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { isStorageConfigured } from "@/lib/storage";
import { connectDb } from "@/lib/db";
import type { LocalizedText } from "@/lib/locales";
import { Reference } from "@/models/reference";
import type { LocalizedInput, ReferenceInput } from "../../actions";
import { ReferenceForm } from "./reference-form";

const empty = (): LocalizedInput => ({ tr: "", en: "", de: "", fr: "", ar: "" });
const toInput = (value: LocalizedText | undefined): LocalizedInput => ({
  tr: value?.tr ?? "",
  en: value?.en ?? "",
  de: value?.de ?? "",
  fr: value?.fr ?? "",
  ar: value?.ar ?? "",
});

const blank: ReferenceInput = {
  slug: "",
  name: "",
  website: "",
  tagline: empty(),
  sector: empty(),
  description: empty(),
  story: empty(),
  features: [],
  stats: [],
  tech: "",
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
      tagline: toInput(doc.tagline),
      sector: toInput(doc.sector),
      description: toInput(doc.description),
      story: toInput(doc.story),
      features: (doc.features ?? []).map((feature) => ({ title: toInput(feature.title), text: toInput(feature.text) })),
      stats: (doc.stats ?? []).map((stat) => ({ value: stat.value, label: toInput(stat.label) })),
      tech: (doc.tech ?? []).join(", "),
      logoUrl: doc.logoUrl,
      logoPublicId: doc.logoPublicId,
      gallery: (doc.gallery ?? []).map((image) => ({
        url: image.url,
        publicId: image.publicId,
        caption: toInput(image.caption),
        description: toInput(image.description),
      })),
      order: doc.order,
      visible: doc.visible,
    };
  }

  return (
    <>
      <Link href="/admin/references" className="mb-4 inline-block text-sm text-muted hover:text-foreground">← Tüm referanslar</Link>
      <AdminHeader title={isNew ? "Yeni referans" : initial.name} />
      <ReferenceForm id={isNew ? null : id} initial={initial} cloudinaryReady={isStorageConfigured()} />
    </>
  );
}
