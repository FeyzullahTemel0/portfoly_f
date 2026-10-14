import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowRight, FiCheckCircle, FiCode, FiEye, FiMessageCircle, FiPenTool, FiSearch, FiTarget } from "react-icons/fi";
import { HeroVisual } from "@/components/home/hero-visual";
import { WhyIcon } from "@/components/home/icons";
import { Marquee } from "@/components/home/marquee";
import { ProjectCard } from "@/components/project-card";
import { ReferenceLogo } from "@/components/reference-logo";
import { Reveal } from "@/components/reveal";
import { ServiceCard } from "@/components/service-card";
import { siteImages } from "@/config/images";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { getProjects } from "@/lib/projects";
import { getReferences } from "@/lib/references";

export const dynamic = "force-dynamic";
import { groupServices } from "@/lib/service-groups";
import { localizedAlternates } from "@/lib/seo";

const primaryButton =
  "button-primary inline-flex h-12 items-center justify-center gap-2 rounded-md px-6 font-semibold transition hover:-translate-y-0.5";
const secondaryButton =
  "inline-flex h-12 items-center justify-center rounded-md border border-border bg-background px-6 font-semibold transition hover:-translate-y-0.5 hover:border-foreground";

function SectionTitle({ title, text }: { title: string; text?: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-accent" aria-hidden="true" />
      <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-lg leading-8 text-muted">{text}</p>}
    </Reveal>
  );
}

const processIcons = [FiSearch, FiPenTool, FiCode, FiCheckCircle];

export async function generateMetadata({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: localizedAlternates(lang) };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { hero, why, services, packages, process, aboutTeaser, about, contact, references, projects } =
    await getDictionary(lang);
  const referenceItems = (await getReferences(lang)).slice(0, 8);
  const projectItems = (await getProjects(lang)).slice(0, 4);

  return (
    <>
      <section className="relative overflow-x-clip">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0 opacity-75" />

        <div className="relative mx-auto grid min-w-0 max-w-7xl items-center gap-x-10 gap-y-7 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-x-14 lg:gap-y-10 lg:px-10 lg:py-24">
          <div className="relative z-10 order-1 min-w-0">
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-normal text-muted">
                <span className="h-px w-7 bg-accent" />
                {hero.badge}
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-6 max-w-[16ch] text-[clamp(3rem,5.3vw,4.75rem)] font-bold leading-[0.99] tracking-normal">
                {hero.title}
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">{hero.text}</p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={`/${lang}/contact`} className={primaryButton}>
                  {hero.primary}
                  <FiArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href={`/${lang}/services`} className={secondaryButton}>
                  {hero.secondary}
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="order-3 min-w-0 lg:order-2">
            <HeroVisual imageSrc={siteImages.hero || undefined} imageAlt={siteImages.heroAlt} />
          </div>
          <div className="order-2 col-span-full -mx-5 min-w-0 overflow-hidden sm:-mx-8 lg:order-3 lg:mx-[-2.5rem]">
            <Marquee items={services.items.map((item) => item.title)} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionTitle title={services.title} text={services.text} />
        {groupServices(services).map((group) => (
          <div key={group.key} className="mt-14">
            <Reveal>
              <div className="flex items-center gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-accent">
                  {group.key === "software" ? <FiCode className="h-4 w-4" aria-hidden="true" /> : <FiPenTool className="h-4 w-4" aria-hidden="true" />}
                </span>
                <h3 className="text-sm font-semibold uppercase tracking-normal text-accent">{group.heading}</h3>
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

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionTitle title={why.title} text={why.text} />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {why.items.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08} className="group h-full">
                <article className="h-full border-t-2 border-border pt-5 transition-colors duration-300 group-hover:border-accent">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-background text-accent ring-1 ring-border transition duration-300 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:shadow-md">
                    <WhyIcon index={index} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionTitle title={process.title} />
          <ol className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div aria-hidden="true" className="absolute left-[8%] right-[8%] top-6 hidden h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent lg:block" />
            {process.steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.1} className="group h-full">
                <li className="relative h-full rounded-lg border border-border bg-background p-5 transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-lg hover:shadow-foreground/5">
                  <div className="flex items-center justify-between">
                    <span className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-md shadow-accent/20 transition-transform duration-300 group-hover:rotate-3">
                      {(() => { const Icon = processIcons[index % processIcons.length]; return <Icon className="h-5 w-5" aria-hidden="true" />; })()}
                    </span>
                    <span className="text-xs font-bold text-accent/70">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-5 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Link href={`/${lang}/process`} className={secondaryButton}>{process.cta}</Link>
              <Link href={`/${lang}/packages`} className={secondaryButton}>{packages.viewAll}</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {projectItems.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionTitle title={projects.homeTitle} text={projects.text} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <SectionTitle title={references.homeTitle} />
          <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {referenceItems.map((item, index) => (
              <Reveal key={item.id} delay={(index % 4) * 0.06}>
                <li className="flex h-28 items-center justify-center rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-1 hover:border-accent hover:shadow-lg">
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

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">{aboutTeaser.title}</h2>
            <p className="mt-4 text-lg leading-8 text-muted">{aboutTeaser.text}</p>
            <Link href={`/${lang}/about`} className={`${secondaryButton} mt-8`}>
              {aboutTeaser.cta}
            </Link>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {[about.mission, about.vision].map((block, index) => (
              <Reveal key={block.title} delay={index * 0.1}>
                <article className="group h-full rounded-lg border border-border bg-background p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-lg hover:shadow-foreground/5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-transform duration-300 group-hover:-translate-y-0.5">
                    {index === 0 ? <FiTarget className="h-5 w-5" aria-hidden="true" /> : <FiEye className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <h3 className="mt-4 font-semibold text-accent">{block.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{block.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <Reveal>
          <div className="cta-band relative overflow-hidden rounded-lg px-7 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(var(--background)_1px,transparent_1px),linear-gradient(90deg,var(--background)_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative">
              <span className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10">
                <FiMessageCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-3xl font-bold tracking-normal sm:text-5xl">{contact.ctaTitle}</h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">{contact.text}</p>
              <Link
                href={`/${lang}/contact`}
                className="mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-7 font-semibold text-[#0b3d4f] transition hover:-translate-y-0.5"
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
