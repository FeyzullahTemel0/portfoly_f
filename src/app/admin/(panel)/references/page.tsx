import Image from "next/image";
import Link from "next/link";
import { AdminHeader, DbError } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Reference } from "@/models/reference";

export default async function ReferencesAdminPage() {
  await requireAdmin();

  let items: { id: string; name: string; sector: string; logoUrl: string; order: number; visible: boolean }[] = [];
  let failed = false;
  try {
    await connectDb();
    const docs = await Reference.find().sort({ order: 1, createdAt: -1 }).lean();
    items = docs.map((doc) => ({
      id: String(doc._id),
      name: doc.name,
      sector: doc.sector.tr,
      logoUrl: doc.logoUrl,
      order: doc.order,
      visible: doc.visible,
    }));
  } catch {
    failed = true;
  }

  return (
    <>
      <AdminHeader title="Referanslar" text="Birlikte çalıştığınız firmalar. Sitedeki Referanslar sayfasında ve ana sayfada görünür.">
        <Link href="/admin/references/new" className="inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground">
          Yeni referans
        </Link>
      </AdminHeader>
      {failed && <DbError />}
      {!failed && items.length === 0 && <p className="text-sm text-muted">Henüz referans eklenmedi.</p>}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/admin/references/${item.id}`} className="flex h-full items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
              <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-background">
                {item.logoUrl ? (
                  <Image src={item.logoUrl} alt={item.name} width={80} height={56} className="h-12 w-auto max-w-full object-contain" />
                ) : (
                  <span className="text-lg font-bold text-accent">{item.name.slice(0, 2).toLocaleUpperCase("tr")}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="truncate text-xs text-muted">{item.sector || "Sektör girilmemiş"} · Sıra {item.order}</p>
                {!item.visible && <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-500">Gizli</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
