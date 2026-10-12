import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/page-header";
import { getDictionary } from "@/dictionaries";
import { formatDate, statusClasses, statusLabels } from "@/lib/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Quote, quoteStatuses } from "@/models/quote";
import { QuoteControls } from "./quote-controls";

export default async function QuoteDetailPage({ params }: PageProps<"/admin/quotes/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await connectDb();
  const quote = await Quote.findById(id).lean();
  if (!quote) notFound();

  const dict = await getDictionary("tr");
  const titles = Object.fromEntries(dict.services.items.map((s) => [s.slug, s.title]));

  const rows: [string, string][] = [
    ["Ad soyad", quote.name],
    ["E-posta", quote.email],
    ["Telefon", quote.phone || "-"],
    ["Hizmetler", quote.services.map((s) => titles[s] ?? s).join(", ")],
    ["İşin büyüklüğü", quote.size || "-"],
    ["Tarih", formatDate(quote.createdAt)],
    ["Dil", quote.lang === "en" ? "İngilizce" : "Türkçe"],
  ];

  return (
    <>
      <Link href="/admin/quotes" className="mb-4 inline-block text-sm text-muted hover:text-foreground">← Tüm teklifler</Link>
      <AdminHeader title={quote.name}>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClasses[quote.status]}`}>{statusLabels[quote.status]}</span>
      </AdminHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 rounded-xl border border-border bg-surface p-5 lg:col-span-2">
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-0.5 break-words font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="text-xs text-muted">Mesaj</p>
            <p className="mt-1 whitespace-pre-wrap leading-7">{quote.message || "-"}</p>
          </div>
          <a
            href={`mailto:${quote.email}`}
            className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            E-posta ile yanıtla
          </a>
        </section>

        <QuoteControls id={String(quote._id)} status={quote.status} note={quote.note} statuses={quoteStatuses} />
      </div>
    </>
  );
}
