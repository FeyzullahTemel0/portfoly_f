"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { Settings } from "@/lib/site";
import { saveSeoSettings, type SeoInput } from "../actions";

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";
const labelClass = "mb-1.5 block text-sm font-medium";

export function SeoEditor({ initial, cloudinaryReady }: { initial: Settings["seo"]; cloudinaryReady: boolean }) {
  const router = useRouter();
  const [data, setData] = useState<SeoInput>(initial);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof SeoInput>(key: K, value: SeoInput[K]) {
    setData((current) => ({ ...current, [key]: value }));
    setStatus(null);
  }

  function save() {
    startTransition(async () => {
      const result = await saveSeoSettings(data);
      setStatus({ ok: result.ok, text: result.ok ? "SEO ayarları kaydedildi." : (result.error ?? "Kaydedilemedi.") });
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="max-w-4xl space-y-7">
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Temel arama görünümü</h2>
        <p className="mt-1 text-sm text-muted">Google arama sonuçlarında ve tarayıcı sekmesinde kullanılacak varsayılan bilgiler.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="siteUrl" className={labelClass}>Canlı site adresi</label>
            <input id="siteUrl" value={data.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} placeholder="https://temeloji.com" className={inputClass} />
            <p className="mt-1 text-xs text-muted">Alan adını bağladıktan sonra gir. Sitemap ve dil bazlı canonical bağlantılar bu alan adını kullanır.</p>
          </div>
          <div>
            <label htmlFor="googleSiteVerification" className={labelClass}>Google Search Console doğrulama kodu</label>
            <input id="googleSiteVerification" value={data.googleSiteVerification} onChange={(e) => set("googleSiteVerification", e.target.value)} placeholder="HTML doğrulama meta kodundaki content değeri" className={inputClass} />
            <p className="mt-1 text-xs text-muted">Search Console ücretsizdir. <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline underline-offset-2">Search Console&apos;u aç</a>, mülkü doğrula ve HTML etiketi yöntemindeki content değerini buraya yaz.</p>
          </div>
          <div>
            <label htmlFor="titleTr" className={labelClass}>Ana sayfa başlığı (Türkçe)</label>
            <input id="titleTr" maxLength={70} value={data.titleTr} onChange={(e) => set("titleTr", e.target.value)} className={inputClass} />
            <p className="mt-1 text-right text-xs text-muted">{data.titleTr.length}/70</p>
          </div>
          <div>
            <label htmlFor="titleEn" className={labelClass}>Home page title (English)</label>
            <input id="titleEn" maxLength={70} value={data.titleEn} onChange={(e) => set("titleEn", e.target.value)} className={inputClass} />
            <p className="mt-1 text-right text-xs text-muted">{data.titleEn.length}/70</p>
          </div>
          <div><label htmlFor="titleDe" className={labelClass}>Ana sayfa başlığı (Almanca)</label><input id="titleDe" maxLength={70} value={data.titleDe} onChange={(e) => set("titleDe", e.target.value)} className={inputClass} /><p className="mt-1 text-right text-xs text-muted">{data.titleDe.length}/70</p></div>
          <div><label htmlFor="titleFr" className={labelClass}>Ana sayfa başlığı (Fransızca)</label><input id="titleFr" maxLength={70} value={data.titleFr} onChange={(e) => set("titleFr", e.target.value)} className={inputClass} /><p className="mt-1 text-right text-xs text-muted">{data.titleFr.length}/70</p></div>
          <div><label htmlFor="titleAr" className={labelClass}>Ana sayfa başlığı (Arapça)</label><input id="titleAr" dir="rtl" maxLength={70} value={data.titleAr} onChange={(e) => set("titleAr", e.target.value)} className={inputClass} /><p className="mt-1 text-right text-xs text-muted">{data.titleAr.length}/70</p></div>
          <div>
            <label htmlFor="descriptionTr" className={labelClass}>Ana sayfa açıklaması (Türkçe)</label>
            <textarea id="descriptionTr" rows={4} maxLength={300} value={data.descriptionTr} onChange={(e) => set("descriptionTr", e.target.value)} className={inputClass} />
            <p className="mt-1 text-right text-xs text-muted">{data.descriptionTr.length}/300</p>
          </div>
          <div>
            <label htmlFor="descriptionEn" className={labelClass}>Home page description (English)</label>
            <textarea id="descriptionEn" rows={4} maxLength={300} value={data.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className={inputClass} />
            <p className="mt-1 text-right text-xs text-muted">{data.descriptionEn.length}/300</p>
          </div>
          <div><label htmlFor="descriptionDe" className={labelClass}>Ana sayfa açıklaması (Almanca)</label><textarea id="descriptionDe" dir="ltr" rows={4} maxLength={300} value={data.descriptionDe} onChange={(e) => set("descriptionDe", e.target.value)} className={inputClass} /><p className="mt-1 text-right text-xs text-muted">{data.descriptionDe.length}/300</p></div>
          <div><label htmlFor="descriptionFr" className={labelClass}>Ana sayfa açıklaması (Fransızca)</label><textarea id="descriptionFr" rows={4} maxLength={300} value={data.descriptionFr} onChange={(e) => set("descriptionFr", e.target.value)} className={inputClass} /><p className="mt-1 text-right text-xs text-muted">{data.descriptionFr.length}/300</p></div>
          <div><label htmlFor="descriptionAr" className={labelClass}>Ana sayfa açıklaması (Arapça)</label><textarea id="descriptionAr" dir="rtl" rows={4} maxLength={300} value={data.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} className={inputClass} /><p className="mt-1 text-right text-xs text-muted">{data.descriptionAr.length}/300</p></div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Sosyal paylaşım görseli</h2>
        <p className="mb-4 mt-1 text-sm text-muted">WhatsApp, LinkedIn ve diğer platformlarda site bağlantısı paylaşılırken kullanılan Open Graph görseli.</p>
        <ImageUploader
          url={data.ogImageUrl}
          folder="temeloji/seo"
          ready={cloudinaryReady}
          label="Paylaşım görseli (önerilen: 1200 × 630 px)"
          onChange={(url, publicId) => setData((current) => ({ ...current, ogImageUrl: url, ogImagePublicId: publicId }))}
          onMessage={(ok, text) => setStatus({ ok, text })}
        />
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Arama motoru indeksleme</h2>
        <label className="mt-4 flex items-start gap-3">
          <input type="checkbox" checked={data.allowIndex} onChange={(e) => set("allowIndex", e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
          <span>
            <span className="block text-sm font-medium">Arama motorlarının siteyi indekslemesine izin ver</span>
            <span className="mt-1 block text-xs leading-5 text-muted">Kapalıysa sayfalara noindex eklenir ve robots.txt taramayı sınırlar. Canlıya çıkarken açık olduğundan emin ol.</span>
          </span>
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className="inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground disabled:opacity-60">
          {pending ? "Kaydediliyor..." : "SEO ayarlarını kaydet"}
        </button>
        {status && <p role="status" className={`text-sm font-medium ${status.ok ? "text-emerald-500" : "text-red-500"}`}>{status.text}</p>}
      </div>

      <p className="text-xs leading-5 text-muted">Bu ayarlar teknik SEO temelini hazırlar; Google sıralaması garanti edilemez. İçerik kalitesi, hız, alan adı geçmişi ve Search Console takibi de önemlidir. Google reklamı satın alınmıyor.</p>
    </div>
  );
}
