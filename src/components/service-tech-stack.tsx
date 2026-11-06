import { FiFileText, FiLink, FiMail, FiMessageCircle, FiShoppingBag, FiSmartphone, FiTerminal } from "react-icons/fi";
import { SiAndroid, SiDart, SiFlutter, SiMongodb, SiNextdotjs, SiPostgresql, SiPython, SiSqlite, SiTailwindcss, SiTypescript } from "react-icons/si";
import type { IconType } from "react-icons";

type Tech = { label: string; icon: IconType };
const tech: Record<string, Tech> = {
  next: { label: "Next.js", icon: SiNextdotjs },
  typescript: { label: "TypeScript", icon: SiTypescript },
  tailwind: { label: "Tailwind CSS", icon: SiTailwindcss },
  mongodb: { label: "MongoDB", icon: SiMongodb },
  python: { label: "Python", icon: SiPython },
  sqlite: { label: "SQLite", icon: SiSqlite },
  flutter: { label: "Flutter", icon: SiFlutter },
  dart: { label: "Dart", icon: SiDart },
  android: { label: "Android", icon: SiAndroid },
  ios: { label: "iOS", icon: FiSmartphone },
  shopier: { label: "Shopier", icon: FiShoppingBag },
  rest: { label: "REST API", icon: FiLink },
  whatsapp: { label: "WhatsApp API", icon: FiMessageCircle },
  email: { label: "E-posta API", icon: FiMail },
  pdf: { label: "PDF", icon: FiFileText },
  shell: { label: "Dosya otomasyonu", icon: FiTerminal },
  postgres: { label: "PostgreSQL", icon: SiPostgresql },
};

const serviceStack: Record<string, string[]> = {
  "corporate-website": ["next", "typescript", "tailwind", "mongodb"],
  "comprehensive-ecommerce": ["next", "typescript", "mongodb", "rest"],
  "shopier-ecommerce": ["next", "shopier", "rest"],
  "booking-systems": ["next", "mongodb", "email"],
  "personal-blog": ["next", "typescript", "mongodb"],
  "custom-software": ["next", "typescript", "mongodb", "python"],
  "admin-panel": ["next", "typescript", "mongodb"],
  "windows-desktop-apps": ["python", "sqlite"],
  "crm-panel": ["next", "typescript", "mongodb"],
  "clinic-automation": ["next", "mongodb", "email"],
  "dietitian-beauty-software": ["next", "mongodb", "email"],
  "inventory-warehouse": ["python", "sqlite", "rest"],
  "car-gallery-platform": ["next", "mongodb", "rest"],
  "staff-tracking": ["next", "mongodb", "email"],
  "finance-cash-management": ["python", "sqlite", "pdf"],
  "api-integrations": ["rest", "typescript", "python"],
  "landing-pages": ["next", "typescript", "tailwind"],
  "qr-menu": ["next", "mongodb", "rest"],
  "desktop-bookkeeping": ["python", "sqlite", "pdf"],
  "task-goal-tracking": ["python", "sqlite"],
  "pdf-invoice-automation": ["python", "pdf", "shell"],
  "customer-reminders": ["whatsapp", "email", "rest"],
  "backup-file-organizer": ["python", "sqlite", "shell"],
  "mobile-app-development": ["flutter", "dart", "ios", "android", "rest"],
  "mvp-development": ["next", "typescript", "tailwind", "mongodb"],
  "saas-development": ["next", "typescript", "postgres", "rest"],
};

export function ServiceTechStack({ slug, title, note }: { slug: string; title: string; note: string }) {
  const keys = serviceStack[slug] ?? ["next", "typescript"];
  return (
    <section aria-label={title} className="rounded-xl border border-border bg-surface p-4 sm:rounded-2xl sm:p-6">
      <h2 className="text-sm font-bold sm:text-base">{title}</h2>
      <p className="mt-1 text-[11px] leading-5 text-muted sm:text-xs">{note}</p>
      <ul className="mt-3 flex flex-wrap gap-2 sm:mt-4">
        {keys.map((key) => {
          const item = tech[key];
          const Icon = item.icon;
          return <li key={key} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[10px] font-semibold sm:px-3 sm:text-xs"><Icon className="h-3.5 w-3.5 text-accent sm:h-4 sm:w-4" aria-hidden="true" />{item.label}</li>;
        })}
      </ul>
    </section>
  );
}
