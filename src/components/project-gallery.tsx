"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

type Props = { images: string[]; alt: string };

export function ProjectGallery({ images, alt }: Props) {
  const [index, setIndex] = useState<number | null>(null);

  const move = useCallback(
    (step: number) => setIndex((current) => (current === null ? null : (current + step + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIndex(null);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "ArrowLeft") move(-1);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, move]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${alt} ${i + 1}`}
            className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-surface"
          >
            <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="(min-width: 1024px) 360px, 50vw" className="object-contain" />
          </button>
        ))}
      </div>

      {index !== null && (
        <div role="dialog" aria-modal="true" aria-label={alt} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <button type="button" aria-label="Kapat" onClick={() => setIndex(null)} className="absolute inset-0 cursor-zoom-out" />
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image src={images[index]} alt={`${alt} ${index + 1}`} fill sizes="100vw" className="object-contain" priority />
          </div>
          <button type="button" aria-label="Kapat" onClick={() => setIndex(null)} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
            <FiX className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button type="button" aria-label="Önceki" onClick={() => move(-1)} className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                <FiChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" aria-label="Sonraki" onClick={() => move(1)} className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25">
                <FiChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
