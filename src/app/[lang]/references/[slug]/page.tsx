import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowUpRight } from "react-icons/fi";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales } from "@/lib/locales";
import { getAllReferenceSlugs, getReference } from "@/lib/references";
import { localizedAlternates } from "@/lib/seo";
import { safeUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAllReferenceSlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/references/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const [dict, reference] = await Promise.all([getDictionary(lang), getReference(lang, slug)]);
  if (!reference) return {};
  return {
    title: `${reference.name} | ${dict.brand.name} ${dict.brand.suffix}`,
    description: reference.description,
    alternates: localizedAlternates(lang, `/references/${slug}`),
    openGraph: reference.gallery[0] ? { images: [reference.gallery[0].url] } : undefined,
  };
}

export default async function ReferenceDetailPage({ params }: PageProps<"/[lang]/references/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, reference] = await Promise.all([getDictionary(lang), getReference(lang, slug)]);
  if (!reference) notFound();
  const website = safeUrl(reference.website);

  return (
    <>
      <PageHero title={reference.name} text={reference.sector} />
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <Link href={`/${lang}/references`} className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground">
          <FiArrowLeft aria-hidden="true" /> {dict.references.viewAll}
        </Link>
        <div className="mt-6 flex flex-col gap-6 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex min-w-0 items-center gap-5">
            {reference.logoUrl && <Image src={reference.logoUrl} alt={`${reference.name} logosu`} width={240} height={80} className="h-16 w-auto max-w-[180px] object-contain" />}
            <div className="min-w-0">
              <h2 className="text-xl font-bold">{reference.name}</h2>
              {reference.description && <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">{reference.description}</p>}
            </div>
          </div>
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 font-semibold text-accent-foreground transition hover:-translate-y-0.5">
              {dict.references.visit} <FiArrowUpRight aria-hidden="true" />
            </a>
          )}
        </div>
      </section>

      {reference.gallery.length > 0 && (
        <section className="mx-auto max-w-6xl space-y-6 px-4 pb-16 sm:space-y-8 sm:px-6 sm:pb-20">
          {reference.gallery.map((image, index) => (
            <Reveal key={image.url} delay={Math.min(index * 0.06, 0.24)}>
              <article className="grid items-start gap-3 border-b border-border pb-6 sm:gap-5 sm:pb-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,0.6fr)] lg:gap-8">
                <a href={image.url} target="_blank" rel="noopener noreferrer" aria-label={`${image.caption || reference.name} — görseli yeni sekmede aç`} className="block w-full overflow-hidden rounded-lg bg-surface sm:rounded-xl">
                  <Image src={image.url} alt={image.caption || `${reference.name} web sitesi ekran görüntüsü ${index + 1}`} width={874} height={559} sizes="(min-width: 1024px) 850px, 100vw" className="block h-auto w-full" />
                </a>
                <div className="min-w-0 py-1 sm:py-2 lg:py-4">
                  <p className="text-[10px] font-bold text-accent sm:text-xs">{String(index + 1).padStart(2, "0")}</p>
                  <h2 className="mt-1 text-base font-semibold sm:mt-2 sm:text-xl">{image.caption || reference.name}</h2>
                  {image.description && <p className="mt-1.5 text-xs leading-5 text-muted sm:mt-3 sm:text-sm sm:leading-7">{image.description}</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </section>
      )}
    </>
  );
}
