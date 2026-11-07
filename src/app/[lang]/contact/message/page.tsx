import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { MessageForm } from "@/components/contact-forms";
import { getDictionary } from "@/dictionaries";
import { isLocale, type Locale } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";

const backLabel: Record<Locale, string> = {
  tr: "İletişim",
  en: "Contact",
  de: "Kontakt",
  fr: "Contact",
  ar: "تواصل معنا",
};

export async function generateMetadata({ params }: PageProps<"/[lang]/contact/message">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { contactForm, brand } = await getDictionary(lang);
  return { title: `${contactForm.message.title} | ${brand.name} ${brand.suffix}`, description: contactForm.message.text, alternates: localizedAlternates(lang, "/contact/message") };
}

export default async function MessagePage({ params }: PageProps<"/[lang]/contact/message">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { contactForm } = await getDictionary(lang);

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:px-6 sm:py-16">
      <Link href={`/${lang}/contact`} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent">
        <FiArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        {backLabel[lang]}
      </Link>
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-accent/5">
        <div aria-hidden="true" className="h-1 bg-gradient-to-r from-accent to-accent-2" />
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{contactForm.message.title}</h1>
          <p className="mb-6 mt-2 text-muted">{contactForm.message.text}</p>
          <MessageForm lang={lang} form={contactForm} />
        </div>
      </div>
    </section>
  );
}
