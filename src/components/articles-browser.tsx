"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { FiSearch, FiClock, FiArrowUpRight } from "react-icons/fi";
import type { Locale } from "@/lib/locales";
import type { PublicArticle } from "@/lib/articles";
import { articleUi } from "@/lib/article-ui";

export function ArticlesBrowser({ lang, articles }: { lang: Locale; articles: PublicArticle[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const deferred = useDeferredValue(query.trim().toLocaleLowerCase(lang));
  const ui = articleUi[lang];
  const categories = [...new Set(articles.map((article) => article.category).filter(Boolean))];
  const filtered = articles.filter((article) => {
    const matchesText = !deferred || `${article.title} ${article.excerpt} ${article.category} ${article.tags.join(" ")}`.toLocaleLowerCase(lang).includes(deferred);
    return matchesText && (!category || article.category === category);
  });

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2 sm:mb-8">
        <label className="relative min-w-[min(100%,18rem)] flex-1 sm:max-w-sm">
          <span className="sr-only">{ui.search}</span>
          <FiSearch className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ui.searchPlaceholder} className="h-10 w-full rounded-lg border border-border bg-background ps-9 pe-3 text-sm outline-none focus:border-accent sm:h-11" />
        </label>
        <div role="tablist" aria-label={ui.category} className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
          <button type="button" role="tab" aria-selected={!category} onClick={() => setCategory("")} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold ${!category ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}>{ui.all}</button>
          {categories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} onClick={() => setCategory(item)} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold ${category === item ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"}`}>{item}</button>)}
        </div>
      </div>

      {filtered.length === 0 ? <p className="rounded-xl border border-dashed border-border p-7 text-center text-sm text-muted">{articles.length ? ui.searchEmpty : ui.empty}</p> : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filtered.map((article) => (
            <Link key={article.id} href={`/${lang}/insights/${article.slug}`} className="card-glow group flex min-h-28 overflow-hidden rounded-xl border border-border bg-surface transition sm:min-h-0 sm:flex-col sm:rounded-2xl">
              {article.coverUrl ? (
                <div className="relative aspect-square w-24 shrink-0 bg-background sm:aspect-[16/9] sm:w-full">
                  <Image src={article.coverUrl} alt={article.coverAlt || article.title} fill sizes="(min-width: 1024px) 360px, 30vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
              ) : <div className="grid w-16 shrink-0 place-items-center bg-accent/10 text-accent sm:hidden"><FiClock aria-hidden="true" /></div>}
              <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:p-5">
                <div className="flex items-center gap-2 text-[10px] font-medium text-muted sm:text-xs">
                  {article.category && <span className="truncate font-semibold text-accent">{article.category}</span>}
                  <span className="shrink-0">{article.readMinutes} {ui.minute} {ui.read}</span>
                </div>
                <h2 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug sm:mt-3 sm:text-lg">{article.title}</h2>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">{article.excerpt}</p>
                <span className="mt-2 hidden items-center gap-1 text-xs font-semibold text-accent sm:inline-flex">{articleUi[lang].back}<FiArrowUpRight aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
