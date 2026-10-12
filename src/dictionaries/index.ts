import "server-only";
import { cache } from "react";
import { connectDb } from "@/lib/db";
import type { Locale } from "@/lib/locales";
import { defaultSettings, type Settings } from "@/lib/site";
import { Content } from "@/models/content";
import { baseDictionaries, type Dictionary } from "./base";
import { mergeDeep } from "./merge";
export { mergeDeep } from "./merge";

type Plain = Record<string, unknown>;

async function loadOverrides(scope: string): Promise<Plain> {
  try {
    await connectDb();
    const docs = await Content.find({ scope }).lean();
    return Object.fromEntries(docs.map((doc) => [doc.key, doc.data]));
  } catch (error) {
    console.error(`İçerik yüklenemedi (${scope}), varsayılanlar kullanılıyor:`, error);
    return {};
  }
}

// Aynı istek içinde tekrar sorgu atılmaması için önbelleğe alınır.
export const getOverrides = cache(loadOverrides);

export const getDictionary = cache(async (lang: Locale): Promise<Dictionary> => {
  const overrides = await getOverrides(lang);
  return mergeDeep(baseDictionaries[lang], overrides);
});

export const getSettings = cache(async (): Promise<Settings> => {
  const overrides = await getOverrides("settings");
  return mergeDeep(defaultSettings, overrides.main);
});
