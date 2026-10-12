import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/page-header";
import { getDictionary } from "@/dictionaries";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { getAboutPhoto } from "@/lib/about-photo";
import { adminSections, fieldLabels, isSectionKey, itemTemplates } from "@/lib/admin-config";
import { requireAdmin } from "@/lib/auth";
import type { Json } from "@/components/admin/json-editor";
import { ContentEditor } from "./editors";

export default async function ContentEditPage({ params }: PageProps<"/admin/content/[key]">) {
  await requireAdmin();
  const { key } = await params;
  if (!isSectionKey(key)) notFound();

  const [tr, en, profilePhoto] = await Promise.all([getDictionary("tr"), getDictionary("en"), getAboutPhoto()]);
  const section = adminSections.find((item) => item.key === key)!;
  const initial = {
    tr: (tr as unknown as Record<string, Json>)[key],
    en: (en as unknown as Record<string, Json>)[key],
  };

  return (
    <>
      <Link href="/admin/content" className="mb-4 inline-block text-sm text-muted hover:text-foreground">← Tüm bölümler</Link>
      <AdminHeader title={section.title} text={section.description} />
      <ContentEditor sectionKey={key} initial={initial} labels={fieldLabels} templates={itemTemplates as Record<string, Json>} profilePhoto={profilePhoto} cloudinaryReady={isCloudinaryConfigured()} />
    </>
  );
}
