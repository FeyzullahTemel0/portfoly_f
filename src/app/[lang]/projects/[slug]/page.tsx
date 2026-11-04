import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { ProjectGallery } from "@/components/project-gallery";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales } from "@/lib/locales";
import { getAllProjectSlugs, getProject } from "@/lib/projects";
import { localizedAlternates } from "@/lib/seo";
import { safeProjectUrl } from "@/lib/site";

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const [{ brand }, project] = await Promise.all([getDictionary(lang), getProject(lang, slug)]);
  if (!project) return {};
  return {
    title: `${project.title} | ${brand.name} ${brand.suffix}`,
    description: project.summary,
    alternates: localizedAlternates(lang, `/projects/${slug}`),
    openGraph: project.coverUrl ? { images: [project.coverUrl] } : undefined,
  };
}

export default async function ProjectDetailPage({ params }: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [{ projects, hero }, project] = await Promise.all([getDictionary(lang), getProject(lang, slug)]);
  if (!project) notFound();

  const website = safeProjectUrl(project.url);
  const isDemo = website.startsWith("/demos/") || project.tags.some((tag) => tag.toLocaleLowerCase().includes("demo"));
  const meta = [
    { label: projects.category, value: project.category },
    { label: projects.year, value: project.year },
    { label: projects.client, value: project.client },
  ].filter((item) => item.value);
  const paragraphs = project.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-border bg-surface">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(transparent,#000_20%,#000_80%,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 sm:pb-20 sm:pt-8">
          <Link href={`/${lang}/projects`} className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground">
            <FiArrowLeft className="rtl:rotate-180" aria-hidden="true" /> {projects.back}
          </Link>
          <div className="mt-5 grid items-center gap-6 sm:mt-8 sm:gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                {project.category && <span className="max-w-full truncate rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent sm:px-3 sm:py-1.5 sm:text-xs">{project.category}</span>}
                {isDemo && <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-semibold text-muted sm:px-3 sm:py-1.5 sm:text-xs">{projects.demoBadge}</span>}
              </div>
              <h1 className="mt-3 text-balance text-[1.7rem] font-extrabold leading-[1.08] tracking-normal sm:mt-5 sm:text-[clamp(2rem,4.7vw,3.8rem)]">{project.title}</h1>
              {project.summary && <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:mt-5 sm:text-base sm:leading-8 lg:text-lg">{project.summary}</p>}
              {project.tags.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                  {project.tags.map((tag) => <li key={tag} className="rounded-full border border-border bg-background/80 px-2.5 py-1 text-[10px] font-medium sm:px-3 sm:text-xs">{tag}</li>)}
                </ul>
              )}
              <div className="mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="button-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition hover:-translate-y-0.5 sm:h-12 sm:rounded-xl sm:px-6 sm:text-base">
                    {isDemo ? projects.demo : projects.visit}<FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                <Link href={`/${lang}/contact`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-xs font-semibold transition hover:border-accent sm:h-12 sm:rounded-xl sm:px-6 sm:text-base">
                  {hero.primary}<FiArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>

            {project.coverUrl && (
              <Reveal delay={0.1}>
                <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/15">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
                    <span className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" /></span>
                    <span className="min-w-0 flex-1 truncate rounded-md bg-surface px-3 py-1 text-center text-[11px] text-muted">{project.title}</span>
                  </div>
                  <div className="relative aspect-[16/10] bg-surface">
                    <Image src={project.coverUrl} alt={project.title} fill priority sizes="(min-width: 1024px) 650px, 100vw" className={project.coverFit === "contain" ? "object-contain p-2 sm:p-4" : "object-cover"} />
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {meta.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-12">
          <dl className={`grid overflow-hidden rounded-2xl border border-border bg-border shadow-lg shadow-black/5 ${meta.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
            {meta.map((item) => <div key={item.label} className="bg-background px-4 py-3 sm:px-7 sm:py-5"><dt className="text-[10px] font-medium text-muted sm:text-xs">{item.label}</dt><dd className="mt-1 text-sm font-bold sm:text-base">{item.value}</dd></div>)}
          </dl>
        </section>
      )}

      {project.highlights.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20">
          <Reveal className="max-w-2xl">
            <span className="mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-accent to-accent-2" aria-hidden="true" />
            <h2 className="text-balance text-2xl font-extrabold sm:text-4xl">{projects.highlightsTitle}</h2>
            <p className="mt-2 text-xs leading-5 text-muted sm:mt-3 sm:text-base sm:leading-7">{projects.highlightsText}</p>
          </Reveal>
          <div className="mt-5 grid gap-2 sm:mt-8 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {project.highlights.map((item, index) => (
              <Reveal key={`${item.title}-${index}`} delay={(index % 3) * 0.06} className="h-full">
                <article className="card-glow relative h-full overflow-hidden rounded-lg border border-border bg-surface p-4 sm:rounded-xl sm:p-6">
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-accent-2" />
                  <span className="text-xs font-bold uppercase text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-sm font-bold sm:mt-3 sm:text-lg">{item.title}</h3>
                  {item.text && <p className="mt-1.5 text-xs leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">{item.text}</p>}
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {paragraphs.length > 0 && (
        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 py-10 sm:px-6 sm:py-20 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <Reveal><div className="lg:sticky lg:top-28"><span className="mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-accent to-accent-2" aria-hidden="true" /><h2 className="text-2xl font-extrabold sm:text-3xl">{projects.about}</h2></div></Reveal>
            <div className="space-y-4 sm:space-y-5">{paragraphs.map((paragraph, index) => <Reveal key={paragraph} delay={Math.min(index * 0.04, 0.16)}><p className={`${index === 0 ? "text-base font-medium leading-7 text-foreground sm:text-xl sm:leading-10" : "text-sm leading-7 text-muted sm:text-lg sm:leading-9"}`}>{paragraph}</p></Reveal>)}</div>
          </div>
        </section>
      )}

      {project.gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20">
          <Reveal className="mb-5 flex flex-wrap items-end justify-between gap-2 sm:mb-8 sm:gap-3">
            <div><span className="mb-3 block h-1 w-10 rounded-full bg-gradient-to-r from-accent to-accent-2 sm:mb-4 sm:w-12" aria-hidden="true" /><h2 className="text-xl font-extrabold sm:text-3xl">{projects.gallery}</h2></div>
            <p className="text-sm text-muted">{projects.galleryCount.replace("{count}", String(project.gallery.length))}</p>
          </Reveal>
          <ProjectGallery images={project.gallery} alt={project.title} />
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="cta-band relative overflow-hidden rounded-2xl px-5 py-8 text-center text-white shadow-2xl sm:rounded-3xl sm:px-12 sm:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative"><h2 className="text-balance text-xl font-extrabold sm:text-4xl">{projects.ctaTitle}</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/85 sm:mt-3 sm:text-base">{projects.ctaText}</p><Link href={`/${lang}/contact`} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[#0b3d4f] transition hover:-translate-y-0.5 sm:mt-7 sm:h-12 sm:rounded-xl sm:px-7 sm:text-base">{hero.primary}<FiArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" /></Link></div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
