import type { MetadataRoute } from "next";
import { getSettings } from "@/dictionaries";
import { safeUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const siteUrl = safeUrl(settings.seo.siteUrl);
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    ...(settings.seo.allowIndex && siteUrl ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}
