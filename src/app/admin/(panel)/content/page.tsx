import Link from "next/link";
import { AdminHeader } from "@/components/admin/page-header";
import { adminSections } from "@/lib/admin-config";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Content } from "@/models/content";

async function loadCustomized() {
  try {
    await connectDb();
    const docs = await Content.find({ scope: { $in: ["tr", "en"] } }, { key: 1 }).lean();
    return new Set(docs.map((doc) => doc.key));
  } catch {
    return new Set<string>();
  }
}

export default async function ContentIndexPage() {
  await requireAdmin();
  const customized = await loadCustomized();

  return (
    <>
      <AdminHeader title="Site İçeriği" text="Sitedeki tüm metinleri buradan düzenleyebilirsiniz. Bir bölüm seçin." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminSections.map((section) => (
          <Link
            key={section.key}
            href={`/admin/content/${section.key}`}
            className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{section.title}</h2>
              {customized.has(section.key) && (
                <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">Düzenlendi</span>
              )}
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">{section.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
