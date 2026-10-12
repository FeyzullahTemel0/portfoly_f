import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ServiceCard } from "@/components/service-card";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { groupServices } from "@/lib/service-groups";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { services, brand } = await getDictionary(lang);
  return { title: `${services.title} | ${brand.name} ${brand.suffix}`, description: services.text, alternates: localizedAlternates(lang, "/services") };
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { services } = await getDictionary(lang);

  return (
    <>
      <PageHero title={services.title} text={services.text} />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {groupServices(services).map((group) => (
          <div key={group.key} className="mb-16 last:mb-0">
            <Reveal>
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-normal text-accent">{group.heading}</h2>
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              </div>
            </Reveal>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item, index) => (
                <Reveal key={item.slug} delay={(index % 3) * 0.08}>
                  <ServiceCard
                    href={`/${lang}/services/${item.slug}`}
                    slug={item.slug}
                    title={item.title}
                    summary={item.summary}
                    more={services.more}
                    lang={lang}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
