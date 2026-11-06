import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { Reveal } from "@/components/reveal";
import type { Locale } from "@/lib/locales";
import type { PublicArticle } from "@/lib/articles";
import { articleUi } from "@/lib/article-ui";

export function InsightsPreview({ articles, lang }: { articles: PublicArticle[]; lang: Locale }) {
  if (!articles.length) return null;
  const ui = articleUi[lang];
  return (
    <section className="border-y border-border bg-surface py-10 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-5 flex items-end justify-between gap-3 sm:mb-8">
          <div><p className="text-[10px] font-bold uppercase tracking-wider text-accent">{ui.category}</p><h2 className="mt-1 text-xl font-extrabold sm:text-3xl">{ui.title}</h2></div>
          <Link href={`/${lang}/insights`} className="shrink-0 text-xs font-semibold text-accent hover:underline sm:text-sm">{ui.all} →</Link>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {articles.slice(0, 3).map((article, index) => (
            <Reveal key={article.id} delay={index * 0.06} className="h-full">
              <Link href={`/${lang}/insights/${article.slug}`} className="card-glow group flex h-full overflow-hidden rounded-xl border border-border bg-background sm:flex-col sm:rounded-2xl">
                {article.coverUrl && <div className="relative aspect-square w-20 shrink-0 bg-surface sm:aspect-[16/9] sm:w-full"><Image src={article.coverUrl} alt={article.coverAlt || article.title} fill sizes="(min-width: 1024px) 360px, 50vw" className="object-cover" /></div>}
                <span className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:p-5">
                  {article.category && <span className="truncate text-[10px] font-semibold text-accent">{article.category}</span>}
                  <span className="mt-1 line-clamp-2 text-sm font-bold leading-snug sm:mt-2 sm:text-lg">{article.title}</span>
                  <span className="mt-1 line-clamp-2 text-xs leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">{article.excerpt}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-accent sm:mt-4 sm:text-xs">{article.readMinutes} {ui.minute} {ui.read}<FiArrowUpRight aria-hidden="true" /></span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
