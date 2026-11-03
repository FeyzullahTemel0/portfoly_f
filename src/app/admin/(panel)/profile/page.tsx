import { AdminHeader } from "@/components/admin/page-header";
import { getAdminProfile } from "@/lib/admin-account";
import { requireAdmin } from "@/lib/auth";
import { isStorageConfigured } from "@/lib/storage";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const email = await requireAdmin();
  const profile = await getAdminProfile();

  return (
    <>
      <AdminHeader title="Profil" text="Yönetici fotoğrafınızı, adınızı ve giriş bilgilerinizi buradan yönetin." />
      <ProfileForm profile={profile} email={email} ready={isStorageConfigured()} />
    </>
  );
}
