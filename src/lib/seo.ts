import type { Locale } from "@/lib/locales";
import { locales } from "@/lib/locales";

export function localizedAlternates(lang: Locale, path = "") {
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;
  const route = (locale: Locale) => `/${locale}${normalizedPath}`;
  const languages = Object.fromEntries(locales.map((locale) => [locale, route(locale)])) as Record<Locale, string>;
  return {
    canonical: route(lang),
    languages: {
      ...languages,
      "x-default": route("tr"),
    },
  };
}