"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import { FiDollarSign } from "react-icons/fi";
import { CURRENCIES, convert, formatMoney, isCurrency, localeCurrency, type Rates } from "@/lib/currency";
import type { Locale } from "@/lib/locales";

type Context = { rates: Rates; lang: Locale };
const CurrencyContext = createContext<Context | null>(null);
const STORAGE_KEY = "currency";
const EVENT = "currency-change";

export function CurrencyProvider({ rates, lang, children }: Context & { children: ReactNode }) {
  return <CurrencyContext.Provider value={{ rates, lang }}>{children}</CurrencyContext.Provider>;
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Ziyaretçinin seçtiği para birimi; seçmediyse dilin varsayılanı.
function useCurrency() {
  const context = useContext(CurrencyContext);
  const fallback = context ? localeCurrency[context.lang] : "USD";
  const read = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return isCurrency(stored) ? stored : fallback;
    } catch {
      return fallback;
    }
  }, [fallback]);
  const currency = useSyncExternalStore(subscribe, read, () => fallback);
  const set = (next: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Depolama kapalıysa seçim kalıcı olmaz.
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return { currency, set, context };
}

export function CurrencySwitcher({ label }: { label: string }) {
  const { currency, set } = useCurrency();
  return (
    <label className="relative inline-flex h-9 items-center" title={label}>
      <span className="sr-only">{label}</span>
      <FiDollarSign aria-hidden="true" className="pointer-events-none absolute start-2.5 h-3.5 w-3.5 text-muted" />
      <select
        value={currency}
        onChange={(event) => set(event.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-lg border border-border bg-surface ps-7 pe-2 text-xs font-semibold outline-none transition-colors hover:border-accent focus:border-accent"
      >
        {CURRENCIES.map((code) => (
          <option key={code} value={code}>{code}</option>
        ))}
      </select>
    </label>
  );
}

const copy: Record<Locale, { from: (value: string) => string; quote: string }> = {
  tr: { from: (value) => `${value}'den başlayan`, quote: "Fiyat için teklif alın" },
  en: { from: (value) => `From ${value}`, quote: "Request a quote" },
  de: { from: (value) => `ab ${value}`, quote: "Preis auf Anfrage" },
  fr: { from: (value) => `À partir de ${value}`, quote: "Prix sur devis" },
  ar: { from: (value) => `ابتداءً من ${value}`, quote: "اطلب عرض سعر" },
};

export function PriceTag({ mode, amount, currency: base, className = "" }: { mode: string; amount: number; currency: string; className?: string }) {
  const { currency, context } = useCurrency();
  const lang = context?.lang ?? "en";
  const text = copy[lang];
  if (mode === "quote" || amount <= 0) return <span className={className}>{text.quote}</span>;
  const converted = convert(amount, base, currency, context?.rates ?? {});
  const value = formatMoney(converted, currency, lang);
  return <span className={className}>{mode === "from" ? text.from(value) : value}</span>;
}
