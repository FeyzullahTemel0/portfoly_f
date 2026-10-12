"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { GalleryUploader, type GalleryImage } from "@/components/admin/gallery-uploader";
import { ImageUploader } from "@/components/admin/image-uploader";
import { deleteReference, saveReference, type ReferenceInput } from "../../actions";

type Props = { id: string | null; initial: ReferenceInput; cloudinaryReady: boolean };

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
const labelClass = "mb-1 block text-xs font-medium text-muted";

export function ReferenceForm({ id, initial, cloudinaryReady }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ReferenceInput>(key: K, value: ReferenceInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  };

  function save() {
    startTransition(async () => {
      const result = await saveReference(id, form);
      if (result.ok) {
        router.push("/admin/references");
        router.refresh();
      } else {
        setStatus({ ok: false, text: result.error ?? "Hata oluştu." });
      }
    });
  }

  function remove() {
    if (!id || !window.confirm("Bu referans ve logosu kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteReference(id);
      if (result && !result.ok) setStatus({ ok: false, text: result.error ?? "Silinemedi." });
    });
  }

  return (
    <div className="max-w-3xl space-y-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <ImageUploader
        url={form.logoUrl}
        folder="temeloji/references"
        ready={cloudinaryReady}
        label="Logo"
        onChange={(url, publicId) => setForm((current) => ({ ...current, logoUrl: url, logoPublicId: publicId }))}
        onMessage={(ok, text) => setStatus({ ok, text })}
      />

      <div>
        <label htmlFor="slug" className={labelClass}>Detay sayfası adresi (ör. garanti-oto-ekspertiz)</label>
        <input id="slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="Boş bırakılırsa kart doğrudan siteye gider" className={inputClass} />
      </div>

      <section className="space-y-4">
        <GalleryUploader
          images={form.gallery}
          folder="temeloji/references"
          ready={cloudinaryReady}
          max={10}
          onChange={(images) => setForm((current) => ({
            ...current,
            gallery: images.map((image: GalleryImage) => current.gallery.find((item) => item.url === image.url) ?? {
              ...image,
              captionTr: "",
              captionEn: "",
              descriptionTr: "",
              descriptionEn: "",
            }),
          }))}
          onMessage={(ok, text) => setStatus({ ok, text })}
        />
        {form.gallery.map((image, index) => (
          <div key={image.publicId || image.url} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
            <p className="text-sm font-semibold sm:col-span-2">Görsel {index + 1} açıklaması</p>
            <div><label htmlFor={`captionTr-${index}`} className={labelClass}>Başlık (Türkçe)</label><input id={`captionTr-${index}`} value={image.captionTr} onChange={(e) => setForm((current) => ({ ...current, gallery: current.gallery.map((item, i) => i === index ? { ...item, captionTr: e.target.value } : item) }))} className={inputClass} /></div>
            <div><label htmlFor={`captionEn-${index}`} className={labelClass}>Başlık (İngilizce)</label><input id={`captionEn-${index}`} value={image.captionEn} onChange={(e) => setForm((current) => ({ ...current, gallery: current.gallery.map((item, i) => i === index ? { ...item, captionEn: e.target.value } : item) }))} className={inputClass} /></div>
            <div><label htmlFor={`descriptionTr-${index}`} className={labelClass}>Kısa bilgi (Türkçe)</label><textarea id={`descriptionTr-${index}`} rows={3} value={image.descriptionTr} onChange={(e) => setForm((current) => ({ ...current, gallery: current.gallery.map((item, i) => i === index ? { ...item, descriptionTr: e.target.value } : item) }))} className={inputClass} /></div>
            <div><label htmlFor={`descriptionEn-${index}`} className={labelClass}>Kısa bilgi (İngilizce)</label><textarea id={`descriptionEn-${index}`} rows={3} value={image.descriptionEn} onChange={(e) => setForm((current) => ({ ...current, gallery: current.gallery.map((item, i) => i === index ? { ...item, descriptionEn: e.target.value } : item) }))} className={inputClass} /></div>
          </div>
        ))}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Firma adı *</label>
          <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="website" className={labelClass}>Web sitesi (https://...)</label>
          <input id="website" value={form.website} onChange={(e) => set("website", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="sectorTr" className={labelClass}>Sektör (Türkçe)</label>
          <input id="sectorTr" value={form.sectorTr} onChange={(e) => set("sectorTr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="sectorEn" className={labelClass}>Sektör (İngilizce)</label>
          <input id="sectorEn" value={form.sectorEn} onChange={(e) => set("sectorEn", e.target.value)} className={inputClass} />
        </div>
        <div><label htmlFor="sectorDe" className={labelClass}>Sektör (Almanca)</label><input id="sectorDe" value={form.sectorDe} onChange={(e) => set("sectorDe", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="sectorFr" className={labelClass}>Sektör (Fransızca)</label><input id="sectorFr" value={form.sectorFr} onChange={(e) => set("sectorFr", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="sectorAr" className={labelClass}>Sektör (Arapça)</label><input id="sectorAr" dir="rtl" value={form.sectorAr} onChange={(e) => set("sectorAr", e.target.value)} className={inputClass} /></div>
        <div>
          <label htmlFor="descriptionTr" className={labelClass}>Açıklama (Türkçe)</label>
          <textarea id="descriptionTr" rows={4} value={form.descriptionTr} onChange={(e) => set("descriptionTr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="descriptionEn" className={labelClass}>Açıklama (İngilizce)</label>
          <textarea id="descriptionEn" rows={4} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className={inputClass} />
        </div>
        <div><label htmlFor="descriptionDe" className={labelClass}>Açıklama (Almanca)</label><textarea id="descriptionDe" rows={4} value={form.descriptionDe} onChange={(e) => set("descriptionDe", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="descriptionFr" className={labelClass}>Açıklama (Fransızca)</label><textarea id="descriptionFr" rows={4} value={form.descriptionFr} onChange={(e) => set("descriptionFr", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="descriptionAr" className={labelClass}>Açıklama (Arapça)</label><textarea id="descriptionAr" dir="rtl" rows={4} value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} className={inputClass} /></div>
        <div>
          <label htmlFor="order" className={labelClass}>Sıra (küçük olan önce gelir)</label>
          <input id="order" type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
          <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Sitede göster
        </label>
      </div>

      {status && (
        <p role="status" className={`text-sm font-medium ${status.ok ? "text-emerald-500" : "text-red-500"}`}>{status.text}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} disabled={pending} className="inline-flex h-10 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-accent-foreground disabled:opacity-60">
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {id && (
          <button type="button" onClick={remove} disabled={pending} className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-red-500 transition-colors hover:border-red-500 disabled:opacity-60">
            Sil
          </button>
        )}
      </div>
    </div>
  );
}
