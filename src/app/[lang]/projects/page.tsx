import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { ProjectBrowser } from "@/components/project-browser";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { getProjects } from "@/lib/projects";
import { localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { projects, brand } = await getDictionary(lang);
  return { title: `${projects.title} | ${brand.name} ${brand.suffix}`, description: projects.text, alternates: localizedAlternates(lang, "/projects") };
}

export default async function ProjectsPage({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [{ projects, hero }, items] = await Promise.all([getDictionary(lang), getProjects(lang)]);

  return (
    <>
      <PageHero title={projects.title} text={projects.text} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {items.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">{projects.empty}</p>
        ) : (
          <ProjectBrowser lang={lang} projects={items} copy={projects} />
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
      </section>
    </>
  );
}
