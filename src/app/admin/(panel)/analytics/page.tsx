import { AdminHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { AccessEvent } from "@/models/access-event";
import { ClearAccessLogsButton } from "./clear-button";

const DAYS = 14;
const RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const eventLabels: Record<string, string> = {
  login_failed: "Başarısız admin girişi",
  login_rate_limited: "Giriş denemesi sınırlandı",
  login_success: "Admin girişi başarılı",
};
const deviceLabels: Record<string, string> = {
  mobile: "Mobil",
  tablet: "Tablet",
  desktop: "Masaüstü",
  unknown: "Bilinmiyor",
};
const browserLabels: Record<string, string> = {
  chrome: "Chrome",
  safari: "Safari",
  firefox: "Firefox",
  edge: "Edge",
  other: "Diğer",
};

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));
}

async function loadAnalytics() {
  const since = new Date(Date.now() - RETENTION_DAYS * DAY_MS);
  try {
    await connectDb();
    const match = { type: "page_view", createdAt: { $gte: since } };
    const [pageViews, visitorKeys, daily, topPages, devices, security] = await Promise.all([
      AccessEvent.countDocuments(match),
      AccessEvent.distinct("sourceKey", { ...match, sourceKey: { $ne: "" } }),
      AccessEvent.aggregate([
        { $match: { ...match, createdAt: { $gte: new Date(Date.now() - DAYS * DAY_MS) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      AccessEvent.aggregate([
        { $match: match },
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AccessEvent.aggregate([
        { $match: match },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AccessEvent.find({ type: { $ne: "page_view" }, createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    return {
      pageViews,
      uniqueVisitors: visitorKeys.length,
      daily: daily.map((row) => ({ date: row._id as string, count: row.count as number })),
      topPages: topPages.map((row) => ({ path: row._id as string, count: row.count as number })),
      devices: devices.map((row) => ({ device: String(row._id ?? "unknown"), count: row.count as number })),
      security: security.map((event) => ({
        id: String(event._id),
        type: event.type,
        path: event.path,
        source: event.sourceKey ? `…${event.sourceKey.slice(-6)}` : "belirsiz",
        device: deviceLabels[event.device] ?? "Bilinmiyor",
        browser: browserLabels[event.browser] ?? "Diğer",
        createdAt: event.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Analitik verisi yüklenemedi:", error);
    return null;
  }
}

function Stat({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value.toLocaleString("tr-TR")}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  await requireAdmin();
  const data = await loadAnalytics();
  const maxDaily = Math.max(1, ...(data?.daily.map((row) => row.count) ?? [0]));

  return (
    <>
      <AdminHeader title="Analitik & Güvenlik" text="Son 30 günlük sayfa görüntülemeleri ve admin giriş olayları.">
        <ClearAccessLogsButton />
      </AdminHeader>

      {!data ? (
        <div role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-500">
          Analitik verisi yüklenemedi. MongoDB Atlas bağlantısını kontrol edin.
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Sayfa görüntüleme" value={data.pageViews} detail="Son 30 gün" />
            <Stat label="Tahmini tekil ziyaretçi" value={data.uniqueVisitors} detail="Aylık takma adlı ağ özeti; kişi kimliği değil" />
            <Stat label="Güvenlik olayı" value={data.security.length} detail="Son 30 gün · en çok 100 kayıt gösterilir" />
            <Stat label="Kayıt saklama" value={RETENTION_DAYS} detail="gün; ardından otomatik silinir" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="font-semibold">Günlük görüntüleme</h2>
              <p className="mt-1 text-xs text-muted">Son {DAYS} gün · UTC tarihine göre</p>
              {data.daily.length === 0 ? (
                <p className="mt-6 text-sm text-muted">Henüz izin verilmiş analitik ziyareti yok.</p>
              ) : (
                <ul className="mt-5 space-y-2">
                  {data.daily.map((row) => (
                    <li key={row.date} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-xs">
                      <span className="text-muted">{row.date.slice(5)}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-background">
                        <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(3, row.count / maxDaily * 100)}%` }} />
                      </span>
                      <span className="text-right tabular-nums">{row.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-lg border border-border bg-surface p-5">
              <h2 className="font-semibold">En çok görüntülenen sayfalar</h2>
              {data.topPages.length === 0 ? (
                <p className="mt-6 text-sm text-muted">Henüz sayfa görüntüleme kaydı yok.</p>
              ) : (
                <ul className="mt-4 divide-y divide-border">
                  {data.topPages.map((row) => (
                    <li key={row.path} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                      <span className="truncate font-mono text-xs">{row.path}</span>
                      <span className="shrink-0 font-semibold tabular-nums">{row.count}</span>
                    </li>
                  ))}
                </ul>
              )}
              {data.devices.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted">Cihazlar</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {data.devices.map((row) => (
                      <li key={row.device} className="rounded-md border border-border bg-background px-2.5 py-1 text-xs">
                        {deviceLabels[row.device] ?? "Bilinmiyor"}: {row.count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-border bg-surface p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">Güvenlik olayları</h2>
              <p className="text-xs text-muted">Başarısız ve başarılı admin girişleri; ham IP tutulmaz.</p>
            </div>
            {data.security.length === 0 ? (
              <p className="mt-5 text-sm text-muted">Henüz güvenlik olayı kaydedilmedi.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-border text-xs text-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Zaman</th>
                      <th className="px-3 py-2 font-medium">Olay</th>
                      <th className="px-3 py-2 font-medium">Cihaz / tarayıcı</th>
                      <th className="px-3 py-2 font-medium">Takma adlı kaynak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.security.map((event) => (
                      <tr key={event.id} className="border-b border-border last:border-0">
                        <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">{formatDate(event.createdAt)}</td>
                        <td className="px-3 py-2.5">
                          <span className={event.type === "login_failed" || event.type === "login_rate_limited" ? "font-medium text-amber-600 dark:text-amber-400" : "font-medium"}>
                            {eventLabels[event.type] ?? event.type}
                          </span>
                          <span className="block text-xs text-muted">{event.path}</span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted">{event.device} · {event.browser}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-muted">{event.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p className="mt-5 max-w-4xl text-xs leading-5 text-muted">
            Ziyaret analitiği yalnızca ziyaretçi izin verirse kaydedilir. Kaynak anahtarı IP&apos;den aylık HMAC ile üretilen takma adlı bir değerdir; ham IP, tam tarayıcı bilgisi, isim, form içeriği ve URL sorgu parametreleri saklanmaz. Ağ paylaşımı veya VPN nedeniyle ziyaretçi sayısı tahminidir. Güvenlik kayıtları da en geç 30 gün içinde otomatik silinir.
          </p>
        </>
      )}
    </>
  );
}
