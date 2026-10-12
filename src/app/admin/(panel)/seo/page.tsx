import { AdminHeader } from "@/components/admin/page-header";
import { SeoEditor } from "@/app/admin/(panel)/seo/seo-editor";
import { getSettings } from "@/dictionaries";
import { requireAdmin } from "@/lib/auth";
import { isCloudinaryConfigured } from "@/lib/cloudinary";

export default async function SeoPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <>
      <AdminHeader title="SEO" text="Sitenin Google ve sosyal ağlardaki teknik görünümünü yönetin. Reklam satın almaz; indeksleme altyapısını hazırlar." />
      <SeoEditor initial={settings.seo} cloudinaryReady={isCloudinaryConfigured()} />
    </>
  );
}
