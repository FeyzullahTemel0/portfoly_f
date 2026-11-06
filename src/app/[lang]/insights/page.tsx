import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ArticlesBrowser } from "@/components/articles-browser";
import { AdSlot } from "@/components/ad-slot";
import { getArticles } from "@/lib/articles";
import { articleUi } from "@/lib/article-ui";
import { isLocale } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const ui = articleUi[lang];
  return { title: ui.title, description: ui.intro, alternates: localizedAlternates(lang, "/insights") };
}

export default async function InsightsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const articles = await getArticles(lang);
  const ui = articleUi[lang];

  return (
    <>
      <PageHero title={ui.title} text={ui.intro} compact />
      <AdSlot position="middle" lang={lang} />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14">
        <ArticlesBrowser lang={lang} articles={articles} />
      </section>
    </>
  );
}
