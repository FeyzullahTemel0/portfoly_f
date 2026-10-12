"use client";

import { useTransition } from "react";
import { clearAccessLogs } from "../actions";

export function ClearAccessLogsButton() {
  const [pending, startTransition] = useTransition();
  function clear() {
    if (!window.confirm("Son 30 güne ait ziyaret ve güvenlik kayıtları kalıcı olarak silinecek. Devam edilsin mi?")) return;
    startTransition(async () => {
      const result = await clearAccessLogs();
      if (!result.ok) window.alert(result.error ?? "Kayıtlar temizlenemedi.");
    });
  }
  return (
    <button type="button" onClick={clear} disabled={pending} className="inline-flex h-9 items-center rounded-md border border-border px-3 text-xs font-semibold text-muted transition hover:border-red-500 hover:text-red-500 disabled:opacity-50">
      {pending ? "Temizleniyor..." : "Kayıtları temizle"}
    </button>
  );
}
