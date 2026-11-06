import Link from "next/link";
import { AdminHeader, DbError } from "@/components/admin/page-header";
import { ServiceIcon } from "@/components/home/icons";
import { requireAdmin } from "@/lib/auth";
import { formatMoney } from "@/lib/currency";
import { connectDb } from "@/lib/db";
import { locales } from "@/lib/locales";
import { Service } from "@/models/service";
import { ImportDefaults } from "./import-defaults";

export default async function ServicesAdminPage() {
  await requireAdmin();
  let items: { id: string; slug: string; icon: string; title: string; category: string; order: number; visible: boolean; mode: string; amount: number; currency: string; translated: number }[] = [];
  let failed = false;
  try {
    await connectDb();
    const docs = await Service.find().sort({ order: 1, createdAt: 1 }).lean();
    items = docs.map((doc) => {
      const content = (doc.content ?? {}) as Record<string, { title?: string }>;
      return {
        id: String(doc._id),
        slug: doc.slug,
        icon: doc.icon || doc.slug,
        title: content.tr?.title || doc.slug,
        category: doc.catalogCategory || "web",
        order: doc.order,
        visible: doc.visible,
        mode: doc.priceMode,
        amount: doc.priceAmount,
        currency: doc.priceCurrency,
        translated: locales.filter((locale) => content[locale]?.title).length,
      };
    });
  } catch {
    failed = true;
  }

  return (
    <>
      <AdminHeader title="Hizmetler" text="Sitede görünen hizmetleri, fiyatlarını ve çevirilerini buradan yönetin.">
        <Link href="/admin/services/new" className="button-primary inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold">Yeni hizmet</Link>
      </AdminHeader>
      {failed && <DbError />}
      <div className="mb-6"><ImportDefaults /></div>
      {!failed && items.length === 0 && <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">Henüz hizmet yok. Hazır hizmetleri içe aktarabilir veya yenisini ekleyebilirsiniz.</p>}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/admin/services/${item.id}`} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-accent-foreground"><ServiceIcon slug={item.icon} className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.title}</p>
                <p className="truncate text-xs text-muted">/{item.slug} · {item.category === "ecommerce" ? "E-Ticaret" : item.category === "automation" ? "Otomasyon" : "Web Çözümleri"} · Sıra {item.order} · {item.translated}/5 dil</p>
              </div>
              <div className="text-right text-sm">
                {item.mode === "quote" ? <span className="text-muted">Teklife göre</span> : <span className="font-semibold">{item.mode === "from" ? "Başlangıç " : ""}{formatMoney(item.amount, item.currency, "tr")}</span>}
                {!item.visible && <span className="mt-1 block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-500">Gizli</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
