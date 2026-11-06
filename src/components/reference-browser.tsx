"use client";

import Link from "next/link";
import { useState } from "react";
import { ReferenceLogo } from "@/components/reference-logo";
import { Reveal } from "@/components/reveal";
import type { Locale } from "@/lib/locales";
import type { PublicReference } from "@/lib/references";
import { referenceUi } from "@/lib/reference-ui";
import { safeUrl } from "@/lib/site";

export function ReferenceBrowser({
  items,
  lang,
  emptyLabel,
  detailLabel,
  visitLabel,
}: {
  items: PublicReference[];
  lang: Locale;
  emptyLabel: string;
  detailLabel: string;
  visitLabel: string;
}) {
  const [selectedLocation, setSelectedLocation] = useState("");
  const ui = referenceUi[lang];
  const locations = Array.from(new Set(items.map((item) => item.location.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, lang));
  const filteredItems = selectedLocation ? items.filter((item) => item.location.trim() === selectedLocation) : items;

  if (items.length === 0) {
    return <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">{emptyLabel}</p>;
  }

  return (
    <>
      {locations.length > 0 && (
        <div className="mb-6 flex flex-col gap-2 sm:max-w-xs">
          <label htmlFor="reference-location" className="text-sm font-semibold">{ui.location}</label>
          <select
            id="reference-location"
            value={selectedLocation}
            onChange={(event) => setSelectedLocation(event.target.value)}
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-accent"
          >
            <option value="">{ui.allLocations}</option>
            {locations.map((location) => <option key={location} value={location}>{location}</option>)}
          </select>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">{ui.noLocationResults}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filteredItems.map((item, index) => {
            const website = safeUrl(item.website);
            const content = (
              <>
                <span className="flex h-16 items-center justify-center overflow-hidden rounded-lg bg-white p-3 ring-1 ring-black/5 sm:h-24 sm:rounded-xl sm:p-4">
                  <ReferenceLogo reference={item} variant="tile" />
                </span>
                <h2 className="mt-3 text-base font-bold sm:mt-5 sm:text-xl">{item.name}</h2>
                {item.sector && <p className="text-xs font-semibold text-accent sm:text-sm">{item.sector}</p>}
                {item.location && <p className="mt-1 text-xs font-medium text-muted">{item.location}</p>}
                {(item.tagline || item.description) && <p className="mt-2 line-clamp-3 flex-1 text-xs leading-5 text-muted sm:mt-3 sm:line-clamp-4 sm:text-sm sm:leading-6">{item.tagline || item.description}</p>}
              </>
            );
            return (
              <Reveal key={item.id} delay={(index % 6) * 0.05} className="h-full">
                <article className="card-glow flex h-full flex-col rounded-xl border border-border bg-surface p-3 sm:rounded-2xl sm:p-5">
                  {item.slug ? (
                    <Link href={`/${lang}/references/${item.slug}`} className="group flex flex-1 flex-col rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent">
                      {content}
                      <span className="mt-3 text-xs font-semibold text-accent group-hover:underline sm:mt-4 sm:text-sm">{detailLabel} →</span>
                    </Link>
                  ) : (
                    <div className="flex flex-1 flex-col">{content}</div>
                  )}
                  {website && (
                    <a href={website} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs font-semibold text-muted hover:text-accent hover:underline sm:mt-3 sm:text-sm">
                      {visitLabel} →
                    </a>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      )}
    </>
  );
}