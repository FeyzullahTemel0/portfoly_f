"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setAdActive } from "../manage-actions";

export function AdActiveToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? "Yayından kaldır" : "Yayına al"}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setAdActive(id, !active);
          router.refresh();
        })
      }
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${active ? "bg-emerald-500" : "bg-foreground/25"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${active ? "left-[1.375rem]" : "left-0.5"}`} />
    </button>
  );
}
