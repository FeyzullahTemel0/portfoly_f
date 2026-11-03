import "server-only";
import { cache } from "react";
import { connectDb } from "@/lib/db";
import type { Locale } from "@/lib/locales";
import { defaultSettings, type Settings } from "@/lib/site";
import { getServiceItems } from "@/lib/services";
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
  const dictionary = mergeDeep(baseDictionaries[lang], overrides);
  const managed = await getServiceItems(lang);
  if (!managed) return dictionary;
  return { ...dictionary, services: { ...dictionary.services, items: managed as unknown as Dictionary["services"]["items"] } };
});

export const getSettings = cache(async (): Promise<Settings> => {
  const overrides = await getOverrides("settings");
  return mergeDeep(defaultSettings, overrides.main);
});
