import type { MetadataRoute } from "next";
import { getDictionary, getSettings } from "@/dictionaries";
import { getAllArticleSlugs } from "@/lib/articles";
import { getAllReferenceSlugs } from "@/lib/references";
import { locales } from "@/lib/locales";
import { safeUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { seo } = await getSettings();
  const siteUrl = safeUrl(seo.siteUrl);
  if (!siteUrl || !seo.allowIndex) return [];

  const [dictionaries, articleSlugs, referenceSlugs] = await Promise.all([
    Promise.all(locales.map((lang) => getDictionary(lang))),
    getAllArticleSlugs(),
    getAllReferenceSlugs(),
  ]);

  const entries = locales.flatMap((lang, index) => {
    const dict = dictionaries[index];
    const paths = [
      "",
      "/about",
      "/team",
      "/services",
      "/packages",
      "/process",
      "/insights",
      "/references",
      "/contact",
      "/legal/kvkk",
      "/legal/terms",
      "/legal/privacy",
      ...dict.services.items.map((item) => `/services/${item.slug}`),
      ...articleSlugs.map((slug) => `/insights/${slug}`),
      ...referenceSlugs.map((slug) => `/references/${slug}`),
    ];
    return paths.map((path) => ({
      url: `${siteUrl}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? "weekly" as const : "monthly" as const,
      priority: path === "" ? 1 : path.startsWith("/services/") || path.startsWith("/insights/") ? 0.7 : 0.5,
    }));
  });

  return entries;
}
