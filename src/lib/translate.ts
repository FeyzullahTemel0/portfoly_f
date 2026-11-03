import "server-only";
import type { Locale } from "@/lib/locales";

const SPLIT_LIMIT = 450;
const cacheMap = new Map<string, string>();

function chunk(text: string): string[] {
  if (text.length <= SPLIT_LIMIT) return [text];
  const parts: string[] = [];
  let current = "";
  for (const sentence of text.split(/(?<=[.!?…])\s+/)) {
    if ((current + " " + sentence).trim().length > SPLIT_LIMIT && current) {
      parts.push(current.trim());
      current = sentence;
    } else {
      current = `${current} ${sentence}`;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts.flatMap((part) => (part.length > SPLIT_LIMIT ? part.match(new RegExp(`.{1,${SPLIT_LIMIT}}`, "g")) ?? [part] : [part]));
}

async function viaGoogle(texts: string[], from: Locale, to: Locale, key: string): Promise<string[]> {
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, source: from, target: to, format: "text" }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  const translated = data?.data?.translations as { translatedText: string }[] | undefined;
  if (!response.ok || !translated || translated.length !== texts.length) throw new Error("Google Translate yanıtı geçersiz.");
  return translated.map((item) => item.translatedText);
}

async function viaMyMemory(text: string, from: Locale, to: Locale): Promise<string> {
  const email = process.env.TRANSLATE_EMAIL ? `&de=${encodeURIComponent(process.env.TRANSLATE_EMAIL)}` : "";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}${email}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  const result = data?.responseData?.translatedText;
  if (!response.ok || data?.responseStatus !== 200 || typeof result !== "string") throw new Error(String(data?.responseDetails ?? "Çeviri başarısız."));
  return result.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

// Boş metinleri atlar; GOOGLE_TRANSLATE_API_KEY varsa resmi Google API'sini, yoksa ücretsiz MyMemory servisini kullanır.
export async function translateTexts(texts: string[], from: Locale, to: Locale): Promise<string[]> {
  if (from === to) return texts;
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  const out = [...texts];
  const pending = texts.map((text, index) => ({ text: text.trim(), index })).filter((item) => item.text);
  if (pending.length === 0) return out;

  if (key) {
    const translated = await viaGoogle(pending.map((item) => item.text), from, to, key);
    pending.forEach((item, position) => (out[item.index] = translated[position]));
    return out;
  }

  for (const item of pending) {
    const cacheKey = `${from}|${to}|${item.text}`;
    const hit = cacheMap.get(cacheKey);
    if (hit) {
      out[item.index] = hit;
      continue;
    }
    const pieces = await Promise.all(chunk(item.text).map((part) => viaMyMemory(part, from, to)));
    const result = pieces.join(" ");
    cacheMap.set(cacheKey, result);
    out[item.index] = result;
  }
  return out;
}
