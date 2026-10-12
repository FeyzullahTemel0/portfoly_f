import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { getAboutPhoto } from "@/lib/about-photo";
import { isLocale } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { about, brand } = await getDictionary(lang);
  return { title: `${about.title} | ${brand.name} ${brand.suffix}`, description: about.text, alternates: localizedAlternates(lang, "/about") };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase())
    .join("");
}

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [{ about }, profilePhoto] = await Promise.all([getDictionary(lang), getAboutPhoto()]);
  const { profile } = about;

  return (
    <>
      <PageHero title={about.title} text={about.text} />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-3">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <div className="rounded-2xl border border-border bg-surface p-6 text-center">
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-accent text-3xl font-bold text-accent-foreground">
                {profilePhoto.url ? (
                  <Image src={profilePhoto.url} alt={profile.name} fill sizes="96px" className="object-cover" priority />
                ) : (
                  <span aria-hidden="true">{initials(profile.name)}</span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold">{profile.name}</h2>
              <p className="mt-1 text-sm font-medium text-accent">{profile.role}</p>
              <p className="mt-1 text-sm text-muted">{profile.location}</p>
              <p className="mt-4 text-sm leading-6 text-muted">{profile.summary}</p>
            </div>
          </Reveal>
        </aside>

        <div className="space-y-12 lg:col-span-2">
          <section className="space-y-4">
            {about.story.map((paragraph) => (
              <Reveal key={paragraph}>
                <p className="leading-8 text-muted">{paragraph}</p>
              </Reveal>
            ))}
          </section>

          {about.experience.items.length > 0 && (
            <section>
              <Reveal>
                <h2 className="text-2xl font-bold tracking-normal">{about.experience.title}</h2>
              </Reveal>
              <ol className="mt-6 space-y-4 border-l border-border pl-6">
                {about.experience.items.map((item, index) => (
                  <Reveal key={`${item.role}-${index}`} delay={index * 0.05}>
                    <li className="relative rounded-xl border border-border bg-surface p-5">
                      <span
                        aria-hidden="true"
                        className="absolute -left-[31px] top-6 h-3 w-3 rounded-full border-2 border-accent bg-background"
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold">{item.role}</h3>
                        <span className="text-xs font-medium text-accent">{item.period}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted">{item.company}</p>
                      {item.description && (
                        <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
                      )}
                    </li>
                  </Reveal>
                ))}
              </ol>
            </section>
          )}

          {about.skills.groups.length > 0 && (
            <section>
              <Reveal>
                <h2 className="text-2xl font-bold tracking-normal">{about.skills.title}</h2>
              </Reveal>
              <div className="mt-6 space-y-5">
                {about.skills.groups.map((group) => (
                  <Reveal key={group.title}>
                    <h3 className="text-sm font-semibold text-muted">{group.title}</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {group.items.map((skill) => (
                        <li
                          key={skill}
                          className="rounded-full border border-border bg-surface px-3 py-1 text-sm"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {about.education.items.length > 0 && (
            <section>
              <Reveal>
                <h2 className="text-2xl font-bold tracking-normal">{about.education.title}</h2>
              </Reveal>
              <ul className="mt-6 space-y-3">
                {about.education.items.map((item, index) => (
                  <Reveal key={`${item.school}-${index}`} delay={index * 0.05}>
                    <li className="rounded-xl border border-border bg-surface p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-semibold">{item.school}</h3>
                        <span className="text-xs font-medium text-accent">{item.period}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted">{item.degree}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </section>
          )}

          <section className="grid gap-4 sm:grid-cols-2">
            {[about.mission, about.vision].map((block) => (
              <Reveal key={block.title}>
                <article className="h-full rounded-xl border border-border bg-surface p-6">
                  <h2 className="text-xl font-bold tracking-normal text-accent">{block.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{block.text}</p>
                </article>
              </Reveal>
            ))}
          </section>

          <section>
            <Reveal>
              <h2 className="text-2xl font-bold tracking-normal">{about.values.title}</h2>
            </Reveal>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {about.values.items.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.05}>
                  <article className="h-full rounded-xl border border-border bg-surface p-5">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
