import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/process">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { process, brand } = await getDictionary(lang);
  return {
    title: `${process.page.title} | ${brand.name} ${brand.suffix}`,
    description: process.page.text,
    alternates: localizedAlternates(lang, "/process"),
  };
}

export default async function ProcessPage({ params }: PageProps<"/[lang]/process">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { process } = await getDictionary(lang);
  const page = process.page;

  return (
    <>
      <PageHero title={page.title} text={page.text} />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-normal">{page.timelineTitle}</h2>
        </Reveal>
        <ol className="mt-8 space-y-4 border-l border-border pl-6">
          {page.timeline.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.05}>
              <li className="relative rounded-xl border border-border bg-surface p-5">
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] top-6 h-3 w-3 rounded-full border-2 border-accent bg-background"
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    <span className="mr-2 text-accent">{String(index + 1).padStart(2, "0")}</span>
                    {step.title}
                  </h3>
                  <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-accent">
                    {step.duration}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-normal">{page.sizesTitle}</h2>
          </Reveal>

          <div className="mt-8 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  <th className="px-4 py-3 font-semibold">{page.serviceLabel}</th>
                  {page.sizes.map((size) => (
                    <th key={size.name} className="px-4 py-3 align-top">
                      <span className="font-semibold">{size.name}</span>
                      <span className="mt-0.5 block text-xs font-normal text-muted">{size.text}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.rows.map((row) => (
                  <tr key={row.service} className="border-t border-border">
                    <th scope="row" className="px-4 py-3 font-medium">{row.service}</th>
                    {row.durations.map((duration, index) => (
                      <td key={index} className="px-4 py-3 text-muted">{duration}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-muted">{page.note}</p>
          <Link
            href={`/${lang}/contact`}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            {page.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
