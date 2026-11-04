"use client";

import Image from "next/image";
import { useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { motion, useReducedMotion } from "motion/react";
import type { PublicCustomerReview } from "@/lib/customer-reviews";
import type { Locale } from "@/lib/locales";

const labels: Record<Locale, { title: string; text: string; previous: string; next: string; verified: string }> = {
  tr: { title: "Birlikte çalıştığımız işletmeler anlatıyor", text: "Güvene dayalı iş birliklerimizden gerçek deneyimler.", previous: "Önceki yorumlar", next: "Sonraki yorumlar", verified: "Onaylı müşteri yorumu" },
  en: { title: "Hear from the businesses we work with", text: "Real experiences from partnerships built on trust.", previous: "Previous reviews", next: "Next reviews", verified: "Approved customer review" },
  de: { title: "Unsere Kunden berichten", text: "Echte Erfahrungen aus vertrauensvollen Partnerschaften.", previous: "Vorherige Bewertungen", next: "Nächste Bewertungen", verified: "Freigegebene Kundenbewertung" },
  fr: { title: "Nos clients témoignent", text: "Des expériences réelles de partenariats fondés sur la confiance.", previous: "Avis précédents", next: "Avis suivants", verified: "Avis client approuvé" },
  ar: { title: "عملاؤنا يتحدثون عن تجربتهم", text: "تجارب حقيقية من شراكات مبنية على الثقة.", previous: "التقييمات السابقة", next: "التقييمات التالية", verified: "تقييم عميل معتمد" },
};

export function CustomerReviews({ items, lang }: { items: PublicCustomerReview[]; lang: Locale }) {
  const rail = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const text = labels[lang];
  if (items.length === 0) return null;

  const scroll = (direction: -1 | 1) => rail.current?.scrollBy({ left: direction * Math.min(420, rail.current.clientWidth * 0.82), behavior: reduce ? "instant" : "smooth" });

  return (
    <section className="relative overflow-hidden border-y border-border bg-surface py-16 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(ellipse_at_18%_20%,color-mix(in_srgb,var(--accent)_12%,transparent),transparent_55%),radial-gradient(ellipse_at_88%_85%,color-mix(in_srgb,var(--accent-2)_10%,transparent),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <span className="mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-accent to-accent-2" aria-hidden="true" />
            <h2 className="max-w-2xl text-balance text-2xl font-extrabold sm:text-4xl">{text.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted sm:text-base">{text.text}</p>
          </div>
          {items.length > 1 && (
            <div className="flex gap-2">
              <button type="button" onClick={() => scroll(-1)} aria-label={text.previous} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition hover:border-accent hover:text-accent">
                <FiChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => scroll(1)} aria-label={text.next} className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition hover:border-accent hover:text-accent">
                <FiChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
              </button>
            </div>
          )}
        </motion.div>

        <div ref={rail} dir="ltr" className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:thin]">
          {items.map((item, index) => (
            <motion.article
              key={item.id}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px -30px" }}
              transition={{ delay: Math.min(index * 0.06, 0.24), duration: 0.45 }}
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="flex w-[min(88vw,25rem)] shrink-0 snap-start flex-col rounded-2xl border border-border bg-background p-5 shadow-lg shadow-black/5 sm:w-[25rem] sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-2 ring-1 ring-black/5">
                  <Image src={item.logoUrl} alt={item.businessName} width={120} height={60} className="h-full w-full object-contain" />
                </span>
                <span className="flex gap-0.5" aria-label={`${item.rating} / 5`}>
                  {Array.from({ length: 5 }, (_, star) => <FiStar key={star} className={`h-4 w-4 ${star < item.rating ? "fill-amber-400 text-amber-400" : "text-muted/30"}`} aria-hidden="true" />)}
                </span>
              </div>
              <blockquote className="mt-5 flex-1 text-sm leading-7 text-foreground/90">“{item.text}”</blockquote>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="truncate text-sm font-bold">{item.businessName}</p>
                <span className="shrink-0 text-[10px] font-semibold text-accent">{text.verified}</span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
