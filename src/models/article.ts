import { model, models, Schema, type Model } from "mongoose";
import type { JSONContent } from "@tiptap/core";
import { locales, type Locale, type LocalizedText } from "@/lib/locales";

export type ArticleBody = Record<Locale, JSONContent>;
export type ArticleTags = Record<Locale, string[]>;
export type ArticleStatus = "draft" | "published";

// Eski kayıtlar düz dizi (Türkçe) olarak saklanıyordu; hepsini dil bazlı yapıya çevirir.
export function normalizeArticleTags(raw: unknown): ArticleTags {
  const clean = (value: unknown) => (Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === "string" && tag.trim() !== "") : []);
  const source = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : { tr: raw };
  return Object.fromEntries(locales.map((locale) => [locale, clean(source[locale])])) as ArticleTags;
}

export type ArticleDoc = {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  category: LocalizedText;
  body: ArticleBody;
  coverUrl: string;
  coverPublicId: string;
  coverAlt: LocalizedText;
  tags: ArticleTags | string[];
  status: ArticleStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const localized = { tr: { type: String, default: "", maxlength: 240 }, en: { type: String, default: "", maxlength: 240 }, de: { type: String, default: "", maxlength: 240 }, fr: { type: String, default: "", maxlength: 240 }, ar: { type: String, default: "", maxlength: 240 } };
const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
const ArticleSchema = new Schema<ArticleDoc>(
  {
    slug: { type: String, required: true, unique: true, maxlength: 140 },
    title: localized,
    excerpt: { tr: { type: String, default: "", maxlength: 500 }, en: { type: String, default: "", maxlength: 500 }, de: { type: String, default: "", maxlength: 500 }, fr: { type: String, default: "", maxlength: 500 }, ar: { type: String, default: "", maxlength: 500 } },
    category: localized,
    body: { type: Schema.Types.Mixed, default: () => ({ tr: emptyDoc, en: emptyDoc, de: emptyDoc, fr: emptyDoc, ar: emptyDoc }) },
    coverUrl: { type: String, default: "", maxlength: 500 },
    coverPublicId: { type: String, default: "", maxlength: 300 },
    coverAlt: localized,
    tags: { type: Schema.Types.Mixed, default: () => ({ tr: [], en: [], de: [], fr: [], ar: [] }) },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);
ArticleSchema.index({ status: 1, publishedAt: -1 });

export const Article: Model<ArticleDoc> = (models.Article as Model<ArticleDoc>) || model<ArticleDoc>("Article", ArticleSchema);
