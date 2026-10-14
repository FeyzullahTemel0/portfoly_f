import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
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
      <PageHero title={references.title} text={references.text} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {items.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">{references.empty}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const website = safeUrl(item.website);
              return (
                <Reveal key={item.id} delay={(index % 6) * 0.05}>
                  <article className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-accent">
                    {item.slug ? (
                      <Link href={`/${lang}/references/${item.slug}`} className="group flex flex-1 flex-col rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent">
                        <div className="flex h-20 items-center">
                          <ReferenceLogo reference={item} />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold">{item.name}</h2>
                        {item.sector && <p className="text-sm font-medium text-accent">{item.sector}</p>}
                        {item.description && <p className="mt-3 flex-1 text-sm leading-6 text-muted">{item.description}</p>}
                        <span className="mt-4 text-sm font-semibold text-accent group-hover:underline">{references.detail} →</span>
                      </Link>
                    ) : (
                      <div className="flex flex-1 flex-col">
                    <div className="flex h-20 items-center">
                      <ReferenceLogo reference={item} />
                    </div>
                    <h2 className="mt-4 text-lg font-semibold">{item.name}</h2>
                    {item.sector && <p className="text-sm font-medium text-accent">{item.sector}</p>}
                    {item.description && <p className="mt-3 flex-1 text-sm leading-6 text-muted">{item.description}</p>}
                      </div>
                    )}
                    {website && (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-sm font-semibold text-accent hover:underline"
                      >
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
          <div className="mt-16 rounded-2xl border border-accent/40 bg-surface p-8 text-center sm:p-12">
            <h2 className="text-3xl font-bold tracking-normal">{references.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">{references.ctaText}</p>
            <Link
              href={`/${lang}/contact`}
              className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              {hero.primary}
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
