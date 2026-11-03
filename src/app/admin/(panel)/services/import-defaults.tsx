"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FiDownload } from "react-icons/fi";
import { importDefaultServices } from "../manage-actions";

export function ImportDefaults() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await importDefaultServices();
            setMessage(result.ok ? `${(result.data as { added: number }).added} hazır hizmet eklendi.` : result.error ?? "Aktarılamadı.");
            router.refresh();
          })
        }
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-60"
      >
        <FiDownload className="h-4 w-4" /> {pending ? "Aktarılıyor..." : "Hazır hizmetleri içe aktar"}
      </button>
      {message && <span role="status" className="text-sm text-muted">{message}</span>}
    </div>
  );
}
