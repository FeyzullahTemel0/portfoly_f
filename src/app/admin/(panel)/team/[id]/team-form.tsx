"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { deleteTeamMember, saveTeamMember, type TeamMemberInput } from "../../actions";

type Props = { id: string | null; initial: TeamMemberInput; cloudinaryReady: boolean };

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
const labelClass = "mb-1 block text-xs font-medium text-muted";

export function TeamForm({ id, initial, cloudinaryReady }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof TeamMemberInput>(key: K, value: TeamMemberInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  };

  function save() {
    startTransition(async () => {
      const result = await saveTeamMember(id, form);
      if (result.ok) {
        router.push("/admin/team");
        router.refresh();
      } else {
        setStatus({ ok: false, text: result.error ?? "Hata oluştu." });
      }
    });
  }

  function remove() {
    if (!id || !window.confirm("Bu ekip üyesi ve fotoğrafı kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteTeamMember(id);
      if (result && !result.ok) setStatus({ ok: false, text: result.error ?? "Silinemedi." });
    });
  }

  return (
    <div className="max-w-3xl space-y-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <ImageUploader
        url={form.photoUrl}
        folder="temeloji/team"
        ready={cloudinaryReady}
        label="Fotoğraf"
        rounded
        onChange={(url, publicId) => setForm((current) => ({ ...current, photoUrl: url, photoPublicId: publicId }))}
        onMessage={(ok, text) => setStatus({ ok, text })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>Ad soyad *</label>
          <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="roleTr" className={labelClass}>Unvan (Türkçe)</label>
          <input id="roleTr" value={form.roleTr} onChange={(e) => set("roleTr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="roleEn" className={labelClass}>Unvan (İngilizce)</label>
          <input id="roleEn" value={form.roleEn} onChange={(e) => set("roleEn", e.target.value)} className={inputClass} />
        </div>
        <div><label htmlFor="roleDe" className={labelClass}>Unvan (Almanca)</label><input id="roleDe" value={form.roleDe} onChange={(e) => set("roleDe", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="roleFr" className={labelClass}>Unvan (Fransızca)</label><input id="roleFr" value={form.roleFr} onChange={(e) => set("roleFr", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="roleAr" className={labelClass}>Unvan (Arapça)</label><input id="roleAr" dir="rtl" value={form.roleAr} onChange={(e) => set("roleAr", e.target.value)} className={inputClass} /></div>
        <div>
          <label htmlFor="bioTr" className={labelClass}>Kısa tanıtım (Türkçe)</label>
          <textarea id="bioTr" rows={4} value={form.bioTr} onChange={(e) => set("bioTr", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="bioEn" className={labelClass}>Kısa tanıtım (İngilizce)</label>
          <textarea id="bioEn" rows={4} value={form.bioEn} onChange={(e) => set("bioEn", e.target.value)} className={inputClass} />
        </div>
        <div><label htmlFor="bioDe" className={labelClass}>Kısa tanıtım (Almanca)</label><textarea id="bioDe" rows={4} value={form.bioDe} onChange={(e) => set("bioDe", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="bioFr" className={labelClass}>Kısa tanıtım (Fransızca)</label><textarea id="bioFr" rows={4} value={form.bioFr} onChange={(e) => set("bioFr", e.target.value)} className={inputClass} /></div>
        <div><label htmlFor="bioAr" className={labelClass}>Kısa tanıtım (Arapça)</label><textarea id="bioAr" dir="rtl" rows={4} value={form.bioAr} onChange={(e) => set("bioAr", e.target.value)} className={inputClass} /></div>
        <div>
          <label htmlFor="linkedin" className={labelClass}>LinkedIn adresi</label>
          <input id="linkedin" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://" className={inputClass} />
        </div>
        <div>
          <label htmlFor="instagram" className={labelClass}>Instagram adresi</label>
          <input id="instagram" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="https://" className={inputClass} />
        </div>
        <div>
          <label htmlFor="x" className={labelClass}>X adresi</label>
          <input id="x" value={form.x} onChange={(e) => set("x", e.target.value)} placeholder="https://" className={inputClass} />
        </div>
        <div>
          <label htmlFor="order" className={labelClass}>Sıra (küçük olan önce gelir)</label>
          <input id="order" type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} className={inputClass} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Sitede göster
        </label>
      </div>

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
