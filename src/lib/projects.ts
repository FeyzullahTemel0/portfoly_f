import "server-only";
import { cache } from "react";
import { connectDb } from "@/lib/db";
import type { Locale } from "@/lib/locales";
import { Project, type ProjectDoc } from "@/models/project";

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  coverUrl: string;
  coverFit: "cover" | "contain";
};

export type ProjectDetail = PublicProject & {
  description: string;
  client: string;
  year: string;
  url: string;
  tags: string[];
  gallery: string[];
};

const pick = (value: { tr: string; en: string; de?: string; fr?: string; ar?: string }, lang: Locale) => value[lang] || value.en || value.tr;

// Sadece görünür projeler, seçilen dilde; veritabanına ulaşılamazsa boş liste döner.
export const getProjects = cache(async (lang: Locale): Promise<PublicProject[]> => {
  try {
    await connectDb();
    const docs = await Project.find({ visible: true }).sort({ order: 1, createdAt: -1 }).lean();
    return docs.map((doc) => toPublic(doc, lang));
  } catch (error) {
    console.error("Projeler yüklenemedi:", error);
    return [];
  }
});

export const getProject = cache(async (lang: Locale, slug: string): Promise<ProjectDetail | null> => {
  try {
    await connectDb();
    const doc = await Project.findOne({ slug, visible: true }).lean();
    if (!doc) return null;
    return {
      ...toPublic(doc, lang),
      description: pick(doc.description, lang),
      client: doc.client,
      year: doc.year,
      url: doc.url,
      tags: doc.tags,
      gallery: doc.gallery.map((image) => image.url),
    };
  } catch (error) {
    console.error("Proje yüklenemedi:", error);
    return null;
  }
});

export async function getAllProjectSlugs() {
  try {
    await connectDb();
    const docs = await Project.find({ visible: true }, { slug: 1 }).lean();
    return docs.map((doc) => doc.slug);
  } catch {
    return [];
  }
}

function toPublic(doc: ProjectDoc & { _id: unknown }, lang: Locale): PublicProject {
  return {
    id: String(doc._id),
    slug: doc.slug,
    title: pick(doc.title, lang),
    summary: pick(doc.summary, lang),
    category: pick(doc.category, lang),
    coverUrl: doc.coverUrl,
    coverFit: doc.coverFit ?? "cover",
  };
}
