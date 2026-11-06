import Image from "next/image";
import Link from "next/link";
import { AdminHeader, DbError } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Article } from "@/models/article";

export const dynamic = "force-dynamic";

export default async function ArticlesAdminPage() {
  await requireAdmin();
  let items: { id: string; slug: string; title: string; category: string; coverUrl: string; status: string; updatedAt: string }[] = [];
  let failed = false;
  try {
    await connectDb();
    const docs = await Article.find().sort({ updatedAt: -1 }).limit(200).lean();
    items = docs.map((doc) => ({ id: String(doc._id), slug: doc.slug, title: doc.title.tr || doc.title.en || doc.slug, category: doc.category.tr || doc.category.en || "", coverUrl: doc.coverUrl, status: doc.status, updatedAt: doc.updatedAt.toISOString() }));
  } catch (error) {
    console.error("Makaleler yüklenemedi:", error);
    failed = true;
  }
  const published = items.filter((item) => item.status === "published").length;

  return (
    <>
      <AdminHeader title="Önemli Bilgiler" text={`${published} yayında · ${items.length - published} taslak`}>
        <Link href="/admin/articles/new" className="button-primary inline-flex h-10 items-center rounded-lg px-5 text-sm font-semibold">Yeni makale</Link>
      </AdminHeader>
      {failed && <DbError />}
      {!failed && items.length === 0 && <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">Henüz makale yok. Yeni makale oluşturup taslak kaydedebilir veya yayımlayabilirsiniz.</p>}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/admin/articles/${item.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent sm:gap-4 sm:p-4">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-background sm:h-16 sm:w-24">
                {item.coverUrl && <Image src={item.coverUrl} alt="" fill sizes="96px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold sm:text-base">{item.title}</p>
                <p className="mt-1 truncate text-xs text-muted">{item.category} · Güncellendi {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(item.updatedAt))}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-xs ${item.status === "published" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>{item.status === "published" ? "Yayında" : "Taslak"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
