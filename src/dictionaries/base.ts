import type { Locale } from "@/lib/locales";
import { legalDocs } from "@/lib/legal";
import { en } from "./en";
import { tr, type Dictionary } from "./tr";
import { ar } from "./ar";
import { de } from "./de";
import { fr } from "./fr";
import { mergeDeep } from "./merge";
import { serviceCopy } from "./service-copy";

function withLocale(lang: "de" | "fr" | "ar", patch: typeof de | typeof fr | typeof ar): Dictionary {
  const dictionary = mergeDeep(en, patch) as Dictionary;
  return {
    ...dictionary,
    services: {
      ...dictionary.services,
      items: dictionary.services.items.map((item) => ({ ...item, ...serviceCopy[lang]?.[item.slug] })),
    },
  };
}

// Kod içindeki varsayılan metinler. Yönetim paneli bunların üzerine yazar.
export const baseDictionaries: Record<Locale, Dictionary> = {
  tr: { ...tr, legalDocs: legalDocs.tr },
  en: { ...en, legalDocs: legalDocs.en },
  de: { ...withLocale("de", de), legalDocs: legalDocs.en },
  fr: { ...withLocale("fr", fr), legalDocs: legalDocs.en },
  ar: { ...withLocale("ar", ar), legalDocs: legalDocs.en },
};

export type { Dictionary };
