import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiAlertCircle, FiCheck, FiX } from "react-icons/fi";
import { DesktopSoftwareShowcase } from "@/components/desktop-software-showcase";
import { AdSlot } from "@/components/ad-slot";
import { PriceTag } from "@/components/currency";
import { iconKey } from "@/components/home/icons";
import { Reveal } from "@/components/reveal";
import { ShopierShowcase } from "@/components/shopier-showcase";
import { ServiceArt } from "@/components/service-art";
import { ServiceTechStack } from "@/components/service-tech-stack";
import { siteImages } from "@/config/images";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";

export async function generateStaticParams() {
  const all = await Promise.all(
    locales.map(async (lang) => {
      const { services } = await getDictionary(lang);
      return services.items.map((item) => ({ lang, slug: item.slug }));
    }),
  );
  return all.flat();
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const { services, brand } = await getDictionary(lang);
  const item = services.items.find((s) => s.slug === slug);
  if (!item) return {};
  return { title: `${item.title} | ${brand.name} ${brand.suffix}`, description: item.summary, alternates: localizedAlternates(lang, `/services/${slug}`) };
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const { services, shopierShowcase } = await getDictionary(lang);
  const item = services.items.find((s) => s.slug === slug);
  if (!item) notFound();
  const notice = "notice" in item ? item.notice : "";
  const price = (item as { price?: { mode: string; amount: number; currency: string } }).price;
  const icon = iconKey(item as { slug: string; icon?: string });

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="animate-blob pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-20 lg:grid-cols-2">
          <Reveal>
            <Link href={`/${lang}/services`} className="text-sm text-muted hover:text-foreground">← {services.back}</Link>
            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-normal sm:text-5xl">{item.title}</h1>
            <p className="mt-4 text-base leading-7 text-muted sm:text-lg sm:leading-8">{item.intro}</p>
            {price && price.mode !== "quote" && (
              <p className="mt-5">
                <PriceTag {...price} className="text-gradient text-2xl font-extrabold sm:text-3xl" />
              </p>
            )}
            <Link
              href={`/${lang}/contact?service=${item.slug}`}
              className="button-primary mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl px-6 font-semibold transition hover:-translate-y-0.5 sm:w-auto"
            >
              {services.cta}
            </Link>
          </Reveal>
          <Reveal delay={0.1} className="order-last min-w-0">
            <ServiceArt slug={icon} image={siteImages.services[slug]} alt={item.title} lang={lang} className="rounded-2xl border border-border shadow-2xl" />
          </Reveal>
        </div>
      </section>

      {slug === "windows-desktop-apps" && (
        <Reveal>
          <DesktopSoftwareShowcase lang={lang} />
        </Reveal>
      )}

      {slug === "shopier-ecommerce" && (
        <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <Reveal>
            <ShopierShowcase copy={shopierShowcase} />
          </Reveal>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {notice && (
            <Reveal>
              <div role="note" className="flex gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
                <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                <p className="leading-7">{notice}</p>
              </div>
            </Reveal>
          )}

          <Reveal>
            <h2 className="text-2xl font-bold tracking-normal">{services.includes}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {item.includes.map((text) => (
                <li key={text} className="flex gap-3 rounded-xl border border-border bg-surface p-4 text-sm transition-colors hover:border-accent">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <FiCheck className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-2xl font-bold tracking-normal">{services.notIncluded}</h2>
            <ul className="mt-5 space-y-3">
              {item.notIncluded.map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm text-muted">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                    <FiX className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <div>
            <Reveal>
              <h2 className="text-2xl font-bold tracking-normal">{services.steps}</h2>
            </Reveal>
            <ol className="mt-6 grid gap-4 sm:grid-cols-2">
              {item.steps.map((step, index) => (
                <Reveal key={step.title} delay={index * 0.08}>
                  <li className="h-full rounded-xl border border-border bg-surface p-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground shadow-lg shadow-accent/25">
                      {index + 1}
                    </span>
                    <h3 className="mt-3 font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{step.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
          <Reveal>
            <ServiceTechStack slug={slug} title={services.techTitle} note={services.techNote} />
          </Reveal>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold">{services.suitable}</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {item.suitable.map((text) => (
                <li key={text} className="flex gap-2">
                  <span className="text-accent" aria-hidden="true">•</span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href={`/${lang}/contact?service=${item.slug}`}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-accent px-6 font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition hover:-translate-y-0.5"
          >
            {services.cta}
          </Link>
          <AdSlot position="sidebar" lang={lang} className="!px-0 !py-0" />
        </aside>
      </div>
    </>
  );
}
