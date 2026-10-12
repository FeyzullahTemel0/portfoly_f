import "server-only";
import { cache } from "react";
import { connectDb } from "@/lib/db";
import type { Locale, LocalizedText } from "@/lib/locales";
import { Reference } from "@/models/reference";

export type PublicReference = {
  id: string;
  slug: string;
  name: string;
  website: string;
  sector: string;
  description: string;
  logoUrl: string;
};

export type ReferenceDetail = PublicReference & {
  gallery: { url: string; caption: string; description: string }[];
};

function pick(value: LocalizedText, lang: Locale) {
  return value[lang] || value.en || value.tr;
}

// Sadece görünür referanslar, seçilen dilde; veritabanına ulaşılamazsa boş liste döner.
export const getReferences = cache(async (lang: Locale): Promise<PublicReference[]> => {
  try {
    await connectDb();
    const docs = await Reference.find({ visible: true }).sort({ order: 1, createdAt: -1 }).lean();
    return docs.map((doc) => ({
      id: String(doc._id),
      slug: doc.slug ?? "",
      name: doc.name,
      website: doc.website,
      sector: pick(doc.sector, lang),
      description: pick(doc.description, lang),
      logoUrl: doc.logoUrl,
    }));
  } catch (error) {
    console.error("Referanslar yüklenemedi:", error);
    return [];
  }
});

export const getReference = cache(async (lang: Locale, slug: string): Promise<ReferenceDetail | null> => {
  try {
    await connectDb();
    const doc = await Reference.findOne({ slug, visible: true }).lean();
    if (!doc) return null;
    return {
      id: String(doc._id),
      slug: doc.slug,
      name: doc.name,
      website: doc.website,
      sector: pick(doc.sector, lang),
      description: pick(doc.description, lang),
      logoUrl: doc.logoUrl,
      gallery: (doc.gallery ?? []).map((image) => ({
        url: image.url,
        caption: pick(image.caption, lang),
        description: pick(image.description, lang),
      })),
    };
  } catch (error) {
    console.error("Referans detayı yüklenemedi:", error);
    return null;
  }
});

export async function getAllReferenceSlugs() {
  try {
    await connectDb();
    const docs = await Reference.find({ visible: true, slug: { $ne: "" } }, { slug: 1 }).lean();
    return docs.map((doc) => doc.slug);
  } catch {
    return [];
  }
}
