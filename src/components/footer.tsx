import Link from "next/link";
import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { socialIcons } from "@/components/social-icons";
import type { Dictionary } from "@/dictionaries/tr";
import type { Locale } from "@/lib/locales";
import { BrandImage } from "@/components/brand-logo";
import { PrivacyPreferencesButton } from "@/components/analytics-consent";
import { groupServices } from "@/lib/service-groups";
import { getContactItems, getSocialItems, type Settings } from "@/lib/site";

type FooterProps = { lang: Locale; dict: Dictionary; settings: Settings };

const contactIcons = { phone: FiPhone, email: FiMail, address: FiMapPin } as const;
const FOOTER_SERVICES_PER_GROUP = 3;

export function Footer({ lang, dict, settings }: FooterProps) {
  const contactItems = getContactItems(settings, lang);
  const socials = getSocialItems(settings);
  const serviceGroups = groupServices(dict.services);
  const linkClass = "text-sm text-muted transition-colors hover:text-foreground";
  const headingClass = "text-sm font-semibold";

  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-9 px-4 py-10 sm:grid-cols-2 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[1.1fr_2.9fr_1fr_1fr_1.3fr]">
        <div className="col-span-2 lg:col-span-1">
          <Link href={`/${lang}`} className="block max-w-[13rem]" aria-label={`${dict.brand.name} ${dict.brand.suffix}`}>
            <BrandImage className="w-full max-w-[13rem]" />
          </Link>
          <p className="mt-4 border-l-2 border-accent pl-3 text-xs leading-5 text-muted">{dict.footer.text}</p>
        </div>

        <nav aria-label={dict.footer.services} className="hidden sm:col-span-2 sm:block lg:col-span-1 lg:border-l lg:border-border lg:pl-6">
          <p className={headingClass}>{dict.footer.services}</p>
          <div className="mt-4 grid grid-cols-3 gap-x-5">
            {serviceGroups.map((group) => (
              <div key={group.key}>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">{group.heading}</p>
                <ul className="mt-3 space-y-2">
                  {group.items.slice(0, FOOTER_SERVICES_PER_GROUP).map((item) => (
                    <li key={item.slug}>
                      <Link href={`/${lang}/services/${item.slug}`} className={linkClass}>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link href={`/${lang}/services`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
            {dict.services.all}
            <span aria-hidden="true" className="rtl:rotate-180">→</span>
          </Link>
        </nav>

        <nav aria-label={dict.footer.company} className="lg:col-span-1 lg:border-l lg:border-border lg:pl-6">
          <p className={headingClass}>{dict.footer.company}</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link href={`/${lang}/about`} className={linkClass}>{dict.nav.about}</Link></li>
            <li><Link href={`/${lang}/team`} className={linkClass}>{dict.nav.team}</Link></li>
            <li><Link href={`/${lang}/packages`} className={linkClass}>{dict.nav.packages}</Link></li>
            <li><Link href={`/${lang}/process`} className={linkClass}>{dict.nav.process}</Link></li>
            <li><Link href={`/${lang}/insights`} className={linkClass}>{dict.nav.insights}</Link></li>
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

        <div className="col-span-2 lg:col-span-1 lg:border-l lg:border-border lg:pl-6">
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
                  if (!Icon) return null;
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
          © {new Date().getFullYear()} {settings.legalName}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
