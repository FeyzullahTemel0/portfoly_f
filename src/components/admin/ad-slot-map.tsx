"use client";

import { useState } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { AD_PAGES, AD_SLOTS, placementKey, slotCapacity, type AdSlotKey } from "@/lib/ads";

type Props = {
  occupancy: Record<string, number>;
  selected?: string[];
  onPick: (placement: string) => void;
  initialPage?: string;
  hint?: string;
};

function SlotBox({ page, slot, occupancy, selected, onPick, className = "" }: { page: string; slot: AdSlotKey; occupancy: Record<string, number>; selected: string[]; onPick: (placement: string) => void; className?: string }) {
  const placement = placementKey(page, slot);
  const used = occupancy[placement] ?? 0;
  const capacity = slotCapacity(slot);
  const full = used >= capacity;
  const chosen = selected.includes(placement);
  const spec = AD_SLOTS[slot];

  return (
    <button
      type="button"
      onClick={() => onPick(placement)}
      aria-pressed={chosen}
      title={`${spec.label} — ${spec.size[0]}×${spec.size[1]}`}
      className={`relative flex w-full flex-col items-center justify-center rounded-lg border-2 px-3 py-3 text-center transition-all ${
        chosen ? "border-solid border-accent bg-accent/20 shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_25%,transparent)]" : full ? "border-dashed border-amber-500/60 bg-amber-500/10" : "border-dashed border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20"
      } ${className}`}
    >
      <span className="text-xs font-bold">{spec.label}</span>
      <span className="text-[10px] text-muted">{spec.size[0]}×{spec.size[1]}</span>
      <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${used > 0 ? (full ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600") : "bg-foreground/10 text-muted"}`}>
        {used > 0 ? `${used}/${capacity} dolu` : "Boş"}
      </span>
      <span aria-hidden="true" className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-accent">
        {chosen ? <FiCheck className="h-3 w-3" /> : <FiPlus className="h-3 w-3" />}
      </span>
    </button>
  );
}

// Sayfa sekmeleri ve sayfanın şematik yerleşimi; reklam konumları tıklanarak seçilir.
export function AdSlotMap({ occupancy, selected = [], onPick, initialPage = "home", hint }: Props) {
  const [pageKey, setPageKey] = useState(initialPage);
  const page = AD_PAGES.find((item) => item.key === pageKey) ?? AD_PAGES[0];

  return (
    <div>
      <div role="tablist" className="mb-3 flex flex-wrap gap-2">
        {AD_PAGES.map((item) => {
          const count = selected.filter((placement) => placement.startsWith(`${item.key}:`)).length;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={item.key === page.key}
              onClick={() => setPageKey(item.key)}
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${item.key === page.key ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-accent"}`}
            >
              {item.label}
              {count > 0 && <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-md space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[11px] text-muted">
            <span className="flex gap-1"><i className="h-2 w-2 rounded-full bg-foreground/20" /><i className="h-2 w-2 rounded-full bg-foreground/20" /><i className="h-2 w-2 rounded-full bg-foreground/20" /></span>
            rovaxsoftware.com{page.url}
          </div>
          {page.rows.map((row, index) => {
            if (row.kind === "chrome") return <div key={index} className="rounded-lg bg-foreground px-3 py-2.5 text-center text-xs font-semibold text-background">{row.label}</div>;
            if (row.kind === "box") return <div key={index} className="rounded-lg border border-border bg-surface px-3 py-3 text-center text-xs font-medium text-muted">{row.label}</div>;
            if (row.kind === "slot") return <SlotBox key={index} page={page.key} slot={row.slot} occupancy={occupancy} selected={selected} onPick={onPick} />;
            if (row.kind !== "split") return null;
            return (
              <div key={index} className="grid grid-cols-[1fr_7.5rem] gap-2">
                <div className="flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-6 text-center text-xs font-medium text-muted">{row.label}</div>
                <SlotBox page={page.key} slot={row.slot} occupancy={occupancy} selected={selected} onPick={onPick} className="min-h-32" />
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-muted">{hint ?? "Renkli kesikli alanlar reklam konumlarıdır. Seçmek için dokunun."}</p>
      </div>
    </div>
  );
}
