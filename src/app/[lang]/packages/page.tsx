import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/packages">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { packages, brand } = await getDictionary(lang);
  return { title: `${packages.title} | ${brand.name} ${brand.suffix}`, description: packages.text, alternates: localizedAlternates(lang, "/packages") };
}

export default async function PackagesPage({ params }: PageProps<"/[lang]/packages">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { packages } = await getDictionary(lang);

  return (
    <>
      <PageHero title={packages.title} text={packages.text} />

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6">
        {packages.groups.map((group) => (
          <section key={group.serviceSlug} id={group.serviceSlug} className="scroll-mt-24">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-normal">{group.title}</h2>
                  <p className="mt-1 text-muted">{group.summary}</p>
                </div>
                <Link
                  href={`/${lang}/services/${group.serviceSlug}`}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  {group.title} →
                </Link>
              </div>
            </Reveal>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {group.items.map((item, index) => (
                <Reveal key={item.name} delay={index * 0.06}>
                  <article
                    className={`flex h-full flex-col rounded-xl border bg-surface p-6 ${
                      item.highlight ? "border-accent" : "border-border"
                    }`}
                  >
                    <h3 className="text-xl font-bold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted">{item.tagline}</p>
                    <ul className="mt-6 flex-1 space-y-3 text-sm">
                      {item.features.map((feature) => (
                        <li key={feature} className="flex gap-2">
                          <span className="text-accent" aria-hidden="true">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/${lang}/contact?service=${group.serviceSlug}&package=${encodeURIComponent(item.name)}`}
                      className={`mt-8 inline-flex h-11 items-center justify-center rounded-lg font-semibold transition-opacity hover:opacity-90 ${
                        item.highlight ? "bg-accent text-accent-foreground" : "border border-border"
                      }`}
                    >
                      {packages.cta}
                    </Link>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        ))}

        <p className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">{packages.note}</p>
      </div>
    </>
  );
}
