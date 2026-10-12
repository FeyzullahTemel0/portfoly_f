import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { siteImages } from "@/config/images";
import type { Locale } from "@/lib/locales";
import { ServiceArt } from "./service-art";

type Props = { href: string; slug: string; title: string; summary: string; more: string; lang: Locale };

export function ServiceCard({ href, slug, title, summary, more, lang }: Props) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-xl hover:shadow-foreground/5"
    >
      <ServiceArt slug={slug} image={siteImages.services[slug]} alt={title} lang={lang} />
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-muted">{summary}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent">
          {more}
          <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
