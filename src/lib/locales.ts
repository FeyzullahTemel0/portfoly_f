export const locales = ["tr", "en", "de", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export type LocalizedText = { tr: string; en: string; de?: string; fr?: string; ar?: string };
export const defaultLocale: Locale = "tr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
