import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowRight, FiCode, FiMessageCircle, FiPenTool } from "react-icons/fi";
import { HeroShowcase } from "@/components/home/hero-showcase";
import { AdSlot } from "@/components/ad-slot";
import { iconKey, WhyIcon } from "@/components/home/icons";
import { Marquee } from "@/components/home/marquee";
import { ProjectCard } from "@/components/project-card";
import { ReferenceLogo } from "@/components/reference-logo";
import { Reveal } from "@/components/reveal";
import { ServiceCard } from "@/components/service-card";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { getProjects } from "@/lib/projects";
import { getReferences } from "@/lib/references";
import { groupServices } from "@/lib/service-groups";
import { localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

const primaryButton =
  "button-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-7 font-semibold transition hover:-translate-y-0.5 sm:w-auto";
const secondaryButton =
  "glass inline-flex h-12 w-full items-center justify-center rounded-xl border border-border px-7 font-semibold transition hover:-translate-y-0.5 hover:border-accent sm:w-auto";

function SectionTitle({ title, text }: { title: string; text?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <span className="mx-auto mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-accent to-accent-2" aria-hidden="true" />
      <h2 className="text-balance text-2xl font-bold tracking-normal sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-base leading-7 text-muted sm:text-lg sm:leading-8">{text}</p>}
    </Reveal>
  );
}

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: localizedAlternates(lang) };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { hero, why, services, contact, references, projects } = await getDictionary(lang);
  const referenceItems = (await getReferences(lang)).slice(0, 8);
  const projectItems = (await getProjects(lang)).slice(0, 4);
  const slides = projectItems
    .filter((project) => project.coverUrl)
    .map((project) => ({ src: project.coverUrl, title: project.title, category: project.category, href: `/${lang}/projects/${project.slug}` }));

  return (
    <>
      <section className="relative overflow-x-clip">
        <div aria-hidden="true" className="hero-aurora pointer-events-none absolute inset-0" />

        <div className="relative mx-auto grid min-w-0 max-w-7xl items-center gap-x-12 gap-y-10 px-5 pb-10 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1fr_1fr] lg:px-10 lg:py-24">
          <div className="relative z-10 min-w-0">
            <Reveal>
              <span className="glass inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
                <span className="relative flex h-2 w-2">
                  <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-accent" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                {hero.badge}
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-5 text-balance text-[clamp(2.2rem,6.2vw,4.4rem)] font-extrabold leading-[1.04] tracking-normal">
                {hero.title}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg sm:leading-8">{hero.text}</p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/${lang}/contact`} className={primaryButton}>
                  {hero.primary}
                  <FiArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href={`/${lang}/${projectItems.length > 0 ? "projects" : "services"}`} className={secondaryButton}>
                  {hero.secondary}
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="min-w-0">
            <HeroShowcase slides={slides} chips={services.items.map((item) => item.title)} moreLabel={projects.more} />
          </div>
        </div>
        <Marquee items={services.items.map((item) => item.title)} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
        <SectionTitle title={services.title} text={services.text} />
        {groupServices(services).map((group) => (
          <div key={group.key} className="mt-10 sm:mt-14">
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-accent">
                  {group.key === "software" ? <FiCode className="h-4 w-4" aria-hidden="true" /> : <FiPenTool className="h-4 w-4" aria-hidden="true" />}
                </span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">{group.heading}</h3>
                <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
              </div>
            </Reveal>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {group.items.map((item, index) => (
                <Reveal key={item.slug} delay={(index % 3) * 0.08} className="h-full">
                  <ServiceCard
                    href={`/${lang}/services/${item.slug}`}
                    slug={iconKey(item as { slug: string; icon?: string })}
                    title={item.title}
                    summary={item.summary}
                    price={(item as { price?: { mode: string; amount: number; currency: string } }).price}
                    more={services.more}
                    lang={lang}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </section>

      <AdSlot position="middle" lang={lang} />

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
          <SectionTitle title={why.title} text={why.text} />
          <div className="mt-10 grid grid-cols-2 gap-4 sm:mt-14 lg:grid-cols-4 lg:gap-6">
            {why.items.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08} className="h-full">
                <article className="card-glow h-full rounded-2xl border border-border bg-background p-4 sm:p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-accent-foreground shadow-lg shadow-accent/25">
                    <WhyIcon index={index} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold leading-snug sm:text-base">{item.title}</h3>
                  <p className="mt-2 hidden text-sm leading-6 text-muted sm:block">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {projectItems.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
          <SectionTitle title={projects.homeTitle} />
          <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {projectItems.map((project, index) => (
              <Reveal key={project.id} delay={(index % 4) * 0.08}>
                <ProjectCard lang={lang} project={project} more={projects.more} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-8 text-center">
              <Link href={`/${lang}/projects`} className="text-sm font-semibold text-accent hover:underline">
                {projects.viewAll} →
              </Link>
            </p>
          </Reveal>
        </section>
      )}

      {referenceItems.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24">
          <SectionTitle title={references.homeTitle} />
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:mt-12 sm:grid-cols-4">
            {referenceItems.map((item, index) => (
              <Reveal key={item.id} delay={(index % 4) * 0.06}>
                <li className="card-glow flex h-28 items-center justify-center rounded-2xl border border-border bg-surface p-5">
                  <ReferenceLogo reference={item} />
                </li>
              </Reveal>
            ))}
          </ul>
          <Reveal>
            <p className="mt-8 text-center">
              <Link href={`/${lang}/references`} className="text-sm font-semibold text-accent hover:underline">
                {references.viewAll} →
              </Link>
            </p>
          </Reveal>
        </section>
      )}

      <AdSlot position="lower" lang={lang} />

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:py-24">
        <Reveal>
          <div className="cta-band relative overflow-hidden rounded-3xl px-6 py-12 text-center text-white shadow-2xl sm:px-12 sm:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative">
              <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <FiMessageCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-balance text-2xl font-extrabold tracking-normal sm:text-5xl">{contact.ctaTitle}</h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">{contact.text}</p>
              <Link
                href={`/${lang}/contact`}
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 font-bold text-[#0a2a8f] transition hover:-translate-y-0.5"
              >
                {hero.primary}
                <FiArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
