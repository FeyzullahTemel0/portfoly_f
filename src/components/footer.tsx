import Link from "next/link";
import type { IconType } from "react-icons";
import { FaInstagram, FaLinkedinIn, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import type { Dictionary } from "@/dictionaries/tr";
import type { Locale } from "@/lib/locales";
import { BrandImage } from "@/components/brand-logo";
import { PrivacyPreferencesButton } from "@/components/analytics-consent";
import { getContactItems, getSocialItems, type Settings } from "@/lib/site";

type FooterProps = { lang: Locale; dict: Dictionary; settings: Settings };

const contactIcons = { phone: FiPhone, email: FiMail, address: FiMapPin } as const;
const socialIcons: Record<string, IconType> = {
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
  whatsapp: FaWhatsapp,
};

export function Footer({ lang, dict, settings }: FooterProps) {
  const contactItems = getContactItems(settings, lang);
  const socials = getSocialItems(settings);
  const serviceColumns = [
    dict.services.items.filter((_, index) => index % 2 === 0),
    dict.services.items.filter((_, index) => index % 2 === 1),
  ];
  const linkClass = "text-sm text-muted transition-colors hover:text-foreground";
  const headingClass = "text-sm font-semibold";

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-6">
        <div>
          <Link href={`/${lang}`} className="inline-flex" aria-label={`${dict.brand.name} ${dict.brand.suffix}`}>
            <BrandImage className="h-28 w-28" />
          </Link>
          <p className="mt-4 border-l-2 border-accent pl-3 text-xs leading-5 text-muted">{dict.footer.text}</p>
        </div>

        <nav aria-label={dict.footer.services} className="lg:col-span-2 lg:border-l lg:border-border lg:pl-6">
          <p className={headingClass}>{dict.footer.services}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-4">
            {serviceColumns.map((column, index) => (
              <ul key={index} className={`space-y-2 ${index === 1 ? "border-l border-border pl-4" : ""}`}>
                {column.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/${lang}/services/${item.slug}`} className={linkClass}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </nav>

        <nav aria-label={dict.footer.company} className="lg:col-span-1 lg:border-l lg:border-border lg:pl-6">
          <p className={headingClass}>{dict.footer.company}</p>
          <ul className="mt-4 space-y-2">
            <li><Link href={`/${lang}/about`} className={linkClass}>{dict.nav.about}</Link></li>
            <li><Link href={`/${lang}/team`} className={linkClass}>{dict.nav.team}</Link></li>
            <li><Link href={`/${lang}/packages`} className={linkClass}>{dict.nav.packages}</Link></li>
            <li><Link href={`/${lang}/process`} className={linkClass}>{dict.nav.process}</Link></li>
            <li><Link href={`/${lang}/projects`} className={linkClass}>{dict.nav.projects}</Link></li>
            <li><Link href={`/${lang}/references`} className={linkClass}>{dict.nav.references}</Link></li>
            <li><Link href={`/${lang}/contact`} className={linkClass}>{dict.nav.contact}</Link></li>
          </ul>
        </nav>

        <nav aria-label={dict.footer.legal} className="lg:col-span-1 lg:border-l lg:border-border lg:pl-6">
          <p className={headingClass}>{dict.footer.legal}</p>
          <ul className="mt-4 space-y-2">
            {dict.legal.items.map((item) => (
              <li key={item.slug}>
                <Link href={`/${lang}/legal/${item.slug}`} className={linkClass}>
                  {item.title}
                </Link>
              </li>
            ))}
            <li><PrivacyPreferencesButton lang={lang} /></li>
          </ul>
        </nav>

        <div className="lg:col-span-1 lg:border-l lg:border-border lg:pl-6">
          <p className={headingClass}>{dict.footer.contact}</p>
          <ul className="mt-4 space-y-3">
            {contactItems.map((item) => {
              const Icon = contactIcons[item.key];
              const content = (
                <>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>{item.value}</span>
                </>
              );
              return (
                <li key={item.key}>
                  {item.href ? (
                    <a href={item.href} className={`flex gap-3 ${linkClass}`}>
                      {content}
                    </a>
                  ) : (
                    <p className="flex gap-3 text-sm text-muted">{content}</p>
                  )}
                </li>
              );
            })}
          </ul>

          {socials.length > 0 && (
            <div className="mt-6">
              <p className={headingClass}>{dict.footer.social}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
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
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted transition-colors hover:border-accent hover:text-accent"
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} {dict.brand.name} {dict.brand.suffix}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
