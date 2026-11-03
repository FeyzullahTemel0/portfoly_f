import Image from "next/image";
import Link from "next/link";
import { AdminHeader, DbError } from "@/components/admin/page-header";
import { AD_PAGES, AD_POSITIONS, isAdPosition } from "@/lib/ads";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { formatDate } from "@/lib/admin-ui";
import { Ad } from "@/models/ad";
import { AdActiveToggle } from "./ad-active-toggle";

export default async function AdsAdminPage() {
  await requireAdmin();
  let items: { id: string; advertiser: string; position: string; pages: string[]; imageUrl: string; active: boolean; impressions: number; clicks: number; endsAt: Date | null; startsAt: Date | null }[] = [];
  let failed = false;
  try {
    await connectDb();
    const docs = await Ad.find().sort({ active: -1, createdAt: -1 }).lean();
    items = docs.map((doc) => ({ id: String(doc._id), advertiser: doc.advertiser, position: doc.position, pages: doc.pages, imageUrl: doc.imageUrl, active: doc.active, impressions: doc.impressions, clicks: doc.clicks, endsAt: doc.endsAt, startsAt: doc.startsAt }));
  } catch {
    failed = true;
  }
  const now = Date.now();
  const pageLabel = (keys: string[]) => keys.map((key) => AD_PAGES.find((page) => page.key === key)?.label ?? key).join(", ");

  return (
    <>
      <AdminHeader title="Reklamlar" text="Firmaların reklam görsellerini sayfa ve konum seçerek yayınlayın. Gösterim ve tıklama sayıları otomatik izlenir.">
        <Link href="/admin/ads/new" className="button-primary inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold">Yeni reklam</Link>
      </AdminHeader>
      {failed && <DbError />}

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Object.entries(AD_POSITIONS).map(([key, spec]) => (
          <div key={key} className="rounded-xl border border-border bg-surface p-3">
            <p className="text-xs font-semibold">{spec.label}</p>
            <p className="mt-1 text-lg font-bold text-accent">{spec.desktop[0]}×{spec.desktop[1]}</p>
            <p className="text-xs text-muted">Mobil {spec.mobile[0]}×{spec.mobile[1]}</p>
          </div>
        ))}
      </section>

      {!failed && items.length === 0 && <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">Henüz reklam eklenmedi.</p>}

      <ul className="space-y-3">
        {items.map((item) => {
          const expired = item.endsAt && item.endsAt.getTime() < now;
          const upcoming = item.startsAt && item.startsAt.getTime() > now;
          return (
            <li key={item.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface p-4">
              <div className="relative h-14 w-28 shrink-0 overflow-hidden rounded-lg bg-background">
                {item.imageUrl && <Image src={item.imageUrl} alt={item.advertiser} fill sizes="112px" unoptimized className="object-cover" />}
              </div>
              <Link href={`/admin/ads/${item.id}`} className="min-w-0 flex-1 hover:text-accent">
                <p className="truncate font-semibold">{item.advertiser}</p>
                <p className="truncate text-xs text-muted">
                  {isAdPosition(item.position) ? AD_POSITIONS[item.position].label : item.position} · {pageLabel(item.pages)}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {item.startsAt ? `Başlangıç ${formatDate(item.startsAt)}` : "Hemen başlar"} · {item.endsAt ? `Bitiş ${formatDate(item.endsAt)}` : "Süresiz"}
                  {expired && <span className="ml-2 font-semibold text-amber-500">Süresi doldu</span>}
                  {upcoming && <span className="ml-2 font-semibold text-accent">Planlandı</span>}
                </p>
              </Link>
              <dl className="flex gap-5 text-center text-xs">
                <div><dt className="text-muted">Gösterim</dt><dd className="text-base font-bold">{item.impressions}</dd></div>
                <div><dt className="text-muted">Tıklama</dt><dd className="text-base font-bold">{item.clicks}</dd></div>
                <div><dt className="text-muted">CTR</dt><dd className="text-base font-bold">{item.impressions ? `${((item.clicks / item.impressions) * 100).toFixed(1)}%` : "—"}</dd></div>
              </dl>
              <AdActiveToggle id={item.id} active={item.active} />
            </li>
          );
        })}
      </ul>
    </>
  );
}
