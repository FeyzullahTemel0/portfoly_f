import Image from "next/image";
import Link from "next/link";
import { AdminHeader, DbError } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Project } from "@/models/project";

export default async function ProjectsAdminPage() {
  await requireAdmin();

  let items: { id: string; title: string; category: string; coverUrl: string; order: number; visible: boolean; images: number }[] = [];
  let failed = false;
  try {
    await connectDb();
    const docs = await Project.find().sort({ order: 1, createdAt: -1 }).lean();
    items = docs.map((doc) => ({
      id: String(doc._id),
      title: doc.title.tr,
      category: doc.category.tr,
      coverUrl: doc.coverUrl,
      order: doc.order,
      visible: doc.visible,
      images: doc.gallery.length,
    }));
  } catch {
    failed = true;
  }

  return (
    <>
      <AdminHeader title="Projeler" text="Yayınladığınız projeler. Sitedeki Projeler sayfasında kare kartlar olarak görünür.">
        <Link href="/admin/projects/new" className="inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground">
          Yeni proje
        </Link>
      </AdminHeader>
      {failed && <DbError />}
      {!failed && items.length === 0 && <p className="text-sm text-muted">Henüz proje eklenmedi.</p>}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/admin/projects/${item.id}`} className="flex h-full items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-background">
                {item.coverUrl ? (
                  <Image src={item.coverUrl} alt={item.title} fill sizes="64px" className="object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-lg font-bold text-accent">{item.title.slice(0, 1).toLocaleUpperCase("tr")}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.title}</p>
                <p className="truncate text-xs text-muted">{item.category || "Kategori yok"} · {item.images} görsel · Sıra {item.order}</p>
                {!item.visible && <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-500">Gizli</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
