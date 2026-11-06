"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FiGlobe } from "react-icons/fi";
import type { JSONContent } from "@tiptap/core";
import { ArticleEditor } from "@/components/admin/article-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import { locales, type Locale } from "@/lib/locales";
import { deleteArticle, saveArticle, translateArticleContent, type ArticleInput } from "@/app/admin/(panel)/article-actions";

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";
const languageLabels: Record<Locale, string> = { tr: "Türkçe", en: "English", de: "Deutsch", fr: "Français", ar: "العربية" };
const blankDoc = (): JSONContent => ({ type: "doc", content: [{ type: "paragraph" }] });

type Props = { id: string | null; initial: ArticleInput; storageReady: boolean };

export function ArticleForm({ id, initial, storageReady }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [language, setLanguage] = useState<Locale>("tr");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const direction = language === "ar" ? "rtl" : "ltr";

  function update<K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  }
  function updateLocalized(key: "title" | "excerpt" | "category" | "coverAlt", value: string) {
    update(key, { ...form[key], [language]: value });
  }

  function save() {
    startTransition(async () => {
      const result = await saveArticle(id, form);
      if (!result.ok) return setStatus({ ok: false, text: result.error ?? "Makale kaydedilemedi." });
      router.push("/admin/articles");
      router.refresh();
    });
  }

  function translate(overwrite: boolean) {
    if (!form.title.tr.trim()) {
      setStatus({ ok: false, text: "Önce Türkçe makale başlığını doldurun." });
      return;
    }
    if (overwrite && !window.confirm("İngilizce, Almanca, Fransızca ve Arapça içeriklerin üzerine Türkçeden yapılan çeviriler yazılacak. Devam edilsin mi?")) return;
    startTransition(async () => {
      setStatus({ ok: true, text: "Türkçe içerik diğer dillere çevriliyor..." });
      const result = await translateArticleContent(form, overwrite);
      if (!result.ok || !result.data) {
        setStatus({ ok: false, text: result.error ?? "Çeviri yapılamadı." });
        return;
      }
      setForm(result.data);
      setStatus({ ok: true, text: "Çeviri tamamlandı. İçeriği kontrol edip makaleyi kaydedin." });
    });
  }

  function remove() {
    if (!id || !window.confirm("Bu makale ve makale görselleri kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteArticle(id);
      if (!result.ok) setStatus({ ok: false, text: result.error ?? "Makale silinemedi." });
    });
  }

  const filled = (lang: Locale) => Boolean(form.title[lang] && form.excerpt[lang]);

  return (
    <div className="max-w-5xl space-y-6">
      <section className="space-y-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="article-slug" className={labelClass}>Adres (boşsa Türkçe başlıktan üretilir)</label>
            <input id="article-slug" value={form.slug} onChange={(event) => update("slug", event.target.value)} className={inputClass} placeholder="yazilimda-guvenli-yedekleme" />
          </div>
          <div>
            <label htmlFor="article-status" className={labelClass}>Yayın durumu</label>
            <select id="article-status" value={form.status} onChange={(event) => update("status", event.target.value as ArticleInput["status"])} className={inputClass}>
              <option value="draft">Taslak</option>
              <option value="published">Yayımla</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <ImageUploader url={form.coverUrl} folder="rovax/articles" ready={storageReady} label="Kapak görseli" successMessage="Kapak yüklendi. Makaleyi kaydetmeyi unutmayın." onChange={(url, publicId) => setForm((current) => ({ ...current, coverUrl: url, coverPublicId: publicId }))} onMessage={(ok, text) => setStatus({ ok, text })} />
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="sticky top-14 z-10 -mx-4 -mt-4 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6">
          <p className="mb-3 text-xs text-muted">Türkçe içeriği hazırlayın, diğer dillere otomatik çevirin ve gerekirse her dili elle düzenleyin.</p>
          <div className="mb-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => translate(false)} disabled={pending} className="inline-flex h-9 items-center gap-2 rounded-lg border border-accent/50 px-3 text-xs font-semibold text-accent transition-colors hover:bg-accent/10 disabled:opacity-50 sm:text-sm">
              <FiGlobe className="h-4 w-4" /> Boş dilleri Türkçeden çevir
            </button>
            <button type="button" onClick={() => translate(true)} disabled={pending} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:border-accent disabled:opacity-50 sm:text-sm">
              {pending ? "Çevriliyor..." : "Tüm dilleri yeniden çevir"}
            </button>
          </div>
          <div role="tablist" aria-label="Makale dili" className="flex gap-1 overflow-x-auto rounded-lg bg-background p-1">
            {locales.map((locale) => (
              <button key={locale} type="button" role="tab" aria-selected={language === locale} onClick={() => setLanguage(locale)} className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${language === locale ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}>
                {languageLabels[locale]}<span className={`h-1.5 w-1.5 rounded-full ${filled(locale) ? "bg-emerald-500" : "bg-foreground/30"}`} />
              </button>
            ))}
          </div>
        </div>
        <div dir={direction} className="space-y-4">
          <div>
            <label htmlFor="article-title" className={labelClass}>Başlık ({languageLabels[language]})</label>
            <input id="article-title" maxLength={180} value={form.title[language]} onChange={(event) => updateLocalized("title", event.target.value)} className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="article-category" className={labelClass}>Kategori ({languageLabels[language]})</label>
              <input id="article-category" maxLength={120} value={form.category[language]} onChange={(event) => updateLocalized("category", event.target.value)} className={inputClass} placeholder="Yazılım, Donanım, İşletme" />
            </div>
            <div>
              <label htmlFor="article-cover-alt" className={labelClass}>Kapak görseli açıklaması ({languageLabels[language]})</label>
              <input id="article-cover-alt" maxLength={240} value={form.coverAlt[language]} onChange={(event) => updateLocalized("coverAlt", event.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label htmlFor="article-excerpt" className={labelClass}>Kısa özet ({languageLabels[language]})</label>
            <textarea id="article-excerpt" rows={3} maxLength={500} value={form.excerpt[language]} onChange={(event) => updateLocalized("excerpt", event.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="article-tags" className={labelClass}>Etiketler (virgülle ayırın)</label>
            <input id="article-tags" value={form.tags} onChange={(event) => update("tags", event.target.value)} className={inputClass} placeholder="Yazılım, Güvenlik, KOBİ" />
          </div>
          <div>
            <p className={labelClass}>Makale gövdesi ({languageLabels[language]})</p>
            <ArticleEditor key={language} value={form.body[language] ?? blankDoc()} direction={direction} onChange={(body) => update("body", { ...form.body, [language]: body })} />
          </div>
        </div>
      </section>

      {status && <p role={status.ok ? "status" : "alert"} className={`text-sm ${status.ok ? "text-emerald-500" : "text-red-500"}`}>{status.text}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={save} disabled={pending} className="button-primary inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold disabled:opacity-60">{pending ? "Kaydediliyor..." : form.status === "published" ? "Kaydet ve yayımla" : "Taslağı kaydet"}</button>
        {id && <button type="button" onClick={remove} disabled={pending} className="inline-flex h-11 items-center rounded-xl border border-red-500/40 px-5 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50">Sil</button>}
      </div>
    </div>
  );
}
