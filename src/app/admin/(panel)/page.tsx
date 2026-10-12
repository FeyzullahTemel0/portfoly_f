import Link from "next/link";
import { AdminHeader, DbError } from "@/components/admin/page-header";
import { getDictionary } from "@/dictionaries";
import { adminSections } from "@/lib/admin-config";
import { formatDate, statusClasses, statusLabels } from "@/lib/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Message } from "@/models/message";
import { Quote } from "@/models/quote";

async function loadStats() {
  try {
    await connectDb();
    const [newQuotes, totalQuotes, unreadMessages, totalMessages, recent] = await Promise.all([
      Quote.countDocuments({ status: "new" }),
      Quote.countDocuments(),
      Message.countDocuments({ read: false }),
      Message.countDocuments(),
      Quote.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    return {
      newQuotes,
      totalQuotes,
      unreadMessages,
      totalMessages,
      recent: recent.map((q) => ({
        id: String(q._id),
        name: q.name,
        status: q.status,
        services: q.services,
        createdAt: q.createdAt.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  await requireAdmin();
  const [stats, dict] = await Promise.all([loadStats(), getDictionary("tr")]);
  const titles = Object.fromEntries(dict.services.items.map((s) => [s.slug, s.title]));

  const cards = stats
    ? [
        { label: "Yeni teklif", value: stats.newQuotes, href: "/admin/quotes?status=new" },
        { label: "Toplam teklif", value: stats.totalQuotes, href: "/admin/quotes" },
        { label: "Okunmamış mesaj", value: stats.unreadMessages, href: "/admin/messages" },
        { label: "Toplam mesaj", value: stats.totalMessages, href: "/admin/messages" },
      ]
    : [];

  return (
    <>
      <AdminHeader title="Panel" text="Siteye gelen taleplerin ve içeriğin özeti." />
      {!stats && <DbError />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent">
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-border bg-surface p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Son teklif talepleri</h2>
            <Link href="/admin/quotes" className="text-sm font-medium text-accent hover:underline">Tümü</Link>
          </div>
          {stats && stats.recent.length === 0 && <p className="text-sm text-muted">Henüz talep yok.</p>}
          <ul className="divide-y divide-border">
            {stats?.recent.map((quote) => (
              <li key={quote.id}>
                <Link href={`/admin/quotes/${quote.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-accent">
                  <span>
                    <span className="font-medium">{quote.name}</span>
                    <span className="block text-xs text-muted">
                      {quote.services.map((s) => titles[s] ?? s).join(", ")} · {formatDate(quote.createdAt)}
                    </span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[quote.status]}`}>
                    {statusLabels[quote.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-semibold">Hızlı düzenleme</h2>
          <ul className="space-y-1">
            {adminSections.slice(0, 7).map((section) => (
              <li key={section.key}>
                <Link href={`/admin/content/${section.key}`} className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-background hover:text-accent">
                  {section.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
