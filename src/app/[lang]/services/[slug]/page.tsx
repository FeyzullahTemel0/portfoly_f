import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiAlertCircle, FiCheck, FiX } from "react-icons/fi";
import { DesktopSoftwareShowcase } from "@/components/desktop-software-showcase";
import { Reveal } from "@/components/reveal";
import { ShopierShowcase } from "@/components/shopier-showcase";
import { ServiceArt } from "@/components/service-art";
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

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-70" />
        <div aria-hidden="true" className="animate-blob pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
          <Reveal>
            <Link href={`/${lang}/services`} className="text-sm text-muted hover:text-foreground">← {services.back}</Link>
            <h1 className="mt-4 text-3xl font-bold tracking-normal sm:text-5xl">{item.title}</h1>
            <p className="mt-4 text-lg leading-8 text-muted">{item.intro}</p>
            <Link
              href={`/${lang}/contact?service=${item.slug}`}
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition hover:-translate-y-0.5"
            >
              {services.cta}
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="group overflow-hidden rounded-3xl border border-border shadow-2xl">
              <ServiceArt slug={item.slug} image={siteImages.services[item.slug]} alt={item.title} className="aspect-[16/11]" lang={lang} />
            </div>
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
        </aside>
      </div>
    </>
  );
}
