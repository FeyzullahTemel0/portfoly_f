"use server";

import mongoose from "mongoose";
import type { JSONContent } from "@tiptap/core";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { isLocale, locales, type Locale, type LocalizedText } from "@/lib/locales";
import { deleteImage, isOwnImageUrl, keyFromUrl } from "@/lib/storage";
import { translateTexts } from "@/lib/translate";
import { Article, type ArticleBody, type ArticleTags } from "@/models/article";

export type ArticleInput = {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  category: LocalizedText;
  body: ArticleBody;
  coverUrl: string;
  coverPublicId: string;
  coverAlt: LocalizedText;
  tags: Record<Locale, string>;
  status: "draft" | "published";
};

type ActionResult = { ok: boolean; id?: string; error?: string; data?: ArticleInput };
type Plain = Record<string, unknown>;
const maxBodyBytes = 850_000;
const maxNodes = 5000;
const allowedNodes = new Set(["doc", "paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote", "codeBlock", "horizontalRule", "hardBreak", "text", "image"]);
const allowedMarks = new Set(["bold", "italic", "underline", "strike", "code", "link"]);

function isPlain(value: unknown): value is Plain {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function slugify(value: string) {
  return value.toLocaleLowerCase("tr").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

function cleanLocalized(value: unknown, max: number): LocalizedText {
  const source = isPlain(value) ? value : {};
  return Object.fromEntries(locales.map((locale) => [locale, typeof source[locale] === "string" ? (source[locale] as string).trim().slice(0, max) : ""])) as LocalizedText;
}

function parseTags(value: unknown) {
  const seen = new Set<string>();
  return (typeof value === "string" ? value : "")
    .split(/[,،;]/)
    .map((tag) => tag.trim().slice(0, 40))
    .filter((tag) => {
      const key = tag.toLocaleLowerCase();
      if (!tag || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}

const sameMarks = (a: JSONContent, b: JSONContent) => JSON.stringify(a.marks ?? []) === JSON.stringify(b.marks ?? []);

// Aynı biçimli ardışık metin düğümleri tek cümle olarak çevrilir; kod blokları ve satır içi kod atlanır. Toplama ve uygulama aynı sırada çağrılır.
function mapBodyText(body: JSONContent, translate: (text: string) => string): JSONContent {
  const edit = (text: string) => {
    const core = text.trim();
    if (!core) return text;
    return `${/^\s*/.exec(text)?.[0] ?? ""}${translate(core)}${/\s*$/.exec(text)?.[0] ?? ""}`;
  };
  function visit(node: JSONContent, skip: boolean): JSONContent {
    if (node.type === "image") {
      const attrs = (node.attrs ?? {}) as Record<string, unknown>;
      return { ...node, attrs: { ...attrs, alt: typeof attrs.alt === "string" ? edit(attrs.alt) : attrs.alt, title: typeof attrs.title === "string" ? edit(attrs.title) : attrs.title } };
    }
    if (!node.content) return node;
    const inCode = skip || node.type === "codeBlock";
    const content: JSONContent[] = [];
    let run: JSONContent[] = [];
    const flush = () => {
      if (run.length) content.push({ ...run[0], text: edit(run.map((item) => item.text ?? "").join("")) });
      run = [];
    };
    for (const child of node.content) {
      const translatable = child.type === "text" && !inCode && !child.marks?.some((mark) => mark.type === "code");
      if (translatable && run.length && sameMarks(run[0], child)) {
        run.push(child);
        continue;
      }
      flush();
      if (translatable) run = [child];
      else content.push(visit(child, inCode));
    }
    flush();
    return { ...node, content };
  }
  return visit(body, false);
}

const hasBodyText = (body: JSONContent | undefined) => {
  let found = false;
  if (body) mapBodyText(body, (text) => ((found = true), text));
  return found;
};

// Türkçe kaynaktan tek bir dile çevirir; istemci dilleri sırayla çağırarak uzun makalelerde zaman aşımını ve tek hatanın tümünü bozmasını önler.
export async function translateArticleLocale(input: ArticleInput, locale: Locale, overwrite: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (typeof locale !== "string" || !isLocale(locale) || locale === "tr") return { ok: false, error: "Geçersiz hedef dil." };
  if (!input || typeof input !== "object" || !input.title?.tr?.trim()) {
    return { ok: false, error: "Önce Türkçe makale başlığını doldurun." };
  }
  const sourceBody = input.body?.tr;
  if (!sourceBody) return { ok: false, error: "Önce Türkçe makale gövdesini hazırlayın." };

  const translated: ArticleInput = {
    ...input,
    title: { ...input.title },
    excerpt: { ...input.excerpt },
    category: { ...input.category },
    coverAlt: { ...input.coverAlt },
    body: { ...input.body },
    tags: { ...input.tags },
  };
  const fields = ["title", "excerpt", "category", "coverAlt"] as const;

  try {
    const sources: string[] = [];
    const fieldTasks: { field: (typeof fields)[number]; index: number }[] = [];
    for (const field of fields) {
      if (!input[field].tr?.trim() || (!overwrite && translated[field][locale]?.trim())) continue;
      fieldTasks.push({ field, index: sources.length });
      sources.push(input[field].tr);
    }

    const sourceTags = parseTags(input.tags?.tr);
    const translateTags = sourceTags.length > 0 && (overwrite || !translated.tags[locale]?.trim());
    const tagsStart = sources.length;
    if (translateTags) sources.push(...sourceTags);

    const translateBody = overwrite || !hasBodyText(translated.body[locale]);
    const bodyStart = sources.length;
    if (translateBody) mapBodyText(sourceBody, (text) => (sources.push(text), text));

    const results = await translateTexts(sources, "tr", locale);
    for (const task of fieldTasks) translated[task.field][locale] = results[task.index] || input[task.field].tr;
    if (translateTags) translated.tags[locale] = parseTags(results.slice(tagsStart, tagsStart + sourceTags.length).join(",")).join(", ");
    if (translateBody) {
      let cursor = bodyStart;
      translated.body[locale] = mapBodyText(sourceBody, (text) => results[cursor++] || text);
    }
    return { ok: true, data: translated };
  } catch (error) {
    console.error("Makale çevirisi başarısız:", error);
    return { ok: false, error: error instanceof Error ? error.message : "Çeviri yapılamadı. Lütfen tekrar deneyin." };
  }
}

function cleanHref(value: unknown) {
  if (typeof value !== "string") return "";
  const href = value.trim().slice(0, 1000);
  return /^https:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href) || (href.startsWith("/") && !href.startsWith("//")) ? href : "";
}

function sanitizeBody(input: unknown): JSONContent {
  const serialized = JSON.stringify(input);
  if (!serialized || Buffer.byteLength(serialized, "utf8") > maxBodyBytes) throw new Error("Makale gövdesi çok büyük.");
  let count = 0;

  function visit(value: unknown, depth: number): JSONContent {
    if (!isPlain(value) || typeof value.type !== "string" || !allowedNodes.has(value.type) || depth > 20 || ++count > maxNodes) {
      throw new Error("Makale içeriğinde desteklenmeyen veya aşırı derin bir blok var.");
    }
    const node: JSONContent = { type: value.type };
    if (value.type === "text") {
      if (typeof value.text !== "string") throw new Error("Metin bloğu geçersiz.");
      node.text = value.text.slice(0, 20_000);
    }
    if (value.type === "heading") {
      const level = Number(isPlain(value.attrs) ? value.attrs.level : 2);
      node.attrs = { level: level === 3 ? 3 : 2 };
    }
    if (value.type === "image") {
      const attrs = isPlain(value.attrs) ? value.attrs : {};
      const src = typeof attrs.src === "string" ? attrs.src : "";
      if (!isOwnImageUrl(src) || !keyFromUrl(src).startsWith("rovax/articles/")) throw new Error("Makalelerde yalnızca yüklenmiş kendi görselleriniz kullanılabilir.");
      const numeric = (item: unknown) => Number.isFinite(Number(item)) ? Math.max(1, Math.min(12000, Math.round(Number(item)))) : null;
      const align = ["left", "center", "right"].includes(String(attrs.align)) ? String(attrs.align) : "center";
      node.attrs = { src, alt: typeof attrs.alt === "string" ? attrs.alt.slice(0, 250) : "", title: typeof attrs.title === "string" ? attrs.title.slice(0, 250) : "", width: numeric(attrs.width), height: numeric(attrs.height), align };
    }
    if (Array.isArray(value.marks)) {
      node.marks = value.marks.flatMap((mark) => {
        if (!isPlain(mark) || typeof mark.type !== "string" || !allowedMarks.has(mark.type)) return [];
        if (mark.type !== "link") return [{ type: mark.type }];
        const attrs = isPlain(mark.attrs) ? mark.attrs : {};
        const href = cleanHref(attrs.href);
        return [{ type: "link", attrs: { href: href || "/", target: "_blank", rel: "noopener noreferrer" } }];
      });
    }
    if (Array.isArray(value.content)) node.content = value.content.map((child) => visit(child, depth + 1));
    return node;
  }

  const doc = visit(input, 0);
  if (doc.type !== "doc") throw new Error("Makale gövdesi doc kök düğümüyle başlamalı.");
  return doc;
}

function collectImageKeys(value: unknown, output = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const item of value) collectImageKeys(item, output);
  } else if (isPlain(value)) {
    if (value.type === "image" && isPlain(value.attrs) && typeof value.attrs.src === "string") {
      const key = keyFromUrl(value.attrs.src);
      if (key.startsWith("rovax/articles/")) output.add(key);
    }
    for (const child of Object.values(value)) collectImageKeys(child, output);
  }
  return output;
}

function refreshArticles(slug?: string) {
  revalidatePath("/admin/articles");
  revalidatePath("/[lang]/insights", "page");
  revalidatePath("/[lang]", "page");
  if (slug) revalidatePath("/[lang]/insights/[slug]", "page");
}

export async function saveArticle(id: string | null, input: ArticleInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input || typeof input !== "object") return { ok: false, error: "Makale verisi geçersiz." };
  if (id !== null && !mongoose.isValidObjectId(id)) return { ok: false, error: "Makale kimliği geçersiz." };

  const title = cleanLocalized(input?.title, 180);
  const excerpt = cleanLocalized(input?.excerpt, 500);
  const category = cleanLocalized(input?.category, 120);
  const coverAlt = cleanLocalized(input?.coverAlt, 240);
  const slugSource = typeof input?.slug === "string" ? input.slug.trim().slice(0, 140) : "";
  const slug = slugify(slugSource || title.tr);
  const coverUrl = typeof input?.coverUrl === "string" ? input.coverUrl.trim().slice(0, 500) : "";
  const coverPublicId = typeof input?.coverPublicId === "string" ? input.coverPublicId.trim().slice(0, 300) : "";
  const tags = Object.fromEntries(locales.map((locale) => [locale, parseTags(input?.tags?.[locale])])) as ArticleTags;
  const status = input?.status === "published" ? "published" : "draft";
  if (!title.tr || !slug) return { ok: false, error: "Türkçe başlık zorunludur." };
  if (coverUrl && (!isOwnImageUrl(coverUrl) || !coverPublicId.startsWith("rovax/articles/"))) return { ok: false, error: "Kapak görseli doğrulanamadı." };

  let body: ArticleBody;
  try {
    body = Object.fromEntries(locales.map((locale) => [locale, sanitizeBody(input?.body?.[locale] ?? { type: "doc", content: [{ type: "paragraph" }] })])) as ArticleBody;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Makale metni doğrulanamadı." };
  }
  const words = JSON.stringify(body.tr).replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean).length;
  if (status === "published" && (words < 20 || !excerpt.tr)) return { ok: false, error: "Yayımlamak için Türkçe özet ve en az 20 kelimelik içerik gerekli." };

  try {
    await connectDb();
    const previous = id ? await Article.findById(id).lean() : null;
    if (id && !previous) return { ok: false, error: "Makale bulunamadı." };
    if (await Article.exists({ slug, ...(id ? { _id: { $ne: id } } : {}) })) return { ok: false, error: "Bu adres başka bir makalede kullanılıyor." };
    const now = new Date();
    const wasPublished = previous?.status === "published";
    const data = {
      slug, title, excerpt, category, body, coverUrl, coverPublicId: coverUrl ? coverPublicId : "", coverAlt, tags, status,
      publishedAt: status === "published" ? (wasPublished ? previous.publishedAt ?? now : now) : null,
    };
    let savedId = id;
    if (previous) await Article.updateOne({ _id: id }, { $set: data });
    else savedId = String((await Article.create(data))._id);

    const kept = new Set([...(coverPublicId ? [coverPublicId] : []), ...collectImageKeys(body)]);
    if (previous) {
      const old = new Set([previous.coverPublicId, ...collectImageKeys(previous.body)]);
      for (const key of old) if (key && key.startsWith("rovax/articles/") && !kept.has(key)) await deleteImage(key);
    }
    refreshArticles(slug);
    return { ok: true, id: savedId ?? undefined };
  } catch (error) {
    console.error("Makale kaydedilemedi:", error);
    return { ok: false, error: "Makale kaydedilemedi. Lütfen alanları kontrol edin." };
  }
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!mongoose.isValidObjectId(id)) return { ok: false, error: "Makale kimliği geçersiz." };
  try {
    await connectDb();
    const article = await Article.findByIdAndDelete(id).lean();
    if (!article) return { ok: false, error: "Makale bulunamadı." };
    const keys = new Set([article.coverPublicId, ...collectImageKeys(article.body)]);
    for (const key of keys) if (key && key.startsWith("rovax/articles/")) await deleteImage(key);
    refreshArticles(article.slug);
    return { ok: true };
  } catch (error) {
    console.error("Makale silinemedi:", error);
    return { ok: false, error: "Makale silinemedi." };
  }
}
