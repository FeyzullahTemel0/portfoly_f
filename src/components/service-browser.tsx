"use client";

import { useState } from "react";
import { FiCpu, FiGlobe, FiShoppingBag } from "react-icons/fi";
import type { Locale } from "@/lib/locales";
import type { ServiceGroup } from "@/lib/service-groups";
import { ServiceCard } from "@/components/service-card";
import { iconKey } from "@/components/home/icons";

const icons = { web: FiGlobe, automation: FiCpu, ecommerce: FiShoppingBag } as const;

export function ServiceBrowser({ groups, more, lang }: { groups: ServiceGroup[]; more: string; lang: Locale }) {
  const [selected, setSelected] = useState("all");
  const allLabel: Record<Locale, string> = { tr: "Tüm çözümler", en: "All solutions", de: "Alle Lösungen", fr: "Toutes les solutions", ar: "كل الحلول" };
  const visible = selected === "all" ? groups.flatMap((group) => group.items.map((item) => ({ item, category: group.key }))) : groups.find((group) => group.key === selected)?.items.map((item) => ({ item, category: selected })) ?? [];
  const filters = [{ key: "all", label: allLabel[lang] }, ...groups.map((group) => ({ key: group.key, label: group.heading }))];

  return (
    <div>
      <div role="tablist" aria-label={allLabel[lang]} className="mb-5 flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1 sm:mb-8 sm:w-fit">
        {filters.map((filter) => {
          const Icon = filter.key === "all" ? FiGlobe : icons[filter.key as keyof typeof icons];
          return (
            <button key={filter.key} type="button" role="tab" aria-selected={selected === filter.key} onClick={() => setSelected(filter.key)} className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors sm:h-10 sm:px-4 sm:text-sm ${selected === filter.key ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />{filter.label}
            </button>
          );
        })}
      </div>
      <div className="grid items-stretch gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 2xl:grid-cols-4">
        {visible.map(({ item }) => (
          <ServiceCard key={item.slug} href={`/${lang}/services/${item.slug}`} slug={iconKey(item as { slug: string; icon?: string })} title={item.title} summary={item.summary} imageUrl={(item as { imageUrl?: string }).imageUrl} price={(item as { price?: { mode: string; amount: number; currency: string } }).price} more={more} lang={lang} />
        ))}
      </div>
    </div>
  );
}
