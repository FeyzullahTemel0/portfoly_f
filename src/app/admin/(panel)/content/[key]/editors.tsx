"use client";

import { useState, useTransition } from "react";
import { FiRotateCcw, FiSave } from "react-icons/fi";
import { Node, type Json } from "@/components/admin/json-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import { resetContent, saveAboutPhoto, saveContent, saveSettings } from "../../actions";

type Common = { labels: Record<string, string>; templates: Record<string, Json> };
type Status = { ok: boolean; text: string } | null;
type ProfilePhoto = { url: string; publicId: string };

function StatusMessage({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <p role="status" className={`text-sm font-medium ${status.ok ? "text-emerald-500" : "text-red-500"}`}>
      {status.text}
    </p>
  );
}

const primaryButton =
  "inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60";
const secondaryButton =
  "inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-60";

export function ContentEditor({ sectionKey, initial, labels, templates, profilePhoto, cloudinaryReady }: Common & { sectionKey: string; initial: { tr: Json; en: Json }; profilePhoto: ProfilePhoto; cloudinaryReady: boolean }) {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [data, setData] = useState(initial);
  const [photo, setPhoto] = useState(profilePhoto);
  const [status, setStatus] = useState<Status>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await saveContent(lang, sectionKey, data[lang]);
      setStatus({ ok: result.ok, text: result.ok ? "Kaydedildi. Site güncellendi." : (result.error ?? "Hata oluştu.") });
    });
  }

  function reset() {
    if (!window.confirm("Bu dildeki değişiklikler silinip varsayılan metinlere dönülecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await resetContent(lang, sectionKey);
      if (result.ok) setData((current) => ({ ...current, [lang]: result.data as Json }));
      setStatus({ ok: result.ok, text: result.ok ? "Varsayılana dönüldü." : (result.error ?? "Hata oluştu.") });
    });
  }

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
        <div role="tablist" className="inline-flex rounded-lg border border-border bg-surface p-1">
          {(["tr", "en"] as const).map((code) => (
            <button
              key={code}
              type="button"
              role="tab"
              aria-selected={lang === code}
              onClick={() => { setLang(code); setStatus(null); }}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${lang === code ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}
            >
              {code === "tr" ? "Türkçe" : "English"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusMessage status={status} />
          <button type="button" onClick={reset} disabled={pending} className={secondaryButton}>
            <FiRotateCcw className="h-4 w-4" aria-hidden="true" /> Varsayılana dön
          </button>
          <button type="button" onClick={save} disabled={pending} className={primaryButton}>
            <FiSave className="h-4 w-4" aria-hidden="true" /> {pending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl rounded-xl border border-border bg-surface p-5 sm:p-6">
        {sectionKey === "about" && (
          <div className="mb-6 rounded-lg border border-border bg-background p-4">
            <ImageUploader
              url={photo.url}
              folder="temeloji/profile"
              ready={cloudinaryReady}
              label="Profil fotoğrafı"
              rounded
              successMessage="Profil fotoğrafı yüklendi ve kaydedildi."
              removeMessage="Profil fotoğrafı kaldırıldı."
              onChange={async (url, publicId) => {
                const result = await saveAboutPhoto(url, publicId);
                if (!result.ok) throw new Error(result.error ?? "Profil fotoğrafı kaydedilemedi.");
                setPhoto({ url, publicId });
              }}
              onMessage={(ok, text) => setStatus({ ok, text })}
            />
          </div>
        )}
        <Node
          key={lang}
          value={data[lang]}
          name={sectionKey}
          path={[]}
          ctx={{ labels, templates }}
          depth={0}
          onChange={(next) => { setData((current) => ({ ...current, [lang]: next })); setStatus(null); }}
        />
      </div>
    </div>
  );
}

export function SettingsEditor({ initial, labels, templates }: Common & { initial: Json }) {
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState<Status>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await saveSettings(data);
      setStatus({ ok: result.ok, text: result.ok ? "Kaydedildi. Site güncellendi." : (result.error ?? "Hata oluştu.") });
    });
  }

  return (
    <div>
      <div className="max-w-3xl rounded-xl border border-border bg-surface p-5 sm:p-6">
        <Node value={data} name="settings" path={[]} ctx={{ labels, templates, hiddenRootKeys: ["seo"] }} depth={0} onChange={(next) => { setData(next); setStatus(null); }} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={pending} className={primaryButton}>
          <FiSave className="h-4 w-4" aria-hidden="true" /> {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <StatusMessage status={status} />
      </div>
    </div>
  );
}
