"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { GalleryUploader, type GalleryImage } from "@/components/admin/gallery-uploader";
import { ImageUploader } from "@/components/admin/image-uploader";
import { locales, type Locale } from "@/lib/locales";
import { deleteReference, saveReference, type LocalizedInput, type ReferenceInput } from "../../actions";

type Props = { id: string | null; initial: ReferenceInput; cloudinaryReady: boolean };

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
const labelClass = "mb-1 block text-xs font-medium text-muted";
const langNames: Record<Locale, string> = { tr: "Türkçe", en: "İngilizce", de: "Almanca", fr: "Fransızca", ar: "Arapça" };
const blankText = (): LocalizedInput => ({ tr: "", en: "", de: "", fr: "", ar: "" });

export function ReferenceForm({ id, initial, cloudinaryReady }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [lang, setLang] = useState<Locale>("tr");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dir = lang === "ar" ? "rtl" : "ltr";

  const set = <K extends keyof ReferenceInput>(key: K, value: ReferenceInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  };
  const setText = (key: "tagline" | "sector" | "description" | "story", value: string) => set(key, { ...form[key], [lang]: value });

  function updateFeature(index: number, key: "title" | "text", value: string) {
    set("features", form.features.map((item, i) => (i === index ? { ...item, [key]: { ...item[key], [lang]: value } } : item)));
  }
  function updateStat(index: number, patch: { value?: string; label?: string }) {
    set(
      "stats",
      form.stats.map((item, i) => (i === index ? { value: patch.value ?? item.value, label: patch.label === undefined ? item.label : { ...item.label, [lang]: patch.label } } : item)),
    );
  }
  function updateImage(index: number, key: "caption" | "description", value: string) {
    set("gallery", form.gallery.map((item, i) => (i === index ? { ...item, [key]: { ...item[key], [lang]: value } } : item)));
  }

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
    if (!id || !window.confirm("Bu referans ve görselleri kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteReference(id);
      if (result && !result.ok) setStatus({ ok: false, text: result.error ?? "Silinemedi." });
    });
  }

  return (
    <div className="max-w-3xl space-y-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <section className="space-y-4">
        <ImageUploader
          url={form.logoUrl}
          folder="rovax/references"
          ready={cloudinaryReady}
          label="Logo"
          onChange={(url, publicId) => setForm((current) => ({ ...current, logoUrl: url, logoPublicId: publicId }))}
          onMessage={(ok, text) => setStatus({ ok, text })}
        />
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
            <label htmlFor="location" className={labelClass}>Konum (şehir, ülke)</label>
            <input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="İstanbul, Türkiye" className={inputClass} />
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>Detay sayfası adresi (ör. garanti-oto-ekspertiz)</label>
            <input id="slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="Boş bırakılırsa kart doğrudan siteye gider" className={inputClass} />
          </div>
          <div>
            <label htmlFor="order" className={labelClass}>Sıra (küçük olan önce gelir)</label>
            <input id="order" type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Sitede göster
          </label>
          <div>
            <label htmlFor="tech" className={labelClass}>Kullanılan yaklaşım etiketleri (virgülle ayırın)</label>
            <input id="tech" value={form.tech} onChange={(e) => set("tech", e.target.value)} placeholder="Mobil uyumlu, Hızlı yükleme, SEO" className={inputClass} />
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-10 -mx-5 border-y border-border bg-surface/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="mb-2 text-xs font-medium text-muted">Aşağıdaki metinler seçili dil için düzenlenir:</p>
        <div role="tablist" aria-label="Dil" className="flex flex-wrap gap-2">
          {locales.map((code) => {
            const filled = Boolean(form.tagline[code] || form.story[code] || form.description[code]);
            return (
              <button
                key={code}
                type="button"
                role="tab"
                aria-selected={lang === code}
                onClick={() => setLang(code)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${lang === code ? "border-accent bg-accent text-accent-foreground" : "border-border hover:border-accent"}`}
              >
                {langNames[code]}
                <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${filled ? "bg-emerald-500" : "bg-amber-500"}`} />
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <label htmlFor="sector" className={labelClass}>Sektör ({langNames[lang]})</label>
          <input id="sector" dir={dir} value={form.sector[lang]} onChange={(e) => setText("sector", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="tagline" className={labelClass}>Vurucu slogan ({langNames[lang]})</label>
          <input id="tagline" dir={dir} value={form.tagline[lang]} onChange={(e) => setText("tagline", e.target.value)} placeholder="Tek cümlelik, pazarlama odaklı başlık" className={inputClass} />
        </div>
        <div>
          <label htmlFor="description" className={labelClass}>Kısa tanıtım ({langNames[lang]})</label>
          <textarea id="description" dir={dir} rows={3} value={form.description[lang]} onChange={(e) => setText("description", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="story" className={labelClass}>Proje hikâyesi ({langNames[lang]}) — paragraflar arasında boş satır bırakın</label>
          <textarea id="story" dir={dir} rows={10} value={form.story[lang]} onChange={(e) => setText("story", e.target.value)} className={inputClass} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Rakamlar (en fazla 4)</p>
          {form.stats.length < 4 && (
            <button type="button" onClick={() => set("stats", [...form.stats, { value: "", label: blankText() }])} className="text-sm font-medium text-accent hover:underline">+ Ekle</button>
          )}
        </div>
        {form.stats.map((stat, index) => (
          <div key={index} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[8rem_1fr_auto]">
            <div>
              <label htmlFor={`stat-value-${index}`} className={labelClass}>Değer</label>
              <input id={`stat-value-${index}`} value={stat.value} onChange={(e) => updateStat(index, { value: e.target.value })} placeholder="5" className={inputClass} />
            </div>
            <div>
              <label htmlFor={`stat-label-${index}`} className={labelClass}>Açıklama ({langNames[lang]})</label>
              <input id={`stat-label-${index}`} dir={dir} value={stat.label[lang]} onChange={(e) => updateStat(index, { label: e.target.value })} className={inputClass} />
            </div>
            <button type="button" onClick={() => set("stats", form.stats.filter((_, i) => i !== index))} className="self-end pb-2 text-sm text-red-500 hover:underline">Kaldır</button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Neler yaptık? (en fazla 9)</p>
          {form.features.length < 9 && (
            <button type="button" onClick={() => set("features", [...form.features, { title: blankText(), text: blankText() }])} className="text-sm font-medium text-accent hover:underline">+ Ekle</button>
          )}
        </div>
        {form.features.map((feature, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-3">
            <div>
              <label htmlFor={`feature-title-${index}`} className={labelClass}>Başlık {index + 1} ({langNames[lang]})</label>
              <input id={`feature-title-${index}`} dir={dir} value={feature.title[lang]} onChange={(e) => updateFeature(index, "title", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`feature-text-${index}`} className={labelClass}>Açıklama ({langNames[lang]})</label>
              <textarea id={`feature-text-${index}`} dir={dir} rows={3} value={feature.text[lang]} onChange={(e) => updateFeature(index, "text", e.target.value)} className={inputClass} />
            </div>
            <button type="button" onClick={() => set("features", form.features.filter((_, i) => i !== index))} className="text-sm text-red-500 hover:underline">Kaldır</button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <GalleryUploader
          images={form.gallery}
          folder="rovax/references"
          ready={cloudinaryReady}
          max={12}
          onChange={(images) =>
            set(
              "gallery",
              images.map((image: GalleryImage) => form.gallery.find((item) => item.url === image.url) ?? { ...image, caption: blankText(), description: blankText() }),
            )
          }
          onMessage={(ok, text) => setStatus({ ok, text })}
        />
        {form.gallery.map((image, index) => (
          <div key={image.publicId || image.url} className="grid gap-3 rounded-lg border border-border p-4">
            <p className="text-sm font-semibold">Görsel {index + 1} ({langNames[lang]})</p>
            <div>
              <label htmlFor={`caption-${index}`} className={labelClass}>Başlık</label>
              <input id={`caption-${index}`} dir={dir} value={image.caption[lang]} onChange={(e) => updateImage(index, "caption", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`description-${index}`} className={labelClass}>Bu ekranda neler var?</label>
              <textarea id={`description-${index}`} dir={dir} rows={3} value={image.description[lang]} onChange={(e) => updateImage(index, "description", e.target.value)} className={inputClass} />
            </div>
          </div>
        ))}
      </section>

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
