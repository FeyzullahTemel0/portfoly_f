import Link from "next/link";
import { AdminHeader, DbError } from "@/components/admin/page-header";
import { getDictionary } from "@/dictionaries";
import { formatDate, statusClasses, statusLabels } from "@/lib/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Quote, quoteStatuses } from "@/models/quote";

export default async function QuotesPage({ searchParams }: PageProps<"/admin/quotes">) {
  await requireAdmin();
  const query = await searchParams;
  const requested = Array.isArray(query.status) ? query.status[0] : query.status;
  const status = (quoteStatuses as readonly string[]).includes(requested ?? "") ? requested : undefined;

  const dict = await getDictionary("tr");
  const titles = Object.fromEntries(dict.services.items.map((s) => [s.slug, s.title]));

  let quotes: { id: string; name: string; email: string; services: string[]; size: string; status: string; createdAt: string }[] = [];
  let failed = false;
  try {
    await connectDb();
    const docs = await Quote.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(200).lean();
    quotes = docs.map((q) => ({
      id: String(q._id),
      name: q.name,
      email: q.email,
      services: q.services,
      size: q.size,
      status: q.status,
      createdAt: q.createdAt.toISOString(),
    }));
  } catch {
    failed = true;
  }

  const filters = [{ value: undefined, label: "Tümü" }, ...quoteStatuses.map((value) => ({ value, label: statusLabels[value] }))];

  return (
    <>
      <AdminHeader title="Teklifler" text="Teklif formundan gelen talepler." />
      {failed && <DbError />}

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.label}
            href={filter.value ? `/admin/quotes?status=${filter.value}` : "/admin/quotes"}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              status === filter.value ? "border-accent bg-accent/15 text-accent" : "border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Hizmetler</th>
              <th className="px-4 py-3 font-medium">Büyüklük</th>
              <th className="px-4 py-3 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">Kayıt yok.</td></tr>
            )}
            {quotes.map((quote) => (
              <tr key={quote.id} className="border-t border-border hover:bg-background/50">
                <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(quote.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/quotes/${quote.id}`} className="font-medium hover:text-accent">{quote.name}</Link>
                  <span className="block text-xs text-muted">{quote.email}</span>
                </td>
                <td className="px-4 py-3 text-muted">{quote.services.map((s) => titles[s] ?? s).join(", ")}</td>
                <td className="px-4 py-3 text-muted">{quote.size || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[quote.status]}`}>{statusLabels[quote.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
