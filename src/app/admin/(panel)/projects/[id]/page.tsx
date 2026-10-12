import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { connectDb } from "@/lib/db";
import { Project } from "@/models/project";
import type { ProjectInput } from "../../actions";
import { ProjectForm } from "./project-form";

const blank: ProjectInput = {
  slug: "",
  titleTr: "",
  titleEn: "",
  titleDe: "",
  titleFr: "",
  titleAr: "",
  summaryTr: "",
  summaryEn: "",
  summaryDe: "",
  summaryFr: "",
  summaryAr: "",
  descriptionTr: "",
  descriptionEn: "",
  descriptionDe: "",
  descriptionFr: "",
  descriptionAr: "",
  categoryTr: "",
  categoryEn: "",
  categoryDe: "",
  categoryFr: "",
  categoryAr: "",
  client: "",
  year: String(new Date().getFullYear()),
  url: "",
  coverUrl: "",
  coverPublicId: "",
  coverFit: "cover",
  gallery: [],
  tags: "",
  order: 0,
  visible: true,
};

export default async function ProjectEditPage({ params }: PageProps<"/admin/projects/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !mongoose.isValidObjectId(id)) notFound();

  let initial = blank;
  if (!isNew) {
    await connectDb();
    const doc = await Project.findById(id).lean();
    if (!doc) notFound();
    initial = {
      slug: doc.slug,
      titleTr: doc.title.tr,
      titleEn: doc.title.en,
      titleDe: doc.title.de ?? "",
      titleFr: doc.title.fr ?? "",
      titleAr: doc.title.ar ?? "",
      summaryTr: doc.summary.tr,
      summaryEn: doc.summary.en,
      summaryDe: doc.summary.de ?? "",
      summaryFr: doc.summary.fr ?? "",
      summaryAr: doc.summary.ar ?? "",
      descriptionTr: doc.description.tr,
      descriptionEn: doc.description.en,
      descriptionDe: doc.description.de ?? "",
      descriptionFr: doc.description.fr ?? "",
      descriptionAr: doc.description.ar ?? "",
      categoryTr: doc.category.tr,
      categoryEn: doc.category.en,
      categoryDe: doc.category.de ?? "",
      categoryFr: doc.category.fr ?? "",
      categoryAr: doc.category.ar ?? "",
      client: doc.client,
      year: doc.year,
      url: doc.url,
      coverUrl: doc.coverUrl,
      coverPublicId: doc.coverPublicId,
      coverFit: doc.coverFit ?? "cover",
      gallery: doc.gallery.map((image) => ({ url: image.url, publicId: image.publicId })),
      tags: doc.tags.join(", "),
      order: doc.order,
      visible: doc.visible,
    };
  }

  return (
    <>
      <Link href="/admin/projects" className="mb-4 inline-block text-sm text-muted hover:text-foreground">← Tüm projeler</Link>
      <AdminHeader title={isNew ? "Yeni proje" : initial.titleTr} />
      <ProjectForm id={isNew ? null : id} initial={initial} cloudinaryReady={isCloudinaryConfigured()} />
    </>
  );
}
