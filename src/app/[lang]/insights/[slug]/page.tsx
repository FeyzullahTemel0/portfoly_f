import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiClock } from "react-icons/fi";
import { ArticleBody } from "@/components/article-body";
import { ArticleShare } from "@/components/article-share";
import { Reveal } from "@/components/reveal";
import { getArticle, getAllArticleSlugs, getArticles } from "@/lib/articles";
import { articleUi } from "@/lib/article-ui";
import { isLocale, locales } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getAllArticleSlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const article = await getArticle(lang, slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: localizedAlternates(lang, `/insights/${slug}`),
    openGraph: article.coverUrl ? { type: "article", images: [article.coverUrl], publishedTime: article.publishedAt } : { type: "article", publishedTime: article.publishedAt },
    twitter: article.coverUrl ? { card: "summary_large_image", images: [article.coverUrl] } : { card: "summary" },
  };
}

export default async function InsightDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [article, all] = await Promise.all([getArticle(lang, slug), getArticles(lang)]);
  if (!article) notFound();
  const ui = articleUi[lang];
  const related = all.filter((item) => item.slug !== article.slug && (item.category === article.category || article.tags.some((tag) => item.tags.includes(tag)))).slice(0, 3);
  const date = new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(new Date(article.publishedAt));

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(transparent,#000_20%,#000_80%,transparent)]" />
        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
          <Link href={`/${lang}/insights`} className="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-foreground sm:text-sm"><FiArrowLeft className="rtl:rotate-180" aria-hidden="true" />{ui.back}</Link>
          <Reveal>
            <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-8">
              {article.category && <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent sm:px-3 sm:py-1.5 sm:text-xs">{article.category}</span>}
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted sm:text-xs"><FiClock aria-hidden="true" />{article.readMinutes} {ui.minute} {ui.read}</span>
              <time dateTime={article.publishedAt} className="text-[10px] font-medium text-muted sm:text-xs">{ui.published} · {date}</time>
            </div>
            <h1 className="mt-3 text-balance text-[1.8rem] font-extrabold leading-[1.08] sm:mt-5 sm:text-5xl">{article.title}</h1>
            {article.excerpt && <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:mt-5 sm:text-lg sm:leading-8">{article.excerpt}</p>}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:mt-6">
              <p className="text-xs font-semibold text-muted">{ui.by}</p>
              <ArticleShare title={article.title} labels={ui} />
            </div>
          </Reveal>
        </div>
      </section>

      {article.coverUrl && (
        <section className="mx-auto max-w-5xl px-4 pt-5 sm:px-6 sm:pt-10">
          <Reveal><div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl"><Image src={article.coverUrl} alt={article.coverAlt || article.title} fill priority sizes="(min-width: 1024px) 920px, 100vw" className="object-cover" /></div></Reveal>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-14">
        <Reveal><ArticleBody body={article.body} /></Reveal>
        {article.tags.length > 0 && <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap gap-2">{article.tags.map((tag) => <li key={tag} className="rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-medium text-muted sm:text-xs">{tag}</li>)}</ul>}
        <div className="mx-auto mt-6 max-w-3xl border-t border-border pt-5"><ArticleShare title={article.title} labels={ui} /></div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-10 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-xl font-bold sm:text-2xl">{ui.related}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {related.map((item) => <Link key={item.id} href={`/${lang}/insights/${item.slug}`} className="card-glow flex items-center gap-3 rounded-xl border border-border bg-background p-3 sm:gap-4 sm:p-4">
                {item.coverUrl && <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-surface sm:h-20 sm:w-28"><Image src={item.coverUrl} alt={item.coverAlt || item.title} fill sizes="112px" className="object-cover" /></span>}
                <span className="min-w-0"><span className="block line-clamp-2 text-sm font-bold">{item.title}</span><span className="mt-1 block text-[10px] text-muted">{item.readMinutes} {ui.minute} {ui.read}</span></span>
              </Link>)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
