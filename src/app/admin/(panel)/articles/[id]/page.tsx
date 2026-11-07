import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { AdminHeader } from "@/components/admin/page-header";
import { ArticleForm } from "@/components/admin/article-form";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { isStorageConfigured } from "@/lib/storage";
import { locales, type LocalizedText } from "@/lib/locales";
import { Article, normalizeArticleTags, type ArticleBody } from "@/models/article";
import type { ArticleInput } from "../../article-actions";

const emptyText = (): LocalizedText => ({ tr: "", en: "", de: "", fr: "", ar: "" });
const emptyDoc = (): JSONContent => ({ type: "doc", content: [{ type: "paragraph" }] });
const blank: ArticleInput = {
  slug: "",
  title: emptyText(),
  excerpt: emptyText(),
  category: emptyText(),
  body: Object.fromEntries(locales.map((locale) => [locale, emptyDoc()])) as ArticleBody,
  coverUrl: "",
  coverPublicId: "",
  coverAlt: emptyText(),
  tags: emptyText() as ArticleInput["tags"],
  status: "draft",
};

export default async function ArticleEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  if (!isNew && !mongoose.isValidObjectId(id)) notFound();
  let initial = blank;
  let title = "Yeni makale";

  if (!isNew) {
    await connectDb();
    const doc = await Article.findById(id).lean();
    if (!doc) notFound();
    title = doc.title.tr || doc.slug;
    initial = {
      slug: doc.slug,
      title: { tr: doc.title.tr ?? "", en: doc.title.en ?? "", de: doc.title.de ?? "", fr: doc.title.fr ?? "", ar: doc.title.ar ?? "" },
      excerpt: { tr: doc.excerpt.tr ?? "", en: doc.excerpt.en ?? "", de: doc.excerpt.de ?? "", fr: doc.excerpt.fr ?? "", ar: doc.excerpt.ar ?? "" },
      category: { tr: doc.category.tr ?? "", en: doc.category.en ?? "", de: doc.category.de ?? "", fr: doc.category.fr ?? "", ar: doc.category.ar ?? "" },
      body: Object.fromEntries(locales.map((locale) => [locale, doc.body?.[locale] ?? emptyDoc()])) as ArticleBody,
      coverUrl: doc.coverUrl ?? "",
      coverPublicId: doc.coverPublicId ?? "",
      coverAlt: { tr: doc.coverAlt?.tr ?? "", en: doc.coverAlt?.en ?? "", de: doc.coverAlt?.de ?? "", fr: doc.coverAlt?.fr ?? "", ar: doc.coverAlt?.ar ?? "" },
      tags: Object.fromEntries(locales.map((locale) => [locale, normalizeArticleTags(doc.tags)[locale].join(", ")])) as ArticleInput["tags"],
      status: doc.status,
    };
  }

  return (
    <>
      <Link href="/admin/articles" className="mb-4 inline-block text-sm text-muted hover:text-foreground">← Tüm makaleler</Link>
      <AdminHeader title={title} text="Yazı içinde görselleri imleç konumuna ekleyin; yayımlanmayan taslaklar sitede görünmez." />
      <ArticleForm id={isNew ? null : id} initial={initial} storageReady={isStorageConfigured()} />
    </>
  );
}
