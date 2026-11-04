import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiCheck } from "react-icons/fi";
import { ReferenceGallery } from "@/components/reference-gallery";
import { ReferenceLogo } from "@/components/reference-logo";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales } from "@/lib/locales";
import { referenceUi } from "@/lib/reference-ui";
import { getAllReferenceSlugs, getReference, getReferences } from "@/lib/references";
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
    description: reference.tagline || reference.description,
    alternates: localizedAlternates(lang, `/references/${slug}`),
    openGraph: reference.gallery[0] ? { images: [reference.gallery[0].url] } : undefined,
  };
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const eyebrow = "inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent";

export default async function ReferenceDetailPage({ params }: PageProps<"/[lang]/references/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [reference, all] = await Promise.all([getReference(lang, slug), getReferences(lang)]);
  if (!reference) notFound();
  const ui = referenceUi[lang];
  const website = safeUrl(reference.website);
  const host = website ? hostOf(website) : reference.name;
  const cover = reference.gallery[0];
  const others = all.filter((item) => item.slug && item.slug !== reference.slug).slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="hero-aurora pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(70%_70%_at_50%_30%,#000,transparent)]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 lg:pb-24">
          <Link href={`/${lang}/references`} className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground">
            <FiArrowLeft aria-hidden="true" className="rtl:rotate-180" /> {ui.back}
          </Link>

          <div className="mt-8 grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="min-w-0">
              <Reveal>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={eyebrow}>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {ui.badge}
                  </span>
                  {reference.sector && <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">{reference.sector}</span>}
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <span className="mt-6 flex h-20 w-40 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5">
                  <ReferenceLogo reference={reference} variant="tile" />
                </span>
              </Reveal>
              <Reveal delay={0.12}>
                <h1 className="mt-6 text-balance text-[clamp(2.1rem,5.6vw,4.2rem)] font-extrabold leading-[1.05] tracking-normal">{reference.name}</h1>
              </Reveal>
              {reference.tagline && (
                <Reveal delay={0.18}>
                  <p className="text-gradient mt-4 text-balance text-xl font-bold leading-snug sm:text-2xl">{reference.tagline}</p>
                </Reveal>
              )}
              {reference.description && (
                <Reveal delay={0.24}>
                  <p className="mt-5 max-w-xl text-base leading-8 text-muted sm:text-lg">{reference.description}</p>
                </Reveal>
              )}
              <Reveal delay={0.3}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {website && (
                    <a href={website} target="_blank" rel="noopener noreferrer" className="button-primary inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 font-semibold transition hover:-translate-y-0.5">
                      {ui.visitLive} <FiArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </a>
                  )}
                  <Link href={`/${lang}/contact`} className="glass inline-flex h-12 items-center justify-center rounded-xl border border-border px-7 font-semibold transition hover:-translate-y-0.5 hover:border-accent">
                    {ui.ctaButton}
                  </Link>
                </div>
              </Reveal>
            </div>

            {cover && (
              <Reveal delay={0.15} className="min-w-0">
                <div className="relative">
                  <div aria-hidden="true" className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_30%,transparent),transparent_70%)] blur-2xl" />
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20 transition-transform duration-700 lg:[transform:perspective(1600px)_rotateY(-7deg)_rotateX(2deg)] lg:hover:[transform:perspective(1600px)_rotateY(0)_rotateX(0)] rtl:lg:[transform:perspective(1600px)_rotateY(7deg)_rotateX(2deg)]">
                    <div className="flex items-center gap-3 border-b border-border bg-background/70 px-4 py-2.5">
                      <span className="flex gap-1.5" aria-hidden="true">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                      </span>
                      <span className="min-w-0 flex-1 truncate rounded-md bg-foreground/5 px-3 py-1 text-center text-[11px] text-muted">{host}</span>
                    </div>
                    <Image src={cover.url} alt={cover.caption || `${reference.name} ${ui.gallery}`} width={1280} height={800} priority sizes="(min-width: 1024px) 640px, 100vw" className="block h-auto w-full" />
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {reference.stats.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <dl className={`grid gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xl shadow-black/5 ${reference.stats.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : reference.stats.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
              {reference.stats.map((stat) => (
                <div key={stat.value + stat.label} className="flex flex-col bg-surface px-5 py-6 text-center sm:py-8">
                  <dt className="order-2 mt-1 text-xs font-medium text-muted sm:text-sm">{stat.label}</dt>
                  <dd className="text-gradient text-3xl font-black sm:text-5xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>
      )}

      {reference.story.length > 0 && (
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <span className="mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-accent to-accent-2" aria-hidden="true" />
              <h2 className="text-balance text-3xl font-extrabold tracking-normal sm:text-4xl">{ui.about}</h2>
            </div>
          </Reveal>
          <div className="space-y-6 lg:col-span-8">
            {reference.story.map((paragraph, index) => (
              <Reveal key={index} delay={Math.min(index * 0.06, 0.2)}>
                <p className={index === 0 ? "text-lg font-medium leading-9 sm:text-xl sm:leading-10" : "text-base leading-8 text-muted sm:text-lg sm:leading-9"}>{paragraph}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {reference.features.length > 0 && (
        <section className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="mx-auto mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-accent to-accent-2" aria-hidden="true" />
              <h2 className="text-balance text-3xl font-extrabold tracking-normal sm:text-4xl">{ui.features}</h2>
              <p className="mt-3 text-base leading-7 text-muted sm:text-lg">{ui.featuresText}</p>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {reference.features.map((feature, index) => (
                <Reveal key={feature.title} delay={(index % 3) * 0.08} className="h-full">
                  <article className="card-glow relative h-full overflow-hidden rounded-2xl border border-border bg-background p-6">
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-accent-2" />
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-accent-foreground shadow-lg shadow-accent/25">
                        <FiCheck className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-3xl font-black text-foreground/10" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                    {feature.text && <p className="mt-2 text-sm leading-7 text-muted">{feature.text}</p>}
                  </article>
                </Reveal>
              ))}
            </div>
            {reference.tech.length > 0 && (
              <Reveal>
                <div className="mt-10 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">{ui.tech}</p>
                  <ul className="mt-4 flex flex-wrap justify-center gap-2">
                    {reference.tech.map((item) => (
                      <li key={item} className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium">{item}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {reference.gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
            <span className="mx-auto mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-accent to-accent-2" aria-hidden="true" />
            <h2 className="text-balance text-3xl font-extrabold tracking-normal sm:text-4xl">{ui.gallery}</h2>
            <p className="mt-3 text-base leading-7 text-muted sm:text-lg">{ui.galleryText}</p>
          </Reveal>
          <ReferenceGallery items={reference.gallery} name={reference.name} host={host} ui={ui} />
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="cta-band relative overflow-hidden rounded-3xl px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative">
              <h2 className="text-balance text-2xl font-extrabold tracking-normal sm:text-5xl">{ui.ctaTitle}</h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">{ui.ctaText}</p>
              <Link href={`/${lang}/contact`} className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 font-bold text-[#0a2a8f] transition hover:-translate-y-0.5">
                {ui.ctaButton}
                <FiArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>

        {others.length > 0 && (
          <div className="mt-16">
            <h2 className="text-center text-xl font-bold sm:text-2xl">{ui.others}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <Link key={item.id} href={`/${lang}/references/${item.slug}`} className="card-glow group flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 pr-5">
                  <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-black/5">
                    <ReferenceLogo reference={item} variant="tile" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{item.name}</span>
                    {item.sector && <span className="block truncate text-xs font-medium text-accent">{item.sector}</span>}
                  </span>
                  <FiArrowUpRight className="h-4 w-4 shrink-0 text-muted transition group-hover:text-accent" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
