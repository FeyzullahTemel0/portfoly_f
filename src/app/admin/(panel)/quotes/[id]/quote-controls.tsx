"use client";

import { useState, useTransition } from "react";
import { statusLabels } from "@/lib/admin-ui";
import { deleteQuote, updateQuote } from "../../actions";

type Props = { id: string; status: string; note: string; statuses: readonly string[] };

export function QuoteControls({ id, status, note, statuses }: Props) {
  const [currentStatus, setStatus] = useState(status);
  const [currentNote, setNote] = useState(note);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateQuote(id, currentStatus, currentNote);
      setMessage({ ok: result.ok, text: result.ok ? "Kaydedildi." : (result.error ?? "Hata oluştu.") });
    });
  }

  function remove() {
    if (!window.confirm("Bu talep kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteQuote(id);
      if (result && !result.ok) setMessage({ ok: false, text: result.error ?? "Silinemedi." });
    });
  }

  return (
    <div className="space-y-5 rounded-xl border border-border bg-surface p-5">
      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium">Durum</label>
        <select
          id="status"
          value={currentStatus}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {statuses.map((value) => (
            <option key={value} value={value}>{statusLabels[value]}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="note" className="mb-1.5 block text-sm font-medium">Özel not</label>
        <textarea
          id="note"
          rows={5}
          value={currentNote}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Görüşme notları, verilen teklif tutarı..."
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </div>
      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-emerald-500" : "text-red-500"}`}>{message.text}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          Kaydet
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-red-500 transition-colors hover:border-red-500 disabled:opacity-60"
        >
          Sil
        </button>
      </div>
    </div>
  );
}
