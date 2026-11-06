import catalog from "@/data/service-catalog.json";
import existingOverridesData from "@/data/service-overrides.json";
import type { Locale } from "@/lib/locales";

export const serviceCategories = ["web", "automation", "ecommerce"] as const;
export type ServiceCategory = (typeof serviceCategories)[number];
export type DefaultServiceItem = {
  slug: string;
  group: "software";
  catalogCategory: ServiceCategory;
  icon: string;
  title: string;
  summary: string;
  intro: string;
  notice: string;
  includes: string[];
  notIncluded: string[];
  suitable: string[];
  steps: { title: string; text: string }[];
  price: { mode: "quote"; amount: 0; currency: "TRY" };
};

export const deprecatedServiceSlugs = [
  "web-design-mockup",
  "advertising-design",
  "poster-design",
  "digital-platform-design",
  "qr-menu",
  "mobile-app-development",
  "saas-development",
] as const;

const categoryBySlug: Record<string, ServiceCategory> = {
  "corporate-website": "web",
  "comprehensive-ecommerce": "ecommerce",
  "shopier-ecommerce": "ecommerce",
  "crm-panel": "automation",
  "booking-systems": "automation",
  "personal-blog": "web",
  "custom-software": "web",
  "admin-panel": "web",
  "windows-desktop-apps": "automation",
  "clinic-automation": "automation",
  "dietitian-beauty-software": "automation",
  "inventory-warehouse": "automation",
  "car-gallery-platform": "automation",
  "staff-tracking": "automation",
  "finance-cash-management": "automation",
  "api-integrations": "automation",
  "landing-pages": "web",
  "qr-menu": "ecommerce",
  "desktop-bookkeeping": "automation",
  "task-goal-tracking": "automation",
  "pdf-invoice-automation": "automation",
  "customer-reminders": "automation",
  "backup-file-organizer": "automation",
  "mobile-app-development": "web",
  "mvp-development": "web",
  "saas-development": "web",
};

const existingOverrides = existingOverridesData as Record<string, { catalogCategory: ServiceCategory; title: Record<Locale, string>; summary: Record<Locale, string> }>;

function pick(value: Record<string, string> | undefined, lang: Locale) {
  return value?.[lang] || value?.en || value?.tr || "";
}
function pickList(value: Record<string, string[]> | undefined, lang: Locale) {
  return value?.[lang] || value?.en || value?.tr || [];
}

function defaultSteps(lang: Locale) {
  if (lang === "tr") return [
    { title: "İhtiyacı ve mevcut akışı anlama", text: "İş hedefinizi, mevcut araçları ve çözülmesi gereken adımları birlikte netleştiririz." },
    { title: "Kapsam ve tasarım", text: "Ekranları, rolleri, entegrasyonları ve teslim ölçütlerini yazılı kapsamda belirleriz." },
    { title: "Geliştirme ve doğrulama", text: "Onaylanan kapsamı aşamalı geliştirir, örnek senaryolarla test ederiz." },
    { title: "Teslim ve kullanım aktarımı", text: "Çözümü kararlaştırılan ortamda teslim eder, kullanımını ekibinizle gözden geçiririz." },
  ];
  return [
    { title: "Review needs and workflow", text: "We clarify your goals, current tools and the steps that need improvement." },
    { title: "Scope and design", text: "We document screens, roles, integrations and delivery criteria." },
    { title: "Build and verify", text: "We develop the approved scope in stages and test it with practical scenarios." },
    { title: "Handover", text: "We deliver to the agreed environment and walk your team through the workflow." },
  ];
}

export function getCatalogCategory(slug: string): ServiceCategory {
  return existingOverrides[slug]?.catalogCategory ?? categoryBySlug[slug] ?? "web";
}

type BaseService = { slug: string; group?: string; icon?: string; title: string; summary: string; intro?: string; notice?: string; includes?: string[]; notIncluded?: string[]; suitable?: string[]; steps?: { title: string; text: string }[]; price?: { mode: "from" | "fixed" | "quote"; amount: number; currency: string } };
type CatalogService = {
  slug: string;
  catalogCategory: ServiceCategory;
  icon: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  intro: Partial<Record<Locale, string>>;
  notice: Partial<Record<Locale, string>>;
  includes: Partial<Record<Locale, string[]>>;
  notIncluded: Partial<Record<Locale, string[]>>;
  suitable: Partial<Record<Locale, string[]>>;
};

export function getDefaultServiceItems(lang: Locale, items: readonly BaseService[]): DefaultServiceItem[] {
  const existing = items
    .filter((item) => !deprecatedServiceSlugs.includes(item.slug as (typeof deprecatedServiceSlugs)[number]))
    .map((item) => {
      const override = existingOverrides[item.slug];
      return {
        slug: item.slug,
        group: "software" as const,
        catalogCategory: getCatalogCategory(item.slug),
        icon: item.icon || item.slug,
        title: override?.title[lang] || override?.title.en || item.title,
        summary: override?.summary[lang] || override?.summary.en || item.summary,
        intro: item.intro ?? "",
        notice: item.notice ?? "",
        includes: item.includes ?? [],
        notIncluded: item.notIncluded ?? [],
        suitable: item.suitable ?? [],
        steps: item.steps ?? [],
        price: { mode: "quote" as const, amount: 0 as const, currency: "TRY" as const },
      };
    });
  const extra = (catalog as CatalogService[]).filter((item) => !deprecatedServiceSlugs.includes(item.slug as (typeof deprecatedServiceSlugs)[number])).map((item) => {
    const sourceLocale = lang === "tr" ? "tr" : "en";
    return {
      slug: item.slug,
      group: "software",
      catalogCategory: item.catalogCategory,
      icon: item.icon,
      title: pick(item.title, lang),
      summary: pick(item.summary, lang),
      intro: pick(item.intro, lang),
      notice: pick(item.notice, lang),
      includes: pickList(item.includes, lang),
      notIncluded: pickList(item.notIncluded, lang),
      suitable: pickList(item.suitable, lang),
      steps: defaultSteps(sourceLocale),
      price: { mode: "quote", amount: 0, currency: "TRY" },
    };
  });
  return [...existing, ...extra] as DefaultServiceItem[];
}
