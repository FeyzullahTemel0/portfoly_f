import { AdminHeader } from "@/components/admin/page-header";
import type { Json } from "@/components/admin/json-editor";
import { getSettings } from "@/dictionaries";
import { fieldLabels, itemTemplates } from "@/lib/admin-config";
import { requireAdmin } from "@/lib/auth";
import { SettingsEditor } from "../content/[key]/editors";

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <>
      <AdminHeader title="Ayarlar" text="İletişim ve sosyal medya bilgileri. KVKK sayfası için tam ticari unvanı, yasal adresi ve başvuru e-postasını yayından önce doğrulayın. Boş alanlar sitede gösterilmez." />
      <SettingsEditor initial={settings as unknown as Json} labels={fieldLabels} templates={itemTemplates as Record<string, Json>} />
    </>
  );
}
