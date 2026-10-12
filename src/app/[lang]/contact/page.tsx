import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaInstagram, FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import type { IconType } from "react-icons";
import { ContactForms } from "@/components/contact-forms";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getDictionary, getSettings } from "@/dictionaries";
import { isLocale } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";
import { getContactItems, getSocialItems } from "@/lib/site";

const contactIcons = { phone: FiPhone, email: FiMail, address: FiMapPin } as const;
const socialIcons: Record<string, IconType> = {
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
  whatsapp: FaWhatsapp,
};

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { contact, brand } = await getDictionary(lang);
  return { title: `${contact.title} | ${brand.name} ${brand.suffix}`, description: contact.text, alternates: localizedAlternates(lang, "/contact") };
}

export default async function ContactPage({
  params,
  searchParams,
}: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const query = await searchParams;
  const dict = await getDictionary(lang);
  const settings = await getSettings();
  const { contact } = dict;

  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const requestedService = first(query.service);
  const initialService = dict.services.items.some((item) => item.slug === requestedService)
    ? requestedService
    : undefined;
  const initialPackage = first(query.package)?.slice(0, 80);

  const items = getContactItems(settings, lang);
  const socials = getSocialItems(settings);
  const labels = { phone: contact.phone, email: contact.email, address: contact.address };

  return (
    <>
      {socials.length > 0 && (
        <section className="mx-auto flex max-w-6xl flex-col gap-3 border-y border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-sm font-semibold">{contact.followUs}</h2>
          <ul className="flex flex-wrap gap-2" aria-label={contact.social}>
            {socials.map((social) => {
              const Icon = socialIcons[social.key];
              return (
                <li key={social.key}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <PageHero title={contact.title} text={contact.text} />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForms
            lang={lang}
            form={dict.contactForm}
            services={dict.services.items.map(({ slug, title }) => ({ slug, title }))}
            sizes={dict.process.page.sizes}
            initialService={initialService}
            initialPackage={initialPackage}
          />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <div className="space-y-6 rounded-2xl border border-border bg-surface p-6">
              <h2 className="text-lg font-bold">{contact.ctaTitle}</h2>
              <ul className="space-y-4">
                {items.map((item) => {
                  const Icon = contactIcons[item.key];
                  const content = (
                    <>
                      <Icon className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>
                        <span className="block text-xs text-muted">{labels[item.key]}</span>
                        <span className="font-medium">{item.value}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={item.key}>
                      {item.href ? (
                        <a href={item.href} className="flex gap-3 hover:text-accent">
                          {content}
                        </a>
                      ) : (
                        <p className="flex gap-3">{content}</p>
                      )}
                    </li>
                  );
                })}
              </ul>

            </div>
          </Reveal>
        </aside>
      </section>
    </>
  );
}
