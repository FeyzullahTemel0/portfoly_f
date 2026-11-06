import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { AdSlot } from "@/components/ad-slot";
import { ReferenceBrowser } from "@/components/reference-browser";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { getReferences } from "@/lib/references";
import { localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/references">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { references, brand } = await getDictionary(lang);
  return { title: `${references.title} | ${brand.name} ${brand.suffix}`, description: references.text, alternates: localizedAlternates(lang, "/references") };
}

export default async function ReferencesPage({ params }: PageProps<"/[lang]/references">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [{ references, hero }, items] = await Promise.all([getDictionary(lang), getReferences(lang)]);

  return (
    <>
      <PageHero title={references.title} text={references.text} compact />
      <AdSlot position="middle" lang={lang} />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
        <ReferenceBrowser items={items} lang={lang} emptyLabel={references.empty} detailLabel={references.detail} visitLabel={references.visit} />

        <Reveal>
          <div className="mt-10 rounded-xl border border-accent/40 bg-surface p-6 text-center sm:mt-16 sm:rounded-2xl sm:p-12">
            <h2 className="text-2xl font-bold tracking-normal sm:text-3xl">{references.ctaTitle}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted sm:mt-3 sm:text-base">{references.ctaText}</p>
            <Link
              href={`/${lang}/contact`}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 sm:mt-8 sm:h-12 sm:px-6 sm:text-base"
            >
              {hero.primary}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
