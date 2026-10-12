import { redirect } from "next/navigation";
import { BrandImage } from "@/components/brand-logo";
import { getAdminEmail } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getAdminEmail()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div className="flex justify-center">
          <BrandImage className="h-32 w-32" loading="eager" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-normal">Yönetim Paneli</h1>
        <p className="mb-6 mt-1 text-sm text-muted">Devam etmek için giriş yapın.</p>
        <LoginForm />
      </div>
    </main>
  );
}
