import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { AdSlot } from "@/components/ad-slot";
import { ServiceBrowser } from "@/components/service-browser";
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
      <AdSlot position="middle" lang={lang} />
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-16">
        <ServiceBrowser groups={groupServices(services)} more={services.more} lang={lang} />
      </section>
      <AdSlot position="lower" lang={lang} />
    </>
  );
}
