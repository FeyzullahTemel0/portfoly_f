"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { FiImage, FiTrash2, FiUpload } from "react-icons/fi";
import { uploadImage } from "@/components/admin/upload";
import { AD_PAGES, AD_POSITIONS, isAdPosition } from "@/lib/ads";
import { deleteAd, saveAd, type AdInput } from "../../manage-actions";

type Props = { id: string | null; initial: AdInput; ready: boolean; stats?: { impressions: number; clicks: number } };

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";

type ImageFieldProps = {
  label: string;
  hint: string;
  size: readonly [number, number];
  url: string;
  disabled: boolean;
  onChange: (url: string, publicId: string) => void;
  onMessage: (ok: boolean, text: string) => void;
};

// Yüklenen görselin boyut oranı reklam konumunun standart oranıyla uyuşmalıdır.
function AdImageField({ label, hint, size, url, disabled, onChange, onMessage }: ImageFieldProps) {
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const ratio = bitmap.width / bitmap.height;
      const expected = size[0] / size[1];
      if (Math.abs(ratio - expected) / expected > 0.03) {
        throw new Error(`Görsel oranı uyumsuz. ${size[0]}×${size[1]} px (veya aynı oranda daha büyük) olmalı; yüklediğiniz ${bitmap.width}×${bitmap.height} px.`);
      }
      if (bitmap.width < size[0] * 0.9) throw new Error(`Görsel çok küçük; en az ${size[0]} px genişlik önerilir.`);
      const result = await uploadImage(file, "rovax/ads");
      onChange(result.url, result.publicId);
      onMessage(true, `${label} yüklendi. Kaydet'e basmayı unutmayın.`);
    } catch (error) {
      onMessage(false, error instanceof Error ? error.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className={labelClass}>{label} <span className="font-normal">— {size[0]}×{size[1]} px</span></p>
      <div className="overflow-hidden rounded-xl border border-dashed border-border bg-background p-3">
        <div className="mx-auto" style={{ maxWidth: Math.min(size[0], 480) }}>
          <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-surface" style={{ aspectRatio: `${size[0]} / ${size[1]}` }}>
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={label} className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs text-muted"><FiImage className="h-5 w-5" /> Görsel yok</span>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted">{hint}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button type="button" disabled={disabled || busy} onClick={() => input.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-50">
            <FiUpload className="h-4 w-4" /> {busy ? "Yükleniyor..." : url ? "Değiştir" : "Yükle"}
          </button>
          {url && (
            <button type="button" disabled={busy} onClick={() => onChange("", "")} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm text-red-500 hover:underline">
              <FiTrash2 className="h-4 w-4" /> Kaldır
            </button>
          )}
        </div>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={onFile} className="sr-only" />
      </div>
    </div>
  );
}

export function AdForm({ id, initial, ready, stats }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof AdInput>(key: K, value: AdInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  };
  const spec = isAdPosition(form.position) ? AD_POSITIONS[form.position] : AD_POSITIONS.top;

  function togglePage(key: string) {
    const exists = form.pages.includes(key);
    let pages = exists ? form.pages.filter((page) => page !== key) : [...form.pages, key];
    if (!exists && key === "all") pages = ["all"];
    if (!exists && key !== "all") pages = pages.filter((page) => page !== "all");
    set("pages", pages);
  }

  function save() {
    startTransition(async () => {
      const result = await saveAd(id, form);
      if (result.ok) {
        router.push("/admin/ads");
        router.refresh();
      } else {
        setStatus({ ok: false, text: result.error ?? "Kaydedilemedi." });
      }
    });
  }

  function remove() {
    if (!id || !window.confirm("Bu reklam ve görselleri kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteAd(id);
      if (result.ok) {
        router.push("/admin/ads");
        router.refresh();
      } else {
        setStatus({ ok: false, text: result.error ?? "Silinemedi." });
      }
    });
  }

  return (
    <div className="max-w-4xl space-y-8">
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[["Gösterim", stats.impressions], ["Tıklama", stats.clicks], ["TO (CTR)", stats.impressions ? `${((stats.clicks / stats.impressions) * 100).toFixed(2)}%` : "—"]].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs text-muted">{label}</p>
              <p className="mt-1 text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">Reklam bilgileri</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="advertiser" className={labelClass}>Reklam veren / firma *</label>
            <input id="advertiser" value={form.advertiser} onChange={(e) => set("advertiser", e.target.value)} className={inputClass} placeholder="Örn. Aydın Mobilya" />
          </div>
          <div>
            <label htmlFor="linkUrl" className={labelClass}>Tıklanınca gidilecek adres *</label>
            <input id="linkUrl" value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} className={inputClass} placeholder="https://firmaadresi.com" inputMode="url" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="alt" className={labelClass}>Görsel açıklaması (erişilebilirlik)</label>
            <input id="alt" value={form.alt} onChange={(e) => set("alt", e.target.value)} className={inputClass} placeholder="Reklamın kısa açıklaması" />
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">Konum ve sayfalar</h2>
        <div>
          <label htmlFor="position" className={labelClass}>Reklam konumu *</label>
          <select id="position" value={form.position} onChange={(e) => set("position", e.target.value)} className={inputClass}>
            {Object.entries(AD_POSITIONS).map(([key, value]) => (
              <option key={key} value={key}>{value.label} — {value.desktop[0]}×{value.desktop[1]}</option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-muted">{spec.help} Masaüstü {spec.desktop[0]}×{spec.desktop[1]} px, mobil {spec.mobile[0]}×{spec.mobile[1]} px.</p>
        </div>
        <fieldset>
          <legend className={labelClass}>Hangi sayfalarda gösterilsin? *</legend>
          <div className="flex flex-wrap gap-2">
            {AD_PAGES.map((page) => (
              <label key={page.key} className="inline-flex min-h-10 cursor-pointer items-center rounded-full border border-border bg-background px-4 text-sm transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent/15 has-[:checked]:font-semibold has-[:checked]:text-accent">
                <input type="checkbox" checked={form.pages.includes(page.key)} onChange={() => togglePage(page.key)} className="sr-only" />
                {page.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">Reklam görselleri</h2>
        <div className="grid gap-5 lg:grid-cols-2">
          <AdImageField label="Masaüstü / tablet görseli *" hint="PNG, JPG, WebP veya GIF; en fazla 4 MB." size={spec.desktop} url={form.imageUrl} disabled={!ready} onChange={(url, publicId) => setForm((c) => ({ ...c, imageUrl: url, imagePublicId: publicId }))} onMessage={(ok, text) => setStatus({ ok, text })} />
          <AdImageField label="Mobil görseli (isteğe bağlı)" hint="Yüklenmezse masaüstü görseli mobilde de kullanılır." size={spec.mobile} url={form.mobileImageUrl} disabled={!ready} onChange={(url, publicId) => setForm((c) => ({ ...c, mobileImageUrl: url, mobileImagePublicId: publicId }))} onMessage={(ok, text) => setStatus({ ok, text })} />
        </div>
        {!ready && <p className="text-xs text-amber-500">Görsel yükleme için R2 depolama bilgileri tanımlı olmalı.</p>}
      </section>

      <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">Yayın ayarları</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="startsAt" className={labelClass}>Başlangıç (boşsa hemen)</label>
            <input id="startsAt" type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="endsAt" className={labelClass}>Bitiş (boşsa süresiz)</label>
            <input id="endsAt" type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="weight" className={labelClass}>Gösterim ağırlığı (1-10)</label>
            <input id="weight" type="number" min={1} max={10} value={form.weight} onChange={(e) => set("weight", Number(e.target.value))} className={inputClass} />
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
          Reklam yayında
        </label>
        <p className="text-xs text-muted">Aynı konumda birden fazla reklam varsa ağırlığa göre dönüşümlü gösterilir. Reklamlar sitede &quot;Reklam&quot; etiketiyle ve rel=&quot;sponsored&quot; bağlantıyla sunulur.</p>
      </section>

      {status && <p role={status.ok ? "status" : "alert"} className={`text-sm ${status.ok ? "text-emerald-500" : "text-red-500"}`}>{status.text}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className="button-primary inline-flex h-11 items-center rounded-xl px-7 text-sm font-semibold disabled:opacity-60">{pending ? "Kaydediliyor..." : "Kaydet"}</button>
        {id && <button type="button" onClick={remove} disabled={pending} className="inline-flex h-11 items-center rounded-xl border border-red-500/50 px-5 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-60">Sil</button>}
      </div>
    </div>
  );
}
