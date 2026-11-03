import "server-only";
import { cache } from "react";
import { CURRENCIES, type Rates } from "@/lib/currency";

// Dış servis erişilemezse sitenin bozulmaması için yaklaşık yedek kurlar (USD tabanlı).
const FALLBACK: Rates = { USD: 1, TRY: 40, EUR: 0.86, GBP: 0.75, SAR: 3.75, AED: 3.67, CHF: 0.8 };

export type RateSnapshot = { rates: Rates; live: boolean; updatedAt: string };

// Güncel kurlar saatte bir yenilenir (open.er-api.com, anahtarsız).
export const getRates = cache(async (): Promise<RateSnapshot> => {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) });
    const data = await response.json();
    if (data?.result === "success" && data.rates) {
      const rates: Rates = {};
      for (const code of CURRENCIES) if (typeof data.rates[code] === "number") rates[code] = data.rates[code];
      if (Object.keys(rates).length === CURRENCIES.length) return { rates, live: true, updatedAt: String(data.time_last_update_utc ?? "") };
    }
  } catch (error) {
    console.error("Döviz kurları alınamadı, yedek kurlar kullanılıyor:", error);
  }
  return { rates: FALLBACK, live: false, updatedAt: "" };
});
