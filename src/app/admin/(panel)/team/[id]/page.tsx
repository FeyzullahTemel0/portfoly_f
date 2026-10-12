import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { connectDb } from "@/lib/db";
import { TeamMember } from "@/models/team-member";
import type { TeamMemberInput } from "../../actions";
import { TeamForm } from "./team-form";

const blank: TeamMemberInput = {
  name: "",
  roleTr: "",
  roleEn: "",
  roleDe: "",
  roleFr: "",
  roleAr: "",
  bioTr: "",
  bioEn: "",
  bioDe: "",
  bioFr: "",
  bioAr: "",
  photoUrl: "",
  photoPublicId: "",
  linkedin: "",
  instagram: "",
  x: "",
  order: 0,
  visible: true,
};

export default async function TeamEditPage({ params }: PageProps<"/admin/team/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !mongoose.isValidObjectId(id)) notFound();

  let initial = blank;
  if (!isNew) {
    await connectDb();
    const doc = await TeamMember.findById(id).lean();
    if (!doc) notFound();
    initial = {
      name: doc.name,
      roleTr: doc.role.tr,
      roleEn: doc.role.en,
      roleDe: doc.role.de ?? "",
      roleFr: doc.role.fr ?? "",
      roleAr: doc.role.ar ?? "",
      bioTr: doc.bio.tr,
      bioEn: doc.bio.en,
      bioDe: doc.bio.de ?? "",
      bioFr: doc.bio.fr ?? "",
      bioAr: doc.bio.ar ?? "",
      photoUrl: doc.photoUrl,
      photoPublicId: doc.photoPublicId,
      linkedin: doc.linkedin,
      instagram: doc.instagram,
      x: doc.x,
      order: doc.order,
      visible: doc.visible,
    };
  }

  return (
    <>
      <Link href="/admin/team" className="mb-4 inline-block text-sm text-muted hover:text-foreground">← Tüm ekip üyeleri</Link>
      <AdminHeader title={isNew ? "Yeni ekip üyesi" : initial.name} />
      <TeamForm id={isNew ? null : id} initial={initial} cloudinaryReady={isCloudinaryConfigured()} />
    </>
  );
}
