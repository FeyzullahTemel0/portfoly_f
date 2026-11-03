"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { pageKeyFromPath, type AdPosition } from "@/lib/ads";

type ServedAd = { id: string; image: string; mobileImage: string; alt: string; desktop: [number, number]; mobile: [number, number]; maxWidth: number; maxHeight: number; mobileMaxWidth: number };

const labels: Record<string, string> = { tr: "Reklam", en: "Ad", de: "Anzeige", fr: "Publicité", ar: "إعلان" };

type Props = { position: AdPosition; lang: string; className?: string };

// Seçili sayfa ve konuma atanmış reklamı getirir; ışıklı ve kalp gibi atan çerçeveyle gösterir.
export function AdSlot({ position, lang, className = "" }: Props) {
  const pathname = usePathname();
  const requestKey = `${pageKeyFromPath(pathname)}:${position}`;
  const [served, setServed] = useState<{ key: string; ad: ServedAd | null } | null>(null);
  const ad = served?.key === requestKey ? served.ad : null;
  const box = useRef<HTMLAnchorElement>(null);
  const counted = useRef<string>("");

  useEffect(() => {
    let cancelled = false;
    const [page, pos] = requestKey.split(":");
    fetch(`/api/ads/serve?page=${page}&pos=${pos}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setServed({ key: requestKey, ad: data.ad ?? null });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  useEffect(() => {
    const element = box.current;
    if (!ad || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && counted.current !== ad.id) {
          counted.current = ad.id;
          void fetch("/api/ads/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: ad.id }), keepalive: true }).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ad]);

  if (!ad) return null;

  const [dw, dh] = ad.desktop;
  const [mw, mh] = ad.mobileImage ? ad.mobile : ad.desktop;
  // Görsel kendi oranında gösterilir; konumun önerilen genişliğini ve makul bir yüksekliği aşmaz.
  const maxD = Math.round(Math.min(ad.maxWidth, ad.maxHeight * (dw / dh)));
  const maxM = Math.round(Math.min(ad.mobileMaxWidth, 360 * (mw / mh)));
  const style = { "--ar-d": `${dw} / ${dh}`, "--ar-m": `${mw} / ${mh}`, "--max-d": `${maxD}px`, "--max-m": `${maxM}px` } as CSSProperties;

  return (
    <aside aria-label={labels[lang] ?? "Ad"} className={`mx-auto w-full px-4 py-5 sm:px-6 ${className}`}>
      <div className="ad-wrap mx-auto" style={style}>
        <p className="mb-1.5 text-right text-[10px] font-semibold uppercase tracking-widest text-muted rtl:text-left">{labels[lang] ?? "Ad"}</p>
        <a ref={box} href={`/api/ads/click/${ad.id}`} target="_blank" rel="sponsored nofollow noopener noreferrer" className="ad-frame block">
          <span className="ad-inner ad-ratio relative block">
            <picture>
              {ad.mobileImage && <source media="(max-width: 639px)" srcSet={ad.mobileImage} />}
              <Image src={ad.image} alt={ad.alt} fill sizes="(min-width: 640px) 970px, 100vw" className="object-cover" unoptimized />
            </picture>
          </span>
        </a>
      </div>
    </aside>
  );
}
