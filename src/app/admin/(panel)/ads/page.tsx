import Image from "next/image";
import Link from "next/link";
import { AdminHeader, DbError } from "@/components/admin/page-header";
import { placementLabel, relatedAdPlacements } from "@/lib/ads";
import { formatDate } from "@/lib/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Ad, adStatus, type AdStatus } from "@/models/ad";
import { AdRowActions, SlotOverview } from "./ads-client";

const statusMeta: Record<AdStatus, { label: string; className: string }> = {
  live: { label: "Yayında", className: "bg-emerald-500/15 text-emerald-600" },
  scheduled: { label: "Planlandı", className: "bg-accent/15 text-accent" },
  paused: { label: "Durduruldu", className: "bg-foreground/10 text-muted" },
  expired: { label: "Süresi doldu", className: "bg-amber-500/15 text-amber-600" },
};
const filters: { key: "all" | AdStatus; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "live", label: "Yayında" },
  { key: "scheduled", label: "Planlandı" },
  { key: "paused", label: "Durduruldu" },
  { key: "expired", label: "Süresi doldu" },
];

export default async function AdsAdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status: requested } = await searchParams;
  const filter = filters.some((item) => item.key === requested) ? (requested as "all" | AdStatus) : "all";

  let ads: Awaited<ReturnType<typeof loadAds>> = [];
  let failed = false;
  try {
    ads = await loadAds();
  } catch {
    failed = true;
  }

  const withStatus = ads.map((ad) => ({ ...ad, state: adStatus(ad) }));
  const counts: Record<string, number> = { all: withStatus.length };
  for (const ad of withStatus) counts[ad.state] = (counts[ad.state] ?? 0) + 1;
  const occupancy: Record<string, number> = {};
  for (const ad of withStatus) {
    if (ad.state !== "live" && ad.state !== "scheduled") continue;
    for (const placement of ad.placements) {
      for (const related of relatedAdPlacements(placement)) occupancy[related] = (occupancy[related] ?? 0) + 1;
    }
  }
  const visible = filter === "all" ? withStatus : withStatus.filter((ad) => ad.state === filter);

  return (
    <>
      <AdminHeader title="Reklamlar" text="Firmaların reklamlarını sayfa ve konum seçerek yayınlayın. Gösterim ve tıklamalar otomatik sayılır.">
        <Link href="/admin/ads/new" className="button-primary inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold">+ Yeni reklam</Link>
      </AdminHeader>
      {failed && <DbError />}

      <section className="mb-8 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-bold">Sitedeki reklam konumları</h2>
        <div className="mt-4"><SlotOverview occupancy={occupancy} /></div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-bold">Tüm reklamlar <span className="text-sm font-normal text-muted">{withStatus.length}</span></h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <Link key={item.key} href={item.key === "all" ? "/admin/ads" : `/admin/ads?status=${item.key}`} className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${filter === item.key ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-accent"}`}>
              {item.label} <span className="text-xs opacity-70">{counts[item.key] ?? 0}</span>
            </Link>
          ))}
        </div>

        {visible.length === 0 && <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">Bu filtrede reklam yok.</p>}
        <ul className="mt-5 divide-y divide-border">
          {visible.map((ad) => (
            <li key={ad.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-[#0a2a8f] to-[#00a3d9]">
                {ad.imageUrl ? <Image src={ad.imageUrl} alt={ad.advertiser} fill sizes="112px" unoptimized className="object-cover" /> : <span className="flex h-full items-center justify-center px-2 text-center text-[10px] font-bold text-white">{ad.title}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {ad.advertiser}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusMeta[ad.state].className}`}>{statusMeta[ad.state].label}</span>
                </p>
                <p className="truncate text-sm text-muted">{ad.title || (ad.imageUrl ? "Görsel banner" : "—")}</p>
                <p className="mt-1.5 flex flex-wrap gap-1.5">
                  {ad.placements.map((placement) => <span key={placement} className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted ring-1 ring-border">{placementLabel(placement)}</span>)}
                </p>
                <p className="mt-1.5 text-xs text-muted">
                  {ad.startsAt ? formatDate(ad.startsAt) : "Hemen"} → {ad.endsAt ? formatDate(ad.endsAt) : "Süresiz"} · Öncelik {ad.priority} · {ad.impressions} gösterim · {ad.clicks} tıklama
                </p>
              </div>
              <AdRowActions id={ad.id} active={ad.active} editable={ad.state !== "expired"} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

async function loadAds() {
  await connectDb();
  const docs = await Ad.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => ({
    id: String(doc._id),
    advertiser: doc.advertiser,
    title: doc.title,
    placements: doc.placements,
    imageUrl: doc.imageUrl,
    active: doc.active,
    startsAt: doc.startsAt,
    endsAt: doc.endsAt,
    priority: doc.priority,
    impressions: doc.impressions,
    clicks: doc.clicks,
  }));
}
