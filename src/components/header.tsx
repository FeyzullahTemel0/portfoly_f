"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import type { Dictionary } from "@/dictionaries/tr";
import type { Locale } from "@/lib/locales";
import { BrandMark } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";

type MenuItem = { href: string; label: string };
type MenuGroup = { heading?: string; items: MenuItem[] };
type Menu = { label: string; groups: MenuGroup[]; footer?: MenuItem };

type HeaderProps = {
  lang: Locale;
  brand: Dictionary["brand"];
  nav: Dictionary["nav"];
  language: Dictionary["language"];
  serviceGroups: { heading: string; items: { slug: string; title: string }[] }[];
  allServicesLabel: string;
};

const linkClass = "text-sm text-muted transition-colors hover:text-foreground";
const localeLabels: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  ar: "العربية",
};

function DesktopMenu({ menu, onNavigate }: { menu: Menu; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function close() {
    setOpen(false);
    onNavigate();
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`${linkClass} inline-flex items-center gap-1`}
      >
        {menu.label}
        <FiChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3">
          <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-xl">
            {menu.groups.map((group, index) => (
              <div key={index} className={index > 0 ? "mt-1 border-t border-border pt-1" : ""}>
                {group.heading && (
                  <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-normal text-accent">{group.heading}</p>
                )}
                <ul>
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface hover:text-accent"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {menu.footer && (
              <Link
                href={menu.footer.href}
                onClick={close}
                className="mt-1 block rounded-lg border-t border-border px-3 py-2 pt-3 text-sm font-semibold text-accent transition-colors hover:bg-surface"
              >
                {menu.footer.label} →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu({ menu, onNavigate }: { menu: Menu; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between py-2 text-sm text-muted hover:text-foreground"
      >
        {menu.label}
        <FiChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="mb-2 ml-3 border-l border-border pl-3">
          {menu.groups.map((group, index) => (
            <div key={index}>
              {group.heading && (
                <p className="pb-1 pt-3 text-xs font-semibold uppercase tracking-normal text-accent">{group.heading}</p>
              )}
              <ul>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={onNavigate} className="block py-2 text-sm hover:text-accent">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {menu.footer && (
            <Link href={menu.footer.href} onClick={onNavigate} className="block py-2 text-sm font-semibold text-accent">
              {menu.footer.label} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export function Header({ lang, brand, nav, language, serviceGroups, allServicesLabel }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const servicesMenu: Menu = {
    label: nav.services,
    groups: serviceGroups.map((group) => ({
      heading: group.heading,
      items: group.items.map((service) => ({ href: `/${lang}/services/${service.slug}`, label: service.title })),
    })),
    footer: { href: `/${lang}/services`, label: allServicesLabel },
  };
  const aboutMenu: Menu = {
    label: nav.about,
    groups: [
      {
        items: [
          { href: `/${lang}/about`, label: nav.about },
          { href: `/${lang}/team`, label: nav.team },
        ],
      },
    ],
  };
  const links = [
    { href: `/${lang}/packages`, label: nav.packages },
    { href: `/${lang}/process`, label: nav.process },
    { href: `/${lang}/projects`, label: nav.projects },
    { href: `/${lang}/references`, label: nav.references },
    { href: `/${lang}/contact`, label: nav.contact },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={`/${lang}`} className="inline-flex items-center gap-2.5 text-base font-bold tracking-normal" onClick={closeMobile}>
          <BrandMark />
          <span>{brand.name}<span className="text-accent"> {brand.suffix}</span></span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Ana menü">
          <DesktopMenu menu={servicesMenu} onNavigate={closeMobile} />
          {links.slice(0, 4).map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
          <DesktopMenu menu={aboutMenu} onNavigate={closeMobile} />
          <Link href={links[4].href} className={linkClass}>
            {links[4].label}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <details className="group relative">
            <summary aria-label={language.label} className="flex h-9 cursor-pointer list-none items-center gap-1 rounded-lg border border-border bg-surface px-3 text-xs font-semibold transition-colors hover:border-accent">
              {lang.toUpperCase()} <FiChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="absolute end-0 top-full z-50 mt-2 min-w-36 rounded-lg border border-border bg-background p-1 shadow-xl">
              {Object.entries(localeLabels).map(([locale, label]) => {
                const target = locale as Locale;
                const href = pathname.replace(`/${lang}`, `/${target}`) || `/${target}`;
                return <Link key={target} href={href} lang={target} hrefLang={target} className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-surface ${target === lang ? "font-semibold text-accent" : "text-foreground"}`}>{label}</Link>;
              })}
            </div>
          </details>
          <ThemeToggle label={nav.theme} />
          <Link
            href={`/${lang}/contact`}
            className="button-primary hidden h-9 items-center rounded-md px-4 text-sm font-semibold transition-opacity sm:inline-flex"
          >
            {nav.quote}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-expanded={mobileOpen}
            aria-label={nav.menu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface lg:hidden"
          >
            {mobileOpen ? <FiX className="h-4 w-4" aria-hidden="true" /> : <FiMenu className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="max-h-[80vh] overflow-y-auto border-t border-border bg-background px-4 py-3 lg:hidden" aria-label="Mobil menü">
          <MobileMenu menu={servicesMenu} onNavigate={closeMobile} />
          {links.slice(0, 4).map((link) => (
            <Link key={link.href} href={link.href} onClick={closeMobile} className="block py-2 text-sm text-muted hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <MobileMenu menu={aboutMenu} onNavigate={closeMobile} />
          <Link href={links[4].href} onClick={closeMobile} className="block py-2 text-sm text-muted hover:text-foreground">
            {links[4].label}
          </Link>
        </nav>
      )}
    </header>
  );
}
