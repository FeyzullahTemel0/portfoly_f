import type { Locale } from "@/lib/locales";

export const CURRENCIES = ["TRY", "USD", "EUR", "GBP", "SAR", "AED", "CHF"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const localeCurrency: Record<Locale, Currency> = { tr: "TRY", en: "USD", de: "EUR", fr: "EUR", ar: "SAR" };
export type Rates = Record<string, number>;

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (CURRENCIES as readonly string[]).includes(value);
}

// Kurlar USD tabanlıdır: önce USD'ye, sonra hedef para birimine çevrilir.
export function convert(amount: number, from: string, to: string, rates: Rates) {
  if (from === to) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
}

const localeTags: Record<Locale, string> = { tr: "tr-TR", en: "en-US", de: "de-DE", fr: "fr-FR", ar: "ar-SA" };

// Büyük tutarları yuvarlayarak okunaklı gösterir (ör. 12.450 yerine 12.450 ₺).
export function formatMoney(amount: number, currency: string, lang: Locale) {
  const rounded = amount >= 100 ? Math.round(amount / 10) * 10 : Math.round(amount * 100) / 100;
  return new Intl.NumberFormat(localeTags[lang], { style: "currency", currency, maximumFractionDigits: amount >= 100 ? 0 : 2 }).format(rounded);
}
