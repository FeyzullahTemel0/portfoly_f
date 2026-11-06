"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiBookOpen, FiGrid, FiHome, FiSend } from "react-icons/fi";
import type { Locale } from "@/lib/locales";

type Props = {
  lang: Locale;
  labels: { home: string; services: string; insights: string; quote: string };
};

// Mobil ve tablette uygulama hissi veren alt sekme çubuğu; masaüstünde gizlenir.
export function MobileTabBar({ lang, labels }: Props) {
  const pathname = usePathname();
  const tabs = [
    { href: `/${lang}`, label: labels.home, Icon: FiHome, exact: true },
    { href: `/${lang}/services`, label: labels.services, Icon: FiGrid },
    { href: `/${lang}/insights`, label: labels.insights, Icon: FiBookOpen },
  ];

  return (
    <nav aria-label="Mobil sekmeler" className="glass safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-border lg:hidden">
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4 items-center px-2">
        {tabs.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition-colors active:scale-95 ${active ? "text-accent" : "text-muted"}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <Link
            href={`/${lang}/contact`}
            className="button-primary mx-auto flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-bold transition active:scale-95"
          >
            <FiSend className="h-4 w-4" aria-hidden="true" />
            {labels.quote}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
