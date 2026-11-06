import "server-only";
import { cache } from "react";
import { connectDb } from "@/lib/db";
import { isCurrency } from "@/lib/currency";
import { locales, type Locale } from "@/lib/locales";
import { Content } from "@/models/content";
import { Service, type ServiceBlock } from "@/models/service";
import { deprecatedServiceSlugs, getCatalogCategory, type ServiceCategory } from "@/lib/service-catalog";

export type ServiceItem = {
  slug: string;
  group: "software" | "design";
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
  price: { mode: "from" | "fixed" | "quote"; amount: number; currency: string };
};

export const emptyBlock = (): ServiceBlock => ({ title: "", summary: "", intro: "", notice: "", includes: [], notIncluded: [], suitable: [], steps: [] });

const text = (value: unknown) => (typeof value === "string" ? value : "");
const list = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim() !== "") : []);
const stepList = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => ({ title: text((item as { title?: unknown })?.title), text: text((item as { text?: unknown })?.text) }))
        .filter((item) => item.title.trim() || item.text.trim())
    : [];

export function normalizeBlock(value: unknown): ServiceBlock {
  const raw = (value ?? {}) as Record<string, unknown>;
  return {
    title: text(raw.title).trim(),
    summary: text(raw.summary).trim(),
    intro: text(raw.intro).trim(),
    notice: text(raw.notice).trim(),
    includes: list(raw.includes),
    notIncluded: list(raw.notIncluded),
    suitable: list(raw.suitable),
    steps: stepList(raw.steps),
  };
}

export async function servicesAreManaged() {
  await connectDb();
  return !!(await Content.exists({ scope: "settings", key: "servicesManaged" })) || (await Service.estimatedDocumentCount()) > 0;
}

// Yönetim panelinden eklenen hizmetleri seçilen dile göre döndürür; boş alanlar EN, sonra TR ile tamamlanır.
export const getServiceItems = cache(async (lang: Locale): Promise<ServiceItem[] | null> => {
  try {
    if (!(await servicesAreManaged())) return null;
    const docs = await Service.find({ visible: true, slug: { $nin: deprecatedServiceSlugs } }).sort({ order: 1, createdAt: 1 }).lean();
    return docs.map((doc) => {
      const content = (doc.content ?? {}) as Record<string, unknown>;
      const own = normalizeBlock(content[lang]);
      const en = normalizeBlock(content.en);
      const tr = normalizeBlock(content.tr);
      const pickText = (key: "title" | "summary" | "intro" | "notice") => own[key] || en[key] || tr[key];
      const pickList = (key: "includes" | "notIncluded" | "suitable" | "steps") => (own[key].length ? own[key] : en[key].length ? en[key] : tr[key]);
      return {
        slug: doc.slug,
        group: doc.group,
        catalogCategory: doc.catalogCategory ?? getCatalogCategory(doc.slug),
        icon: doc.icon,
        title: pickText("title"),
        summary: pickText("summary"),
        intro: pickText("intro"),
        notice: pickText("notice"),
        includes: pickList("includes") as string[],
        notIncluded: pickList("notIncluded") as string[],
        suitable: pickList("suitable") as string[],
        steps: pickList("steps") as { title: string; text: string }[],
        price: { mode: doc.priceMode, amount: doc.priceAmount, currency: isCurrency(doc.priceCurrency) ? doc.priceCurrency : "TRY" },
      };
    });
  } catch (error) {
    console.error("Hizmetler yüklenemedi:", error);
    return null;
  }
});

export const serviceLocales = locales;
