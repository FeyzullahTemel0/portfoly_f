"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  FiActivity, FiBriefcase, FiEdit3, FiExternalLink, FiFolder, FiHome, FiInbox, FiLayers, FiLogOut, FiMenu,
  FiMessageSquare, FiSearch, FiSettings, FiTarget, FiUser, FiUsers, FiX,
} from "react-icons/fi";
import { BrandMark } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { logout } from "./actions";

type Props = { email: string; counts: { quotes: number; messages: number }; profile: { name: string; photo: string }; children: ReactNode };

const navGroups = [
  {
    title: "Genel",
    items: [
      { href: "/admin", label: "Panel", icon: FiHome, exact: true },
      { href: "/admin/quotes", label: "Teklifler", icon: FiInbox, badge: "quotes" },
      { href: "/admin/messages", label: "Mesajlar", icon: FiMessageSquare, badge: "messages" },
      { href: "/admin/analytics", label: "Analitik & Güvenlik", icon: FiActivity },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/services", label: "Hizmetler & Fiyatlar", icon: FiLayers },
      { href: "/admin/projects", label: "Projeler", icon: FiFolder },
      { href: "/admin/references", label: "Referanslar", icon: FiBriefcase },
      { href: "/admin/team", label: "Ekip", icon: FiUsers },
      { href: "/admin/content", label: "Site İçeriği", icon: FiEdit3 },
    ],
  },
  {
    title: "Gelir",
    items: [{ href: "/admin/ads", label: "Reklamlar", icon: FiTarget }],
  },
  {
    title: "Ayarlar",
    items: [
      { href: "/admin/settings", label: "İletişim & Sosyal", icon: FiSettings },
      { href: "/admin/seo", label: "SEO", icon: FiSearch },
      { href: "/admin/profile", label: "Profil", icon: FiUser },
    ],
  },
] as const;

export function AdminShell({ email, counts, profile, children }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const display = profile.name || email;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <div className="flex items-center gap-2.5 text-lg font-bold tracking-normal">
          <BrandMark />
          <span>ROVAX<span className="text-accent"> SOFTWARE</span></span>
        </div>
        <p className="mt-1 text-xs text-muted">Yönetim Paneli</p>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Yönetim menüsü">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-muted/80">{group.title}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const count = "badge" in item ? counts[item.badge] : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-gradient-to-r from-accent/20 to-accent-2/10 text-accent" : "text-muted hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">{count}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <Link href="/admin/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-background">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-accent-foreground">
            {profile.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.photo} alt="" className="h-full w-full object-cover" />
            ) : (
              display.slice(0, 2).toLocaleUpperCase("tr")
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{display}</span>
            <span className="block truncate text-xs text-muted">{email}</span>
          </span>
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-1.5 text-sm text-muted hover:text-foreground">
          <FiExternalLink className="h-4 w-4" aria-hidden="true" /> Siteyi gör
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle label="Temayı değiştir" />
          <form action={logout} className="flex-1">
            <button type="submit" className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:border-red-500 hover:text-red-500">
              <FiLogOut className="h-4 w-4" aria-hidden="true" /> Çıkış
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-border bg-surface lg:block">{sidebar}</aside>

      <div className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
        <div className="flex items-center gap-2 font-bold tracking-normal">
          <BrandMark />
          <span>ROVAX<span className="text-accent"> SOFTWARE</span></span>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Menü" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
          {open ? <FiX className="h-4 w-4" /> : <FiMenu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-14 z-30 lg:hidden">
          <button type="button" aria-label="Menüyü kapat" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60" />
          <aside className="relative h-full w-72 max-w-[88%] border-r border-border bg-surface">{sidebar}</aside>
        </div>
      )}

      <main className="min-w-0 px-4 py-8 sm:px-8">
        {children}
      </main>
    </div>
  );
}
