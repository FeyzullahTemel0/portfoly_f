"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FiGlobe, FiPlus, FiTrash2 } from "react-icons/fi";
import { ImageUploader } from "@/components/admin/image-uploader";
import { siteImages } from "@/config/images";
import { CURRENCIES } from "@/lib/currency";
import { serviceIconKeys } from "@/components/home/icons";
import { deleteService, saveService, translateServiceContent, type ServiceInput } from "../../manage-actions";

type Block = ServiceInput["content"][string];
type Props = { id: string | null; initial: ServiceInput; storageReady: boolean };

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted";
const tabs = [
  { key: "tr", label: "Türkçe" },
  { key: "en", label: "English" },
  { key: "de", label: "Deutsch" },
  { key: "fr", label: "Français" },
  { key: "ar", label: "العربية" },
] as const;

const emptyBlock = (): Block => ({ title: "", summary: "", intro: "", notice: "", includes: [], notIncluded: [], suitable: [], steps: [] });
const lines = (value: string) => value.split("\n");

export function ServiceForm({ id, initial, storageReady }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [lang, setLang] = useState<string>("tr");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [auto, setAuto] = useState(true);
  const [pending, startTransition] = useTransition();
  const block = form.content[lang] ?? emptyBlock();

  const setMeta = <K extends keyof ServiceInput>(key: K, value: ServiceInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  };
  const setBlock = (patch: Partial<Block>) => {
    setForm((current) => ({ ...current, content: { ...current.content, [lang]: { ...(current.content[lang] ?? emptyBlock()), ...patch } } }));
    setStatus(null);
  };

  function translate(overwrite: boolean) {
    if (overwrite && !window.confirm("Diğer dillerdeki mevcut metinlerin üzerine yazılacak. Devam edilsin mi?")) return;
    startTransition(async () => {
      setStatus({ ok: true, text: "Çevriliyor, lütfen bekleyin..." });
      const result = await translateServiceContent(form.content, overwrite);
      if (result.ok) {
        setForm((current) => ({ ...current, content: result.data as ServiceInput["content"] }));
        setStatus({ ok: true, text: "Metinler 4 dile çevrildi. Kontrol edip Kaydet'e basın." });
      } else {
        setStatus({ ok: false, text: result.error ?? "Çeviri yapılamadı." });
      }
    });
  }

  function save() {
    startTransition(async () => {
      const result = await saveService(id, form, auto);
      if (result.ok) {
        if (result.error) setStatus({ ok: false, text: result.error });
        router.push("/admin/services");
        router.refresh();
      } else {
        setStatus({ ok: false, text: result.error ?? "Kaydedilemedi." });
      }
    });
  }

  function remove() {
    if (!id || !window.confirm("Bu hizmet kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteService(id);
      if (result.ok) {
        router.push("/admin/services");
        router.refresh();
      } else {
        setStatus({ ok: false, text: result.error ?? "Silinemedi." });
      }
    });
  }

  return (
    <div className="max-w-4xl space-y-8">
      <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">Genel ve fiyat</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="slug" className={labelClass}>Sayfa adresi (boşsa başlıktan üretilir)</label>
            <input id="slug" value={form.slug} onChange={(e) => setMeta("slug", e.target.value)} className={inputClass} placeholder="ornek-hizmet" />
          </div>
          <div>
            <label htmlFor="catalogCategory" className={labelClass}>Katalog kategorisi</label>
            <select id="catalogCategory" value={form.catalogCategory} onChange={(e) => setMeta("catalogCategory", e.target.value as ServiceInput["catalogCategory"])} className={inputClass}>
              <option value="web">Web çözümleri</option>
              <option value="automation">Otomasyon</option>
              <option value="ecommerce">E-ticaret</option>
            </select>
          </div>
          <div>
            <label htmlFor="icon" className={labelClass}>İkon</label>
            <select id="icon" value={form.icon} onChange={(e) => setMeta("icon", e.target.value)} className={inputClass}>
              <option value="">Otomatik</option>
              {serviceIconKeys.map((key) => <option key={key} value={key}>{key}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="order" className={labelClass}>Sıra (küçük olan önce)</label>
            <input id="order" type="number" value={form.order} onChange={(e) => setMeta("order", Number(e.target.value))} className={inputClass} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="priceMode" className={labelClass}>Fiyat gösterimi</label>
            <select id="priceMode" value={form.priceMode} onChange={(e) => setMeta("priceMode", e.target.value)} className={inputClass}>
              <option value="quote">Teklife göre (fiyat gösterme)</option>
              <option value="from">Başlangıç fiyatı (…&apos;dan başlayan)</option>
              <option value="fixed">Sabit fiyat</option>
            </select>
          </div>
          <div>
            <label htmlFor="priceAmount" className={labelClass}>Tutar</label>
            <input id="priceAmount" type="number" min={0} step="any" disabled={form.priceMode === "quote"} value={form.priceAmount} onChange={(e) => setMeta("priceAmount", Number(e.target.value))} className={`${inputClass} disabled:opacity-50`} />
          </div>
          <div>
            <label htmlFor="priceCurrency" className={labelClass}>Para birimi (giriş)</label>
            <select id="priceCurrency" value={form.priceCurrency} onChange={(e) => setMeta("priceCurrency", e.target.value)} className={inputClass}>
              {CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs text-muted">Fiyat, ziyaretçinin seçtiği para birimine güncel kurla otomatik çevrilerek gösterilir.</p>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={form.visible} onChange={(e) => setMeta("visible", e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
          Sitede görünsün
        </label>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">Hizmet görseli</h2>
        <p className="text-xs text-muted">Bu görsel hizmet kartında ve hizmet detayında kullanılır. Yüklemezseniz mevcut varsayılan fotoğraf gösterilir.</p>
        <ImageUploader
          url={form.imageUrl || siteImages.services[form.slug] || ""}
          folder="rovax/services"
          ready={storageReady}
          label="Kart ve detay görseli"
          onChange={(imageUrl, imagePublicId) => setForm((current) => ({ ...current, imageUrl, imagePublicId }))}
          onMessage={(ok, text) => setStatus({ ok, text })}
        />
      </section>

      <section className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">İçerik</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => translate(false)} disabled={pending} className="inline-flex h-9 items-center gap-2 rounded-lg border border-accent/50 px-3 text-sm font-medium text-accent hover:bg-accent/10 disabled:opacity-50">
              <FiGlobe className="h-4 w-4" /> Boş dilleri otomatik çevir
            </button>
            <button type="button" onClick={() => translate(true)} disabled={pending} className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm hover:border-accent disabled:opacity-50">
              Tümünü yeniden çevir
            </button>
          </div>
        </div>
        <p className="text-xs text-muted">Önce Türkçe metni girin. Diğer diller Kaydet sırasında otomatik doldurulur; her dili elle de düzenleyebilirsiniz. Boş kalan alanlar sitede İngilizce/Türkçe ile tamamlanır.</p>

        <div role="tablist" className="flex gap-1 overflow-x-auto rounded-xl bg-background p-1">
          {tabs.map((tab) => {
            const filled = !!form.content[tab.key]?.title;
            return (
              <button key={tab.key} type="button" role="tab" aria-selected={lang === tab.key} onClick={() => setLang(tab.key)} className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${lang === tab.key ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}>
                {tab.label}
                <span className={`h-1.5 w-1.5 rounded-full ${filled ? "bg-emerald-400" : "bg-foreground/30"}`} />
              </button>
            );
          })}
        </div>

        <div dir={lang === "ar" ? "rtl" : "ltr"} className="space-y-4">
          <div>
            <label className={labelClass}>Başlık {lang === "tr" && "*"}</label>
            <input value={block.title} onChange={(e) => setBlock({ title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Kısa özet (kartlarda görünür)</label>
            <textarea rows={2} value={block.summary} onChange={(e) => setBlock({ summary: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Giriş metni</label>
            <textarea rows={4} value={block.intro} onChange={(e) => setBlock({ intro: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Uyarı / not (isteğe bağlı)</label>
            <textarea rows={2} value={block.notice} onChange={(e) => setBlock({ notice: e.target.value })} className={inputClass} />
          </div>
          {([["includes", "Neler dahil? (her satıra bir madde)"], ["notIncluded", "Neler dahil değil? (her satıra bir madde)"], ["suitable", "Kimler için uygun? (her satıra bir madde)"]] as const).map(([key, label]) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <textarea rows={4} value={block[key].join("\n")} onChange={(e) => setBlock({ [key]: lines(e.target.value) } as Partial<Block>)} className={inputClass} />
            </div>
          ))}
          <div>
            <p className={labelClass}>Süreç adımları</p>
            <div className="space-y-3">
              {block.steps.map((step, index) => (
                <div key={index} className="space-y-2 rounded-xl border border-border bg-background p-3">
                  <div className="flex gap-2">
                    <input value={step.title} placeholder={`${index + 1}. adım başlığı`} onChange={(e) => setBlock({ steps: block.steps.map((item, i) => (i === index ? { ...item, title: e.target.value } : item)) })} className={inputClass} />
                    <button type="button" aria-label="Adımı sil" onClick={() => setBlock({ steps: block.steps.filter((_, i) => i !== index) })} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-red-500 hover:border-red-500"><FiTrash2 className="h-4 w-4" /></button>
                  </div>
                  <textarea rows={2} value={step.text} placeholder="Adım açıklaması" onChange={(e) => setBlock({ steps: block.steps.map((item, i) => (i === index ? { ...item, text: e.target.value } : item)) })} className={inputClass} />
                </div>
              ))}
              <button type="button" onClick={() => setBlock({ steps: [...block.steps, { title: "", text: "" }] })} className="inline-flex h-9 items-center gap-2 rounded-lg border border-dashed border-border px-4 text-sm text-muted hover:border-accent hover:text-accent"><FiPlus className="h-4 w-4" /> Adım ekle</button>
            </div>
          </div>
        </div>
      </section>

      {status && <p role={status.ok ? "status" : "alert"} className={`text-sm ${status.ok ? "text-emerald-500" : "text-red-500"}`}>{status.text}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={save} disabled={pending} className="button-primary inline-flex h-11 items-center rounded-xl px-7 text-sm font-semibold disabled:opacity-60">{pending ? "Bekleyin..." : "Kaydet"}</button>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Kaydederken boş dilleri otomatik çevir
        </label>
        {id && <button type="button" onClick={remove} disabled={pending} className="ml-auto inline-flex h-11 items-center rounded-xl border border-red-500/50 px-5 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-60">Sil</button>}
      </div>
    </div>
  );
}
