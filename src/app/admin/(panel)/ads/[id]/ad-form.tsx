"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { FiImage, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { AdSlotMap } from "@/components/admin/ad-slot-map";
import { uploadImage } from "@/components/admin/upload";
import { AdCardContent } from "@/components/ad-card";
import { AD_SLOTS, isAdSlot, placementLabel, recommendedSize, type AdSlotKey } from "@/lib/ads";
import { deleteAd, saveAd, type AdInput } from "../../ads-actions";

type Props = { id: string | null; initial: AdInput; occupancy: Record<string, number>; ready: boolean; stats?: { impressions: number; clicks: number } };

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";
const card = "rounded-2xl border border-border bg-surface p-5 sm:p-6";

function Step({ n, title, text }: { n: number; title: string; text?: string }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-accent-foreground">{n}</span>
      <div>
        <h2 className="font-bold">{title}</h2>
        {text && <p className="text-xs text-muted">{text}</p>}
      </div>
    </div>
  );
}

export function AdForm({ id, initial, occupancy, ready, stats }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [lastSlot, setLastSlot] = useState<AdSlotKey | null>(() => {
    const first = initial.placements[0]?.split(":")[1];
    return first && isAdSlot(first) ? first : null;
  });
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof AdInput>(key: K, value: AdInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  };

  function pick(placement: string) {
    const slot = placement.split(":")[1];
    if (isAdSlot(slot)) setLastSlot(slot);
    set("placements", form.placements.includes(placement) ? form.placements.filter((item) => item !== placement) : [...form.placements, placement]);
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const result = await uploadImage(file, "rovax/ads");
      setForm((current) => ({ ...current, imageUrl: result.url, imagePublicId: result.publicId, imageWidth: bitmap.width, imageHeight: bitmap.height }));
      setStatus({ ok: true, text: "Görsel yüklendi. Kaydet'e basın." });
    } catch (error) {
      setStatus({ ok: false, text: error instanceof Error ? error.message : "Yükleme başarısız." });
    } finally {
      setBusy(false);
    }
  }

  function save() {
    startTransition(async () => {
      const result = await saveAd(id, form);
      if (result.ok) {
        router.push("/admin/ads");
        router.refresh();
      } else setStatus({ ok: false, text: result.error ?? "Kaydedilemedi." });
    });
  }

  function remove() {
    if (!id || !window.confirm("Bu reklam ve görseli kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteAd(id);
      if (result.ok) {
        router.push("/admin/ads");
        router.refresh();
      } else setStatus({ ok: false, text: result.error ?? "Silinemedi." });
    });
  }

  const info = lastSlot ? AD_SLOTS[lastSlot] : null;
  const previewSlot = form.placements[0]?.split(":")[1];
  const previewSpec = previewSlot && isAdSlot(previewSlot) ? AD_SLOTS[previewSlot] : AD_SLOTS.top;
  const natural = form.imageUrl && form.imageWidth && form.imageHeight ? form.imageWidth / form.imageHeight : previewSpec.size[0] / previewSpec.size[1];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6">
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            {[["Gösterim", stats.impressions], ["Tıklama", stats.clicks], ["TO (CTR)", stats.impressions ? `${((stats.clicks / stats.impressions) * 100).toFixed(2)}%` : "—"]].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-border bg-surface p-4"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>
            ))}
          </div>
        )}

        <section className={card}>
          <Step n={1} title="Reklam konumları" text="Reklamın görüneceği sayfayı seçin, sonra konuma dokunun. Birden fazla konum seçebilirsiniz." />
          <AdSlotMap occupancy={occupancy} selected={form.placements} onPick={pick} initialPage={form.placements[0]?.split(":")[0] ?? "home"} />

          {info && (
            <div className="mt-4 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
              <p className="font-bold">{info.label}</p>
              <p className="mt-1 text-xs"><b>{info.orientation === "vertical" ? "Dikey" : "Yatay"} banner</b> · önerilen görsel {info.size[0]}×{info.size[1]} px</p>
              <p className="mt-1 text-xs text-muted">{info.help}</p>
              {info.orientation === "horizontal" && (
                <p className="mt-1 text-xs text-muted">Yan yana yayınlanırsa: {[2, 3, 4].map((n) => { const [w, h] = recommendedSize(lastSlot as AdSlotKey, n); return `${n} reklam ${w}×${h}`; }).join(", ")}. Farklı boyutlar da kabul edilir; kırpılarak sığdırılır.</p>
              )}
            </div>
          )}

          <div className="mt-4">
            <p className={labelClass}>Seçilen konumlar <span className="font-normal">({form.placements.length})</span></p>
            {form.placements.length === 0 ? (
              <p className="text-xs text-muted">Henüz konum seçilmedi.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {form.placements.map((placement) => (
                  <li key={placement} className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 py-1 pl-3 pr-1.5 text-xs font-semibold text-accent">
                    {placementLabel(placement)}
                    <button type="button" aria-label="Konumu kaldır" onClick={() => pick(placement)} className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-accent/20"><FiX className="h-3 w-3" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={card}>
          <Step n={2} title="Sponsor ve içerik" text="Görsel yüklerseniz yalnızca görsel gösterilir. Görsel yoksa başlık ve açıklamadan şık bir metin reklamı oluşturulur." />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="advertiser" className={labelClass}>İşletme / sponsor adı *</label><input id="advertiser" value={form.advertiser} onChange={(e) => set("advertiser", e.target.value)} className={inputClass} placeholder="Örn. Güven Oto Ekspertiz" /></div>
            <div><label htmlFor="linkUrl" className={labelClass}>Yönlendirme bağlantısı *</label><input id="linkUrl" value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} className={inputClass} placeholder="https://…" inputMode="url" /></div>
            <div><label htmlFor="title" className={labelClass}>Reklam başlığı</label><input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={120} className={inputClass} placeholder="Örn. Ücretsiz ön ekspertiz" /></div>
            <div><label htmlFor="description" className={labelClass}>Kısa açıklama</label><input id="description" value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={240} className={inputClass} placeholder="İsteğe bağlı" /></div>
          </div>

          <div className="mt-4">
            <p className={labelClass}>Banner görseli <span className="font-normal">— önerilen {previewSpec.size[0]}×{previewSpec.size[1]} px (JPG, PNG, WebP, GIF; en fazla 4 MB)</span></p>
            {form.imageUrl ? (
              <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="Banner önizleme" className="h-20 max-w-[14rem] rounded-lg object-contain" />
                <div className="space-y-1 text-xs text-muted">
                  <p>{form.imageWidth}×{form.imageHeight} px</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={!ready || busy} onClick={() => fileInput.current?.click()} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 font-semibold text-foreground hover:border-accent disabled:opacity-50"><FiUpload className="h-3.5 w-3.5" /> {busy ? "Yükleniyor..." : "Değiştir"}</button>
                    <button type="button" onClick={() => setForm((c) => ({ ...c, imageUrl: "", imagePublicId: "", imageWidth: 0, imageHeight: 0 }))} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 font-semibold text-red-500 hover:underline"><FiTrash2 className="h-3.5 w-3.5" /> Kaldır</button>
                  </div>
                </div>
              </div>
            ) : (
              <button type="button" disabled={!ready || busy} onClick={() => fileInput.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background py-8 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
                <FiImage className="h-6 w-6" /> {busy ? "Yükleniyor..." : "Banner görselini seç"}
              </button>
            )}
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={onFile} className="sr-only" />
            {!ready && <p className="mt-2 text-xs text-amber-500">Görsel yükleme için R2 depolama bilgileri tanımlı olmalı.</p>}
          </div>
        </section>

        <section className={card}>
          <Step n={3} title="Yayın ve sözleşme" text="Tarih aralığı dolunca reklam otomatik yayından kalkar." />
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="startsAt" className={labelClass}>Başlangıç tarihi (boşsa hemen)</label><input id="startsAt" type="date" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} className={inputClass} /></div>
            <div><label htmlFor="endsAt" className={labelClass}>Bitiş tarihi (boşsa süresiz)</label><input id="endsAt" type="date" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} className={inputClass} /></div>
            <div>
              <label htmlFor="priority" className={labelClass}>Öncelik (0-100)</label>
              <input id="priority" type="number" min={0} max={100} value={form.priority} onChange={(e) => set("priority", Number(e.target.value))} className={inputClass} />
              <p className="mt-1 text-xs text-muted">Aynı konumda birden fazla reklam varsa yüksek öncelikli olan solda gösterilir; eşitlerde ekleme sırası geçerli.</p>
            </div>
            <label className="mt-6 flex cursor-pointer items-center gap-3 self-start rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" /> Reklam yayında olsun
            </label>
            <div className="sm:col-span-2"><label htmlFor="note" className={labelClass}>Özel not (yalnızca siz görürsünüz)</label><textarea id="note" rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} maxLength={1000} className={inputClass} placeholder="Ücret, ödeme durumu, sponsor iletişim bilgisi…" /></div>
          </div>
        </section>

        {status && <p role={status.ok ? "status" : "alert"} className={`text-sm ${status.ok ? "text-emerald-500" : "text-red-500"}`}>{status.text}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={pending} className="button-primary inline-flex h-11 items-center rounded-xl px-8 text-sm font-semibold disabled:opacity-60">{pending ? "Kaydediliyor..." : id ? "Değişiklikleri kaydet" : "Reklamı kaydet"}</button>
          {id && <button type="button" onClick={remove} disabled={pending} className="inline-flex h-11 items-center rounded-xl border border-red-500/50 px-5 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-60">Sil</button>}
        </div>
      </div>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className={card}>
          <h2 className="font-bold">Canlı önizleme</h2>
          <p className="mb-3 text-xs text-muted">Sitede görüneceği hâl.</p>
          <p className="mb-1.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted">Reklam</p>
          <div className="ad-frame block">
            <span className="ad-inner relative block" style={{ aspectRatio: previewSpec.orientation === "vertical" ? `${natural}` : `${Math.max(2, Math.min(natural, 6))}` }}>
              <AdCardContent ad={{ sponsor: form.advertiser, title: form.title, description: form.description, image: form.imageUrl }} sizes="320px" />
            </span>
          </div>
          <p className="mt-3 text-xs text-muted">{previewSpec.label} · {previewSpec.size[0]}×{previewSpec.size[1]}</p>
        </div>
      </aside>
    </div>
  );
}
