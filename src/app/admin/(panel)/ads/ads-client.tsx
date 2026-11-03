"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FiEdit2, FiPause, FiPlay, FiTrash2 } from "react-icons/fi";
import { AdSlotMap } from "@/components/admin/ad-slot-map";
import { deleteAd, setAdActive } from "../ads-actions";

export function SlotOverview({ occupancy }: { occupancy: Record<string, number> }) {
  const router = useRouter();
  return <AdSlotMap occupancy={occupancy} onPick={(placement) => router.push(`/admin/ads/new?placement=${encodeURIComponent(placement)}`)} hint="Boş bir alana dokunun ve o alan için reklam ekleyin. Yatay konumlara en fazla 4 reklam eklenebilir (2-4 reklam eşit genişlikte yan yana görünür). Dikey konumda tek reklam gösterilir." />;
}

export function AdRowActions({ id, active, editable }: { id: string; active: boolean; editable: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggle() {
    startTransition(async () => {
      const result = await setAdActive(id, !active);
      setError(result.ok ? "" : result.error ?? "Güncellenemedi.");
      router.refresh();
    });
  }

  function remove() {
    if (!window.confirm("Bu reklam ve görseli kalıcı olarak silinecek. Emin misiniz?")) return;
    startTransition(async () => {
      const result = await deleteAd(id);
      setError(result.ok ? "" : result.error ?? "Silinemedi.");
      router.refresh();
    });
  }

  const button = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold transition-colors disabled:opacity-60";
  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap justify-end gap-2">
        {editable && (
          <button type="button" onClick={toggle} disabled={pending} className={`${button} hover:border-accent hover:text-accent`}>
            {active ? <FiPause className="h-3.5 w-3.5" /> : <FiPlay className="h-3.5 w-3.5" />} {active ? "Durdur" : "Yayınla"}
          </button>
        )}
        <Link href={`/admin/ads/${id}`} className={`${button} hover:border-accent hover:text-accent`}><FiEdit2 className="h-3.5 w-3.5" /> Düzenle</Link>
        <button type="button" onClick={remove} disabled={pending} className={`${button} border-red-500/40 text-red-500 hover:bg-red-500/10`}><FiTrash2 className="h-3.5 w-3.5" /> Sil</button>
      </div>
      {error && <p role="alert" className="max-w-xs text-right text-xs text-red-500">{error}</p>}
    </div>
  );
}
