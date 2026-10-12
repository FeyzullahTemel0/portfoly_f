import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { safeUrl } from "@/lib/site";
import { getTeam } from "@/lib/team";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/team">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { team, brand } = await getDictionary(lang);
  return { title: `${team.title} | ${brand.name} ${brand.suffix}`, description: team.text, alternates: localizedAlternates(lang, "/team") };
}

export default async function TeamPage({ params }: PageProps<"/[lang]/team">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [{ team, hero }, members] = await Promise.all([getDictionary(lang), getTeam(lang)]);

  return (
    <>
      <PageHero title={team.title} text={team.text} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {members.length === 0 ? (
          <p className="rounded-xl border border-border bg-surface p-8 text-center text-muted">{team.empty}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member, index) => {
              const socials = [
                { label: "LinkedIn", href: safeUrl(member.linkedin), Icon: FaLinkedinIn },
                { label: "Instagram", href: safeUrl(member.instagram), Icon: FaInstagram },
                { label: "X", href: safeUrl(member.x), Icon: FaXTwitter },
              ].filter((social) => social.href);
              return (
                <Reveal key={member.id} delay={(index % 3) * 0.08}>
                  <article className="group h-full overflow-hidden rounded-2xl border border-border bg-background transition duration-300 hover:-translate-y-1.5 hover:border-accent hover:shadow-2xl hover:shadow-accent/10">
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-accent/20 to-teal-500/25">
                      {member.photoUrl ? (
                        <Image src={member.photoUrl} alt={member.name} fill sizes="(min-width: 1024px) 360px, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-6xl font-black text-accent/60">
                          {member.name.slice(0, 1).toLocaleUpperCase("tr")}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold">{member.name}</h2>
                      {member.role && <p className="mt-1 text-sm font-medium text-accent">{member.role}</p>}
                      {member.bio && <p className="mt-3 text-sm leading-6 text-muted">{member.bio}</p>}
                      {socials.length > 0 && (
                        <ul className="mt-4 flex gap-2">
                          {socials.map(({ label, href, Icon }) => (
                            <li key={label}>
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${member.name} ${label}`}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent hover:text-accent"
                              >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        <Reveal>
          <div className="cta-band relative mt-20 overflow-hidden rounded-3xl p-10 text-center text-white shadow-2xl sm:p-14">
            <div aria-hidden="true" className="animate-blob absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">{team.ctaTitle}</h2>
              <p className="mx-auto mt-3 max-w-xl text-white/85">{team.ctaText}</p>
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
