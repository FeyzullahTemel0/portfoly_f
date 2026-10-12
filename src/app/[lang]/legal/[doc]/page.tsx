import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { getDictionary, getSettings } from "@/dictionaries";
import { fillLegalTokens, isLegalSlug, legalSlugs } from "@/lib/legal";
import { isLocale, locales } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return locales.flatMap((lang) => legalSlugs.map((doc) => ({ lang, doc })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/legal/[doc]">): Promise<Metadata> {
  const { lang, doc } = await params;
  if (!isLocale(lang)) return {};
  const { legal, brand } = await getDictionary(lang);
  const item = legal.items.find((i) => i.slug === doc);
  if (!item) return {};
  return { title: `${item.title} | ${brand.name} ${brand.suffix}`, alternates: localizedAlternates(lang, `/legal/${doc}`) };
}

export default async function LegalPage({ params }: PageProps<"/[lang]/legal/[doc]">) {
  const { lang, doc } = await params;
  if (!isLocale(lang) || !isLegalSlug(doc)) notFound();
  const dict = await getDictionary(lang);
  const settings = await getSettings();
  const item = dict.legal.items.find((i) => i.slug === doc);
  if (!item) notFound();
  const fill = (text: string) => fillLegalTokens(text, lang, settings);

  return (
    <>
      <PageHero title={item.title} text={`${dict.legal.updated}: ${settings.legalUpdated}`} />
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6">
        {dict.legal.translationNotice && <p role="note" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-6">{dict.legal.translationNotice}</p>}
        {dict.legalDocs[doc].map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-7 text-muted">
                {fill(paragraph)}
              </p>
            ))}
          </section>
        ))}
      </article>
    </>
  );
}
