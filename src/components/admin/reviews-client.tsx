"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { FiCheck, FiCopy, FiLink, FiStar, FiTrash2, FiX } from "react-icons/fi";
import { createReviewLink, deleteCustomerReview, revokeReviewLink, setReviewStatus } from "@/app/admin/(panel)/actions";

type ReviewRow = { id: string; businessName: string; logoUrl: string; text: string; rating: number; status: "pending" | "approved" | "rejected"; createdAt: string };
type LinkRow = { id: string; createdAt: string; expiresAt: string; usedAt: string | null; revokedAt: string | null };

const filters = [
  { id: "pending", label: "Onay bekleyen" },
  { id: "approved", label: "Yayında" },
  { id: "rejected", label: "Reddedilen" },
  { id: "all", label: "Tümü" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function ReviewsClient({ initialReviews, initialLinks }: { initialReviews: ReviewRow[]; initialLinks: LinkRow[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [links, setLinks] = useState(initialLinks);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("pending");
  const [shareUrl, setShareUrl] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const visible = useMemo(() => (filter === "all" ? reviews : reviews.filter((item) => item.status === filter)), [filter, reviews]);
  const pendingCount = reviews.filter((item) => item.status === "pending").length;

  function generateLink() {
    startTransition(async () => {
      const result = await createReviewLink();
      if (!result.ok) {
        setNotice(result.error);
        return;
      }
      const url = `${window.location.origin}/tr/review/${result.token}`;
      setShareUrl(url);
      setNotice("Bağlantı 30 gün geçerli ve tek yorum için kullanılabilir.");
      setLinks((current) => [{ id: result.id, createdAt: new Date().toISOString(), expiresAt: result.expiresAt, usedAt: null, revokedAt: null }, ...current]);
    });
  }

  function copyLink() {
    if (!shareUrl) return;
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setNotice("Bağlantı kopyalandı.");
      } catch {
        setNotice("Bağlantıyı seçip kopyalayın.");
      }
    });
  }

  function changeStatus(id: string, status: "approved" | "rejected") {
    startTransition(async () => {
      const result = await setReviewStatus(id, status);
      if (!result.ok) return setNotice(result.error || "Yorum güncellenemedi.");
      setReviews((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      setNotice(status === "approved" ? "Yorum ana sayfada yayımlandı." : "Yorum reddedildi.");
    });
  }

  function removeReview(id: string) {
    if (!window.confirm("Bu yorum ve logosu kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteCustomerReview(id);
      if (!result.ok) return setNotice(result.error || "Yorum silinemedi.");
      setReviews((current) => current.filter((item) => item.id !== id));
      setNotice("Yorum silindi.");
    });
  }

  function revokeLink(id: string) {
    startTransition(async () => {
      const result = await revokeReviewLink(id);
      if (!result.ok) return setNotice(result.error || "Bağlantı iptal edilemedi.");
      setLinks((current) => current.map((item) => item.id === id ? { ...item, revokedAt: new Date().toISOString() } : item));
      setNotice("Bağlantı iptal edildi.");
    });
  }

  function linkStatus(item: LinkRow) {
    if (item.revokedAt) return "İptal edildi";
    if (item.usedAt) return "Kullanıldı";
    if (new Date(item.expiresAt) <= new Date()) return "Süresi doldu";
    return "Kullanılabilir";
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Yorum bağlantısı</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">İşletmeye özel, 30 gün geçerli ve tek kullanımlık bir form bağlantısı oluşturun.</p>
          </div>
          <button type="button" onClick={generateLink} disabled={pending} className="button-primary inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-bold disabled:opacity-60">
            <FiLink className="h-4 w-4" aria-hidden="true" />
            {pending ? "Oluşturuluyor..." : "Yorum bağlantısı oluştur"}
          </button>
        </div>
        {shareUrl && (
          <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input aria-label="Yorum bağlantısı" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} className="min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button type="button" onClick={copyLink} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold hover:border-accent">
              <FiCopy className="h-4 w-4" aria-hidden="true" /> Kopyala
            </button>
          </div>
        )}
        {notice && <p role="status" className="mt-3 text-sm text-muted">{notice}</p>}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Müşteri yorumları <span className="text-sm font-medium text-muted">{reviews.length}</span></h2>
            <p className="mt-1 text-sm text-muted">{pendingCount} yorum onay bekliyor</p>
          </div>
          <div role="tablist" aria-label="Yorum filtresi" className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
            {filters.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={filter === item.id} onClick={() => setFilter(item.id)} className={`shrink-0 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${filter === item.id ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}>
                {item.label}{item.id === "pending" ? ` ${pendingCount}` : ""}
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">Bu filtrede yorum yok.</p> : (
          <ul className="space-y-3">
            {visible.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="relative flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-2 ring-1 ring-black/5">
                    <Image src={item.logoUrl} alt={item.businessName} fill sizes="80px" className="object-contain p-2" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{item.businessName}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : item.status === "rejected" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-600"}`}>
                        {item.status === "approved" ? "Yayında" : item.status === "rejected" ? "Reddedildi" : "Onay bekliyor"}
                      </span>
                    </div>
                    <span className="mt-1 flex items-center gap-0.5 text-amber-400" aria-label={`${item.rating} / 5`}>
                      {Array.from({ length: 5 }, (_, star) => <FiStar key={star} className={`h-3.5 w-3.5 ${star < item.rating ? "fill-current" : "opacity-30"}`} aria-hidden="true" />)}
                    </span>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{item.text}</p>
                    <p className="mt-2 text-xs text-muted">{formatDate(item.createdAt)}</p>
                  </div>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    {item.status !== "approved" && <button type="button" onClick={() => changeStatus(item.id, "approved")} disabled={pending} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white disabled:opacity-50"><FiCheck aria-hidden="true" /> Onayla</button>}
                    {item.status !== "rejected" && <button type="button" onClick={() => changeStatus(item.id, "rejected")} disabled={pending} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-muted hover:text-red-500 disabled:opacity-50"><FiX aria-hidden="true" /> Reddet</button>}
                    <button type="button" onClick={() => removeReview(item.id)} disabled={pending} aria-label={`${item.businessName} yorumunu sil`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-red-500 hover:border-red-500 disabled:opacity-50"><FiTrash2 aria-hidden="true" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Oluşturulan bağlantılar</h2>
        {links.length === 0 ? <p className="text-sm text-muted">Henüz bağlantı oluşturulmadı.</p> : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface px-4">
            {links.map((item) => {
              const status = linkStatus(item);
              return (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span>
                    <span className="block text-sm font-medium">{formatDate(item.createdAt)}</span>
                    <span className="text-xs text-muted">Son kullanım: {formatDate(item.expiresAt)} · {status}</span>
                  </span>
                  {status === "Kullanılabilir" && <button type="button" onClick={() => revokeLink(item.id)} disabled={pending} className="text-xs font-semibold text-red-500 hover:underline">İptal et</button>}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
