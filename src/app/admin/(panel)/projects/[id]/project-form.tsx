"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { GalleryUploader } from "@/components/admin/gallery-uploader";
import { ImageUploader } from "@/components/admin/image-uploader";
import { deleteProject, saveProject, type ProjectInput } from "../../actions";

type Props = { id: string | null; initial: ProjectInput; cloudinaryReady: boolean };

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
const labelClass = "mb-1 block text-xs font-medium text-muted";

export function ProjectForm({ id, initial, cloudinaryReady }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  };
  const onMessage = (ok: boolean, text: string) => setStatus({ ok, text });

  function save() {
    startTransition(async () => {
      const result = await saveProject(id, form);
      if (result.ok) {
        router.push("/admin/projects");
        router.refresh();
      } else {
        setStatus({ ok: false, text: result.error ?? "Hata oluştu." });
      }
    });
  }

  function remove() {
    if (!id || !window.confirm("Bu proje ve tüm görselleri kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteProject(id);
      if (result && !result.ok) setStatus({ ok: false, text: result.error ?? "Silinemedi." });
    });
  }

  return (
    <div className="max-w-4xl space-y-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <section className="space-y-6">
        <h2 className="font-semibold">Görseller</h2>
        <ImageUploader
          url={form.coverUrl}
          folder="temeloji/projects"
          ready={cloudinaryReady}
          label="Kapak görseli (kare kartta görünür)"
          onChange={(url, publicId) => setForm((current) => ({ ...current, coverUrl: url, coverPublicId: publicId }))}
          onMessage={onMessage}
        />
        <div>
          <label htmlFor="coverFit" className={labelClass}>Kapak görseli yerleşimi</label>
          <select id="coverFit" value={form.coverFit} onChange={(e) => set("coverFit", e.target.value as ProjectInput["coverFit"])} className={inputClass}>
            <option value="cover">Kart alanını doldur (gerekirse kırp)</option>
            <option value="contain">Görselin tamamını göster (kırpma)</option>
          </select>
        </div>
        <GalleryUploader
          images={form.gallery}
          folder="temeloji/projects"
          ready={cloudinaryReady}
          onChange={(gallery) => setForm((current) => ({ ...current, gallery }))}
          onMessage={onMessage}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Proje bilgileri</h2>
        <div>
          <label htmlFor="titleTr" className={labelClass}>Başlık (Türkçe) *</label>
          <input id="titleTr" value={form.titleTr} onChange={(e) => set("titleTr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="titleEn" className={labelClass}>Başlık (İngilizce)</label>
          <input id="titleEn" value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="titleDe" className={labelClass}>Başlık (Almanca)</label>
          <input id="titleDe" value={form.titleDe} onChange={(e) => set("titleDe", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="titleFr" className={labelClass}>Başlık (Fransızca)</label>
          <input id="titleFr" value={form.titleFr} onChange={(e) => set("titleFr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="titleAr" className={labelClass}>Başlık (Arapça)</label>
          <input id="titleAr" dir="rtl" value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="categoryTr" className={labelClass}>Kategori (Türkçe) — örn. Kurumsal Web Sitesi</label>
          <input id="categoryTr" value={form.categoryTr} onChange={(e) => set("categoryTr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="categoryEn" className={labelClass}>Kategori (İngilizce)</label>
          <input id="categoryEn" value={form.categoryEn} onChange={(e) => set("categoryEn", e.target.value)} className={inputClass} />
        </div>
        <div><label htmlFor="categoryDe" className={labelClass}>Kategori (Almanca)</label><input id="categoryDe" value={form.categoryDe} onChange={(e) => set("categoryDe", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="categoryFr" className={labelClass}>Kategori (Fransızca)</label><input id="categoryFr" value={form.categoryFr} onChange={(e) => set("categoryFr", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="categoryAr" className={labelClass}>Kategori (Arapça)</label><input id="categoryAr" dir="rtl" value={form.categoryAr} onChange={(e) => set("categoryAr", e.target.value)} className={inputClass} /></div>
        <div>
          <label htmlFor="summaryTr" className={labelClass}>Kısa açıklama (Türkçe, kartta görünür)</label>
          <textarea id="summaryTr" rows={3} value={form.summaryTr} onChange={(e) => set("summaryTr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="summaryEn" className={labelClass}>Kısa açıklama (İngilizce)</label>
          <textarea id="summaryEn" rows={3} value={form.summaryEn} onChange={(e) => set("summaryEn", e.target.value)} className={inputClass} />
        </div>
        <div><label htmlFor="summaryDe" className={labelClass}>Kısa açıklama (Almanca)</label><textarea id="summaryDe" rows={3} value={form.summaryDe} onChange={(e) => set("summaryDe", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="summaryFr" className={labelClass}>Kısa açıklama (Fransızca)</label><textarea id="summaryFr" rows={3} value={form.summaryFr} onChange={(e) => set("summaryFr", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="summaryAr" className={labelClass}>Kısa açıklama (Arapça)</label><textarea id="summaryAr" dir="rtl" rows={3} value={form.summaryAr} onChange={(e) => set("summaryAr", e.target.value)} className={inputClass} /></div>
        <div>
          <label htmlFor="descriptionTr" className={labelClass}>Detaylı açıklama (Türkçe) — paragraflar arasında boş satır bırakın</label>
          <textarea id="descriptionTr" rows={9} value={form.descriptionTr} onChange={(e) => set("descriptionTr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="descriptionEn" className={labelClass}>Detaylı açıklama (İngilizce)</label>
          <textarea id="descriptionEn" rows={9} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} className={inputClass} />
        </div>
        <div><label htmlFor="descriptionDe" className={labelClass}>Detaylı açıklama (Almanca)</label><textarea id="descriptionDe" rows={9} value={form.descriptionDe} onChange={(e) => set("descriptionDe", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="descriptionFr" className={labelClass}>Detaylı açıklama (Fransızca)</label><textarea id="descriptionFr" rows={9} value={form.descriptionFr} onChange={(e) => set("descriptionFr", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="descriptionAr" className={labelClass}>Detaylı açıklama (Arapça)</label><textarea id="descriptionAr" dir="rtl" rows={9} value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} className={inputClass} /></div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Detaylar</h2>
        <div>
          <label htmlFor="client" className={labelClass}>Müşteri</label>
          <input id="client" value={form.client} onChange={(e) => set("client", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="year" className={labelClass}>Yıl</label>
          <input id="year" value={form.year} onChange={(e) => set("year", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="url" className={labelClass}>Proje adresi (https://... veya /demos/dosya.html)</label>
          <input id="url" value={form.url} onChange={(e) => set("url", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="tags" className={labelClass}>Etiketler (virgülle ayırın)</label>
          <input id="tags" value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Next.js, E-ticaret, Shopier" className={inputClass} />
        </div>
        <div>
          <label htmlFor="slug" className={labelClass}>Sayfa adresi (boşsa başlıktan üretilir)</label>
          <input id="slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="order" className={labelClass}>Sıra (küçük olan önce gelir)</label>
          <input id="order" type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2">
          <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Sitede göster
        </label>
      </section>

      {status && <p role="status" className={`text-sm font-medium ${status.ok ? "text-emerald-500" : "text-red-500"}`}>{status.text}</p>}

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
