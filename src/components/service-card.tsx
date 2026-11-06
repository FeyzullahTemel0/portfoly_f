"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type SyntheticEvent } from "react";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import { PriceTag } from "@/components/currency";
import { ServiceIcon } from "@/components/home/icons";
import { siteImages } from "@/config/images";
import type { Locale } from "@/lib/locales";

type Props = { href: string; slug: string; title: string; summary: string; more: string; lang?: Locale; imageUrl?: string; price?: { mode: string; amount: number; currency: string } };

// Mobilde uygulama listesi gibi kompakt satır, geniş ekranda dikey kart.
export function ServiceCard({ href, slug, title, summary, more, imageUrl, price }: Props) {
  const image = imageUrl || siteImages.services[slug];
  const [imageAccent, setImageAccent] = useState<string | null>(null);

  function sampleImageAccent(event: SyntheticEvent<HTMLImageElement>) {
    const imageElement = event.currentTarget;
    if (!imageElement.naturalWidth || !imageElement.naturalHeight) return;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    context.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let red = 0;
    let green = 0;
    let blue = 0;
    let weightTotal = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const pixelRed = pixels[index];
      const pixelGreen = pixels[index + 1];
      const pixelBlue = pixels[index + 2];
      if (pixels[index + 3] < 160) continue;
      const brightness = (pixelRed + pixelGreen + pixelBlue) / 3;
      const saturation = Math.max(pixelRed, pixelGreen, pixelBlue) - Math.min(pixelRed, pixelGreen, pixelBlue);
      if (brightness < 32 || brightness > 248 || saturation < 24) continue;
      red += pixelRed * saturation;
      green += pixelGreen * saturation;
      blue += pixelBlue * saturation;
      weightTotal += saturation;
    }
    if (!weightTotal) return;
    setImageAccent(`${Math.round(red / weightTotal)} ${Math.round(green / weightTotal)} ${Math.round(blue / weightTotal)}`);
  }

  return (
    <Link
      href={href}
      className="card-glow group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 active:scale-[0.99] sm:flex-col sm:items-start sm:gap-5 sm:p-6"
    >
      {image ? (
        <span className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg bg-background sm:aspect-[16/9] sm:w-full sm:rounded-xl">
          <Image src={image} alt={title} fill sizes="(min-width: 640px) 360px, 64px" onLoad={sampleImageAccent} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          {imageAccent && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5"
              style={{ background: `linear-gradient(to top, rgb(${imageAccent} / 0.28), rgb(${imageAccent} / 0.12) 42%, transparent)` }}
            />
          )}
        </span>
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-accent-foreground shadow-lg shadow-accent/25 transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14">
          <ServiceIcon slug={slug} className="h-6 w-6" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-bold leading-snug sm:text-lg">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted sm:line-clamp-3 sm:leading-6">{summary}</p>
        {price && price.mode !== "quote" && price.amount > 0 && <PriceTag {...price} className="mt-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent" />}
        <span className="mt-4 hidden items-center gap-1 text-sm font-semibold text-accent sm:inline-flex">
          {more}
          <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180" aria-hidden="true" />
        </span>
      </div>
      <FiChevronRight className="h-5 w-5 shrink-0 text-muted rtl:rotate-180 sm:hidden" aria-hidden="true" />
    </Link>
  );
}
