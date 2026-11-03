"use client";

import { useState } from "react";
import { FiMapPin } from "react-icons/fi";

type Props = { query: string; lang: string; title: string; showLabel: string; note: string };

// Google Maps yalnızca ziyaretçi isteyince yüklenir; böylece üçüncü tarafa kendiliğinden veri gitmez.
export function MapEmbed({ query, lang, title, showLabel, note }: Props) {
  const [shown, setShown] = useState(false);

  if (shown) {
    return (
      <iframe
        title={title}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=${lang}&z=14&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-56 w-full border-0"
      />
    );
  }

  return (
    <div className="relative flex h-56 flex-col items-center justify-center gap-3 overflow-hidden bg-gradient-to-br from-accent/15 via-surface to-accent-2/20 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-accent-foreground shadow-lg shadow-accent/30">
        <FiMapPin className="h-6 w-6" aria-hidden="true" />
      </span>
      <button type="button" onClick={() => setShown(true)} className="button-primary inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold">
        {showLabel}
      </button>
      <p className="max-w-xs text-xs text-muted">{note}</p>
    </div>
  );
}
