import Link from "next/link";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import { PriceTag } from "@/components/currency";
import { ServiceIcon } from "@/components/home/icons";
import type { Locale } from "@/lib/locales";

type Props = { href: string; slug: string; title: string; summary: string; more: string; lang?: Locale; price?: { mode: string; amount: number; currency: string } };

// Mobilde uygulama listesi gibi kompakt satır, geniş ekranda dikey kart.
export function ServiceCard({ href, slug, title, summary, more, price }: Props) {
  return (
    <Link
      href={href}
      className="card-glow group flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 active:scale-[0.99] sm:flex-col sm:items-start sm:gap-5 sm:p-6"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-accent-foreground shadow-lg shadow-accent/25 transition-transform duration-300 group-hover:scale-105 sm:h-14 sm:w-14">
        <ServiceIcon slug={slug} className="h-6 w-6" />
      </span>
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
