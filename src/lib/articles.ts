import "server-only";
import { cache } from "react";
import type { JSONContent } from "@tiptap/core";
import { connectDb } from "@/lib/db";
import type { Locale, LocalizedText } from "@/lib/locales";
import { Article, normalizeArticleTags } from "@/models/article";

export type PublicArticle = { id: string; slug: string; title: string; excerpt: string; category: string; coverUrl: string; coverAlt: string; tags: string[]; tagKeys: string[]; publishedAt: string; readMinutes: number };
export type ArticleDetail = PublicArticle & { body: JSONContent };

const pick = (value: LocalizedText | undefined, lang: Locale) => value?.[lang] || value?.en || value?.tr || "";
function textFromContent(node: JSONContent): string {
  return `${node.text ?? ""} ${(node.content ?? []).map(textFromContent).join(" ")}`.trim();
}
function hasContent(node: JSONContent | undefined) {
  if (!node) return false;
  if (node.type === "image") return true;
  if (node.type === "text" && node.text?.trim()) return true;
  return (node.content ?? []).some(hasContent);
}
function bodyFor(body: Record<string, JSONContent> | undefined, lang: Locale) {
  const candidates = [body?.[lang], body?.en, body?.tr];
  return candidates.find(hasContent) ?? candidates.find(Boolean) ?? { type: "doc", content: [] };
}
function readMinutes(body: JSONContent) {
  return Math.max(1, Math.ceil(textFromContent(body).trim().split(/\s+/).filter(Boolean).length / 220));
}
function toPublic(doc: { _id: unknown; slug: string; title: LocalizedText; excerpt?: LocalizedText; category?: LocalizedText; coverUrl?: string; coverAlt?: LocalizedText; tags?: unknown; publishedAt?: Date | null; body?: Record<string, JSONContent> }, lang: Locale): PublicArticle {
  const body = bodyFor(doc.body, lang);
  const tags = normalizeArticleTags(doc.tags);
  return {
    id: String(doc._id), slug: doc.slug, title: pick(doc.title, lang), excerpt: pick(doc.excerpt, lang), category: pick(doc.category, lang),
    coverUrl: doc.coverUrl ?? "", coverAlt: pick(doc.coverAlt, lang), tags: tags[lang].length ? tags[lang] : tags.en.length ? tags.en : tags.tr,
    tagKeys: tags.tr.map((tag) => tag.toLocaleLowerCase("tr")),
    publishedAt: (doc.publishedAt ?? new Date()).toISOString(), readMinutes: readMinutes(body),
  };
}

export const getArticles = cache(async (lang: Locale): Promise<PublicArticle[]> => {
  try {
    await connectDb();
    const docs = await Article.find({ status: "published", publishedAt: { $lte: new Date() } }).sort({ publishedAt: -1 }).limit(100).lean();
    return docs.map((doc) => toPublic(doc, lang));
  } catch (error) {
    console.error("Makaleler yüklenemedi:", error);
    return [];
  }
});

export const getArticle = cache(async (lang: Locale, slug: string): Promise<ArticleDetail | null> => {
  try {
    await connectDb();
    const doc = await Article.findOne({ slug, status: "published", publishedAt: { $lte: new Date() } }).lean();
    if (!doc) return null;
    const body = bodyFor(doc.body, lang);
    return { ...toPublic(doc, lang), body };
  } catch (error) {
    console.error("Makale yüklenemedi:", error);
    return null;
  }
});

export async function getAllArticleSlugs() {
  try {
    await connectDb();
    const docs = await Article.find({ status: "published", publishedAt: { $lte: new Date() } }, { slug: 1 }).lean();
    return docs.map((doc) => doc.slug);
  } catch {
    return [];
  }
}
