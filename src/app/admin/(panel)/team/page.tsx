import Image from "next/image";
import Link from "next/link";
import { AdminHeader, DbError } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { TeamMember } from "@/models/team-member";

export default async function TeamAdminPage() {
  await requireAdmin();

  let items: { id: string; name: string; role: string; photoUrl: string; order: number; visible: boolean }[] = [];
  let failed = false;
  try {
    await connectDb();
    const docs = await TeamMember.find().sort({ order: 1, createdAt: 1 }).lean();
    items = docs.map((doc) => ({
      id: String(doc._id),
      name: doc.name,
      role: doc.role.tr,
      photoUrl: doc.photoUrl,
      order: doc.order,
      visible: doc.visible,
    }));
  } catch {
    failed = true;
  }

  return (
    <>
      <AdminHeader title="Ekip" text="Ekip arkadaşlarınız. Sitedeki Hakkımızda altındaki Ekibimiz sayfasında görünür.">
        <Link href="/admin/team/new" className="inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground">
          Yeni ekip üyesi
        </Link>
      </AdminHeader>
      {failed && <DbError />}
      {!failed && items.length === 0 && <p className="text-sm text-muted">Henüz ekip üyesi eklenmedi.</p>}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link href={`/admin/team/${item.id}`} className="flex h-full items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background">
                {item.photoUrl ? (
                  <Image src={item.photoUrl} alt={item.name} width={56} height={56} className="h-14 w-14 object-cover" />
                ) : (
                  <span className="text-lg font-bold text-accent">{item.name.slice(0, 1).toLocaleUpperCase("tr")}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.name}</p>
                <p className="truncate text-xs text-muted">{item.role || "Unvan girilmemiş"} · Sıra {item.order}</p>
                {!item.visible && <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-500">Gizli</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
