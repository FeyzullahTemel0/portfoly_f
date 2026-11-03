"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AdCardContent } from "@/components/ad-card";
import { pageKeyFromPath, type AdSlotKey } from "@/lib/ads";

type ServedAd = { id: string; sponsor: string; title: string; description: string; image: string; width: number; height: number };
type Served = { key: string; slot: AdSlotKey; size: [number, number]; vertical: boolean; ads: ServedAd[] };

const labels: Record<string, string> = { tr: "Reklam", en: "Ad", de: "Anzeige", fr: "Publicité", ar: "إعلان" };

function Tile({ ad, style, sizes }: { ad: ServedAd; style: CSSProperties; sizes: string }) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        void fetch("/api/ads/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ad.id }), keepalive: true }).catch(() => {});
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ad.id]);

  return (
    <a ref={ref} href={`/api/ads/click/${ad.id}`} target="_blank" rel="sponsored nofollow noopener noreferrer" className="ad-frame block h-full" aria-label={ad.title || ad.sponsor}>
      <span className="ad-inner ad-ratio relative block" style={style}>
        <AdCardContent ad={ad} sizes={sizes} />
      </span>
    </a>
  );
}

type Props = { position: AdSlotKey; lang: string; className?: string };

// Seçili sayfa ve konuma atanmış reklamları (yatayda 4'e kadar yan yana) ışıklı çerçeveyle gösterir.
export function AdSlot({ position, lang, className = "" }: Props) {
  const pathname = usePathname();
  const requestKey = `${pageKeyFromPath(pathname)}:${position}`;
  const [served, setServed] = useState<Served | null>(null);

  useEffect(() => {
    let cancelled = false;
    const [page, pos] = requestKey.split(":");
    fetch(`/api/ads/serve?page=${page}&pos=${pos}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setServed({ ...data, key: requestKey });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  if (!served || served.key !== requestKey || served.ads.length === 0) return null;

  const { ads, size, vertical } = served;
  const count = ads.length;
  const label = labels[lang] ?? "Ad";

  let wrapStyle: CSSProperties;
  let tileStyle: (ad: ServedAd) => CSSProperties = () => ({});
  if (vertical) {
    wrapStyle = { "--max-d": `${size[0]}px`, "--max-m": `${size[0]}px` } as CSSProperties;
    tileStyle = (ad) => {
      const ratio = ad.image && ad.width && ad.height ? `${ad.width} / ${ad.height}` : "300 / 250";
      return { "--ar-d": ratio, "--ar-m": ratio } as CSSProperties;
    };
  } else if (count === 1) {
    const ad = ads[0];
    const natural = ad.image && ad.width && ad.height ? ad.width / ad.height : size[0] / size[1];
    const maxH = Math.max(180, Math.min(600, size[1] * 2));
    const maxD = Math.round(Math.min(size[0], maxH * natural));
    wrapStyle = { "--max-d": `${maxD}px`, "--max-m": `${Math.round(Math.min(560, 340 * natural))}px` } as CSSProperties;
    tileStyle = () => ({ "--ar-d": `${natural}`, "--ar-m": `${Math.max(natural, 2.2)}` }) as CSSProperties;
  } else {
    wrapStyle = { "--max-d": `${size[0]}px`, "--max-m": "560px" } as CSSProperties;
    const ratio = size[0] / count / size[1];
    tileStyle = () => ({ "--ar-d": `${ratio}`, "--ar-m": "2" }) as CSSProperties;
  }

  const columns = vertical || count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : count === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4";

  return (
    <aside aria-label={label} className={`mx-auto w-full px-4 py-5 sm:px-6 ${className}`}>
      <div className="ad-wrap mx-auto" style={wrapStyle}>
        <p className="mb-1.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted rtl:text-left">{label}</p>
        <div className={`grid gap-3 ${columns}`}>
          {ads.map((ad) => (
            <Tile key={ad.id} ad={ad} style={tileStyle(ad)} sizes={count > 1 ? "(min-width: 1024px) 300px, 50vw" : "(min-width: 1024px) 1000px, 100vw"} />
          ))}
        </div>
      </div>
    </aside>
  );
}
