import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { AdSlot } from "@/components/ad-slot";
import { ReferenceLogo } from "@/components/reference-logo";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { getReferences } from "@/lib/references";
import { safeUrl } from "@/lib/site";
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
        {items.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">{references.empty}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {items.map((item, index) => {
              const website = safeUrl(item.website);
              const content = (
                <>
                  <span className="flex h-16 items-center justify-center overflow-hidden rounded-lg bg-white p-3 ring-1 ring-black/5 sm:h-24 sm:rounded-xl sm:p-4">
                    <ReferenceLogo reference={item} variant="tile" />
                  </span>
                  <h2 className="mt-3 text-base font-bold sm:mt-5 sm:text-xl">{item.name}</h2>
                  {item.sector && <p className="text-xs font-semibold text-accent sm:text-sm">{item.sector}</p>}
                  {(item.tagline || item.description) && <p className="mt-2 line-clamp-3 flex-1 text-xs leading-5 text-muted sm:mt-3 sm:line-clamp-4 sm:text-sm sm:leading-6">{item.tagline || item.description}</p>}
                </>
              );
              return (
                <Reveal key={item.id} delay={(index % 6) * 0.05} className="h-full">
                  <article className="card-glow flex h-full flex-col rounded-xl border border-border bg-surface p-3 sm:rounded-2xl sm:p-5">
                    {item.slug ? (
                      <Link href={`/${lang}/references/${item.slug}`} className="group flex flex-1 flex-col rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        {content}
                        <span className="mt-3 text-xs font-semibold text-accent group-hover:underline sm:mt-4 sm:text-sm">{references.detail} →</span>
                      </Link>
                    ) : (
                      <div className="flex flex-1 flex-col">{content}</div>
                    )}
                    {website && (
                      <a href={website} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs font-semibold text-muted hover:text-accent hover:underline sm:mt-3 sm:text-sm">
                        {references.visit} →
                      </a>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

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
