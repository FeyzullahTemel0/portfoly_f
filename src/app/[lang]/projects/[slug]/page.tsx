import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowUpRight } from "react-icons/fi";
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
  const isDemo = website.startsWith("/demos/");
  const meta = [
    { label: projects.client, value: project.client },
    { label: projects.year, value: project.year },
    { label: projects.category, value: project.category },
  ].filter((item) => item.value);
  const paragraphs = project.description.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-70" />
        <div aria-hidden="true" className="animate-blob pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <Reveal>
            <Link href={`/${lang}/projects`} className="text-sm text-muted hover:text-foreground">← {projects.back}</Link>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-normal sm:text-5xl">{project.title}</h1>
            {project.summary && <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{project.summary}</p>}
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {project.coverUrl && (
          <Reveal>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface">
              <Image src={project.coverUrl} alt={project.title} fill priority sizes="(min-width: 1152px) 1100px, 100vw" className={project.coverFit === "contain" ? "object-contain" : "object-cover"} />
            </div>
          </Reveal>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {paragraphs.length > 0 && (
              <Reveal>
                <h2 className="text-2xl font-bold tracking-normal">{projects.about}</h2>
              </Reveal>
            )}
            {paragraphs.map((paragraph) => (
              <Reveal key={paragraph}>
                <p className="text-lg leading-8 text-muted">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4 rounded-2xl border border-border bg-surface p-6">
              {meta.map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
              {project.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2 pt-1">
                  {project.tags.map((tag) => (
                    <li key={tag} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">{tag}</li>
                  ))}
                </ul>
              )}
            </div>
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition hover:-translate-y-0.5"
              >
                {isDemo ? projects.demo : projects.visit}
                <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </aside>
        </div>

        {project.gallery.length > 0 && (
          <div className="mt-16">
            <Reveal>
              <h2 className="mb-6 text-2xl font-bold tracking-normal">{projects.gallery}</h2>
            </Reveal>
            <ProjectGallery images={project.gallery} alt={project.title} />
          </div>
        )}

        <Reveal>
          <div className="cta-band relative mt-20 overflow-hidden rounded-3xl p-10 text-center text-white shadow-2xl sm:p-14">
            <div aria-hidden="true" className="animate-blob absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">{projects.ctaTitle}</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/85">{projects.ctaText}</p>
              <Link
                href={`/${lang}/contact`}
                className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-7 font-semibold text-[#0b3d4f] transition hover:-translate-y-0.5"
              >
                {hero.primary}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  );
}
