import "server-only";
import type { Locale } from "@/lib/locales";

// MyMemory sorgu başına ~500 bayt kabul eder; Türkçe/Arapça karakterler için pay bırakılır.
const BATCH_LIMIT = 400;
const CONCURRENCY = 3;
const GOOGLE_BATCH = 100;
const QUOTA_MESSAGE = "Ücretsiz çeviri servisinin günlük limiti doldu. Uzun makaleler için GOOGLE_TRANSLATE_API_KEY tanımlayın ya da yarın tekrar deneyin.";
const cacheMap = new Map<string, string>();

type Pending = { text: string; index: number };

function chunk(text: string): string[] {
  if (text.length <= BATCH_LIMIT) return [text];
  const parts: string[] = [];
  let current = "";
  for (const sentence of text.split(/(?<=[.!?…])\s+/)) {
    if ((current + " " + sentence).trim().length > BATCH_LIMIT && current) {
      parts.push(current.trim());
      current = sentence;
    } else {
      current = `${current} ${sentence}`;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts.flatMap((part) => (part.length > BATCH_LIMIT ? part.match(new RegExp(`[\\s\\S]{1,${BATCH_LIMIT}}`, "g")) ?? [part] : [part]));
}

async function inPool(count: number, work: (position: number) => Promise<void>) {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, count) }, async () => {
    while (next < count) await work(next++);
  }));
}

async function viaGoogle(texts: string[], from: Locale, to: Locale, key: string): Promise<string[]> {
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, source: from, target: to, format: "text" }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json().catch(() => null);
  const translated = data?.data?.translations as { translatedText: string }[] | undefined;
  if (!response.ok || !translated || translated.length !== texts.length) throw new Error(String(data?.error?.message ?? "Google Translate yanıtı geçersiz."));
  return translated.map((item) => item.translatedText);
}

async function requestMyMemory(text: string, from: Locale, to: Locale): Promise<string> {
  const email = process.env.TRANSLATE_EMAIL ? `&de=${encodeURIComponent(process.env.TRANSLATE_EMAIL)}` : "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}${email}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const data = await response.json().catch(() => null);
  const result = data?.responseData?.translatedText;
  const details = String(data?.responseDetails ?? "");
  const quota = /USED ALL AVAILABLE|MYMEMORY WARNING/i;
  if (response.status === 429 || quota.test(details) || (typeof result === "string" && quota.test(result))) throw new Error(QUOTA_MESSAGE);
  if (!response.ok || data?.responseStatus !== 200 || typeof result !== "string") throw new Error(details || "Çeviri servisi yanıt vermedi.");
  return result.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

async function viaMyMemory(text: string, from: Locale, to: Locale): Promise<string> {
  try {
    return await requestMyMemory(text, from, to);
  } catch (error) {
    if (error instanceof Error && error.message === QUOTA_MESSAGE) throw error;
    await new Promise((resolve) => setTimeout(resolve, 600));
    return requestMyMemory(text, from, to);
  }
}

async function translateLong(text: string, from: Locale, to: Locale) {
  const pieces: string[] = [];
  for (const part of chunk(text)) pieces.push(await viaMyMemory(part, from, to));
  return pieces.join(" ");
}

// Kısa metinleri satır sonuyla tek istekte birleştirir; istek sayısı ve süre belirgin şekilde düşer.
async function viaMyMemoryAll(items: Pending[], from: Locale, to: Locale, out: string[]) {
  const groups: Pending[][] = [];
  let current: Pending[] = [];
  let size = 0;
  for (const item of items) {
    const hit = cacheMap.get(`${from}|${to}|${item.text}`);
    if (hit) {
      out[item.index] = hit;
      continue;
    }
    if (item.text.length > BATCH_LIMIT) {
      groups.push([item]);
      continue;
    }
    if (current.length && size + item.text.length + 1 > BATCH_LIMIT) {
      groups.push(current);
      current = [];
      size = 0;
    }
    current.push(item);
    size += item.text.length + 1;
  }
  if (current.length) groups.push(current);

  const store = (item: Pending, value: string) => {
    out[item.index] = value;
    cacheMap.set(`${from}|${to}|${item.text}`, value);
  };
  await inPool(groups.length, async (position) => {
    const group = groups[position];
    if (group.length > 1) {
      const parts = (await viaMyMemory(group.map((item) => item.text).join("\n"), from, to)).split("\n");
      if (parts.length === group.length) {
        group.forEach((item, i) => store(item, parts[i].trim()));
        return;
      }
    }
    for (const item of group) store(item, await translateLong(item.text, from, to));
  });
}

// Boş metinleri atlar; GOOGLE_TRANSLATE_API_KEY varsa Google API'sini, yoksa ücretsiz MyMemory servisini kullanır.
export async function translateTexts(texts: string[], from: Locale, to: Locale): Promise<string[]> {
  if (from === to) return texts;
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  const out = [...texts];
  const pending: Pending[] = texts.map((text, index) => ({ text: text.replace(/\s*\n\s*/g, " ").trim(), index })).filter((item) => item.text);
  if (pending.length === 0) return out;

  if (key) {
    const batches = Array.from({ length: Math.ceil(pending.length / GOOGLE_BATCH) }, (_, i) => pending.slice(i * GOOGLE_BATCH, (i + 1) * GOOGLE_BATCH));
    await inPool(batches.length, async (position) => {
      const translated = await viaGoogle(batches[position].map((item) => item.text), from, to, key);
      batches[position].forEach((item, i) => (out[item.index] = translated[i]));
    });
    return out;
  }

  await viaMyMemoryAll(pending, from, to, out);
  return out;
}
