"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { baseDictionaries } from "@/dictionaries/base";
import { requireAdmin, endSession } from "@/lib/auth";
import { isSectionKey } from "@/lib/admin-config";
import { createUploadSignature, deleteImage, isOwnImageUrl } from "@/lib/cloudinary";
import { connectDb } from "@/lib/db";
import { isLocale } from "@/lib/locales";
import { defaultSettings, safeProjectUrl, safeUrl } from "@/lib/site";
import { Content } from "@/models/content";
import { Message } from "@/models/message";
import { Quote, quoteStatuses, type QuoteStatus } from "@/models/quote";
import { Reference } from "@/models/reference";
import { TeamMember } from "@/models/team-member";
import { Project } from "@/models/project";
import { AccessEvent } from "@/models/access-event";

export type ActionResult = { ok: boolean; error?: string; data?: unknown };

const MAX_PAYLOAD = 300_000;
const MAX_STRING = 8_000;

function refreshSite() {
  revalidatePath("/[lang]", "layout");
}

type Plain = Record<string, unknown>;
const isPlain = (v: unknown): v is Plain => typeof v === "object" && v !== null && !Array.isArray(v);

// Kaydedilen verinin, sitenin beklediği yapıyla uyumlu olduğunu doğrular; aksi halde sayfalar bozulabilir.
function isCompatible(base: unknown, value: unknown): boolean {
  if (typeof base === "string") return typeof value === "string" && value.length <= MAX_STRING;
  if (typeof base === "number") return typeof value === "number" && Number.isFinite(value);
  if (typeof base === "boolean") return typeof value === "boolean";
  if (Array.isArray(base)) {
    if (!Array.isArray(value)) return false;
    if (base.length === 0) return value.every((item) => isPlain(item) || typeof item === "string");
    return value.every((item) => isCompatible(base[0], item));
  }
  if (isPlain(base)) {
    if (!isPlain(value)) return false;
    return Object.keys(base).every((key) => key in value && isCompatible(base[key], value[key]));
  }
  return false;
}

function cleanJson(data: unknown) {
  const text = JSON.stringify(data);
  if (!text || text.length > MAX_PAYLOAD) throw new Error("Veri çok büyük.");
  return JSON.parse(text);
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function saveContent(scope: string, key: string, data: unknown): Promise<ActionResult> {
  await requireAdmin();
  if (!isLocale(scope) || !isSectionKey(key)) return { ok: false, error: "Geçersiz bölüm." };
  try {
    const clean = cleanJson(data);
    const base = (baseDictionaries[scope] as unknown as Plain)[key];
    if (!isCompatible(base, clean)) return { ok: false, error: "Alanlardan biri eksik veya hatalı biçimde." };
    await connectDb();
    await Content.updateOne({ scope, key }, { $set: { data: clean } }, { upsert: true });
    refreshSite();
    return { ok: true };
  } catch (error) {
    console.error("İçerik kaydedilemedi:", error);
    return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function saveAboutPhoto(url: string, publicId: string): Promise<ActionResult> {
  await requireAdmin();
  if (typeof url !== "string" || typeof publicId !== "string") return { ok: false, error: "Geçersiz görsel." };
  if (url || publicId) {
    if (!url || !isOwnImageUrl(url) || !publicId.startsWith("temeloji/profile/")) {
      return { ok: false, error: "Profil fotoğrafı doğrulanamadı." };
    }
  }

  try {
    await connectDb();
    const previous = await Content.findOne({ scope: "settings", key: "aboutPhoto" }).lean();
    const previousData = isPlain(previous?.data) ? previous.data : {};
    const previousPublicId = typeof previousData.publicId === "string" ? previousData.publicId : "";
    await Content.updateOne(
      { scope: "settings", key: "aboutPhoto" },
      { $set: { data: { url, publicId } } },
      { upsert: true },
    );
    refreshSite();
    if (previousPublicId.startsWith("temeloji/profile/") && previousPublicId !== publicId) {
      await deleteImage(previousPublicId);
    }
    return { ok: true };
  } catch (error) {
    console.error("Profil fotoğrafı kaydedilemedi:", error);
    return { ok: false, error: "Profil fotoğrafı kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function resetContent(scope: string, key: string): Promise<ActionResult> {
  await requireAdmin();
  if (!isLocale(scope) || !isSectionKey(key)) return { ok: false, error: "Geçersiz bölüm." };
  try {
    await connectDb();
    await Content.deleteOne({ scope, key });
    refreshSite();
    return { ok: true, data: (baseDictionaries[scope] as unknown as Plain)[key] };
  } catch (error) {
    console.error("İçerik sıfırlanamadı:", error);
    return { ok: false, error: "Sıfırlanamadı. Lütfen tekrar deneyin." };
  }
}

export async function saveSettings(data: unknown): Promise<ActionResult> {
  await requireAdmin();
  try {
    const clean = cleanJson(data);
    if (!isCompatible(defaultSettings, clean)) return { ok: false, error: "Alanlardan biri eksik veya hatalı biçimde." };

    const settings = clean as typeof defaultSettings;
    settings.whatsapp = settings.whatsapp.replace(/\D/g, "");
    for (const key of Object.keys(settings.social) as (keyof typeof settings.social)[]) {
      const value = settings.social[key].trim();
      if (value && !safeUrl(value)) return { ok: false, error: `Geçersiz adres: ${key}. https:// ile başlamalı.` };
      settings.social[key] = value;
    }
    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(settings.email.trim())) {
      return { ok: false, error: "Geçersiz e-posta adresi." };
    }
    const seoUrl = settings.seo.siteUrl.trim();
    if (seoUrl) {
      let parsed: URL;
      try {
        parsed = new URL(seoUrl);
      } catch {
        return { ok: false, error: "SEO site adresi geçersiz." };
      }
      const localHost = ["localhost", "127.0.0.1"].includes(parsed.hostname);
      if ((parsed.protocol !== "https:" && !(localHost && parsed.protocol === "http:")) || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
        return { ok: false, error: "SEO site adresi https://alanadi.com biçiminde olmalı." };
      }
      settings.seo.siteUrl = parsed.origin;
    }
    if (settings.seo.ogImageUrl && !isOwnImageUrl(settings.seo.ogImageUrl)) {
      return { ok: false, error: "SEO paylaşım görseli kendi Cloudinary hesabınızdan olmalı." };
    }
    if (settings.seo.googleSiteVerification && !/^[A-Za-z0-9_-]+$/.test(settings.seo.googleSiteVerification)) {
      return { ok: false, error: "Google doğrulama kodu geçersiz." };
    }

    await connectDb();
    await Content.updateOne({ scope: "settings", key: "main" }, { $set: { data: settings } }, { upsert: true });
    refreshSite();
    return { ok: true };
  } catch (error) {
    console.error("Ayarlar kaydedilemedi:", error);
    return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

function validId(id: string) {
  return mongoose.isValidObjectId(id);
}

export async function updateQuote(id: string, status: string, note: string): Promise<ActionResult> {
  await requireAdmin();
  if (!validId(id) || !(quoteStatuses as readonly string[]).includes(status)) {
    return { ok: false, error: "Geçersiz istek." };
  }
  try {
    await connectDb();
    await Quote.updateOne({ _id: id }, { $set: { status: status as QuoteStatus, note: note.slice(0, 4000) } });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Teklif güncellenemedi:", error);
    return { ok: false, error: "Kaydedilemedi." };
  }
}

export async function deleteQuote(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    await Quote.deleteOne({ _id: id });
  } catch (error) {
    console.error("Teklif silinemedi:", error);
    return { ok: false, error: "Silinemedi." };
  }
  revalidatePath("/admin", "layout");
  redirect("/admin/quotes");
}

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    await Message.updateOne({ _id: id }, { $set: { read } });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Mesaj güncellenemedi:", error);
    return { ok: false, error: "Kaydedilemedi." };
  }
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    await Message.deleteOne({ _id: id });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Mesaj silinemedi:", error);
    return { ok: false, error: "Silinemedi." };
  }
}

export type ReferenceInput = {
  slug: string;
  name: string;
  website: string;
  sectorTr: string;
  sectorEn: string;
  sectorDe: string;
  sectorFr: string;
  sectorAr: string;
  descriptionTr: string;
  descriptionEn: string;
  descriptionDe: string;
  descriptionFr: string;
  descriptionAr: string;
  logoUrl: string;
  logoPublicId: string;
  gallery: {
    url: string;
    publicId: string;
    captionTr: string;
    captionEn: string;
    descriptionTr: string;
    descriptionEn: string;
  }[];
  order: number;
  visible: boolean;
};

export async function getUploadSignature(folder: string) {
  await requireAdmin();
  return createUploadSignature(folder);
}

export async function saveReference(id: string | null, input: ReferenceInput): Promise<ActionResult> {
  await requireAdmin();
  if (id !== null && !validId(id)) return { ok: false, error: "Geçersiz istek." };

  const text = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
  const name = text(input.name, 120);
  const slug = text(input.slug, 120) ? slugify(text(input.slug, 120)) : "";
  const website = text(input.website, 300);
  const logoUrl = text(input.logoUrl, 500);
  const logoPublicId = text(input.logoPublicId, 300);
  const gallery = (Array.isArray(input.gallery) ? input.gallery : []).slice(0, 10).map((image) => ({
    url: text(image?.url, 500),
    publicId: text(image?.publicId, 300),
    caption: { tr: text(image?.captionTr, 160), en: text(image?.captionEn, 160), de: "", fr: "", ar: "" },
    description: { tr: text(image?.descriptionTr, 1000), en: text(image?.descriptionEn, 1000), de: "", fr: "", ar: "" },
  }));

  if (!name) return { ok: false, error: "Firma adı zorunlu." };
  if (website && !safeUrl(website)) return { ok: false, error: "Web sitesi adresi https:// ile başlamalı." };
  if (logoUrl && !isOwnImageUrl(logoUrl)) return { ok: false, error: "Geçersiz logo adresi." };
  if (gallery.some((image) => !isOwnImageUrl(image.url))) return { ok: false, error: "Geçersiz galeri görseli." };

  const data = {
    slug,
    name,
    website,
    sector: { tr: text(input.sectorTr, 200), en: text(input.sectorEn, 200), de: text(input.sectorDe, 200), fr: text(input.sectorFr, 200), ar: text(input.sectorAr, 200) },
    description: { tr: text(input.descriptionTr, 1000), en: text(input.descriptionEn, 1000), de: text(input.descriptionDe, 1000), fr: text(input.descriptionFr, 1000), ar: text(input.descriptionAr, 1000) },
    logoUrl,
    logoPublicId: logoUrl ? logoPublicId : "",
    gallery,
    order: Number.isFinite(input.order) ? Math.trunc(input.order) : 0,
    visible: Boolean(input.visible),
  };

  try {
    await connectDb();
    if (id === null) {
      if (slug && await Reference.exists({ slug })) return { ok: false, error: "Bu sayfa adresi başka bir referansta kullanılıyor." };
      await Reference.create(data);
    } else {
      const previous = await Reference.findById(id).lean();
      if (!previous) return { ok: false, error: "Kayıt bulunamadı." };
      if (slug && await Reference.exists({ slug, _id: { $ne: id } })) return { ok: false, error: "Bu sayfa adresi başka bir referansta kullanılıyor." };
      await Reference.updateOne({ _id: id }, { $set: data });
      if (previous.logoPublicId && previous.logoPublicId !== data.logoPublicId) {
        await deleteImage(previous.logoPublicId);
      }
      const retained = new Set(gallery.map((image) => image.publicId));
      for (const image of previous.gallery ?? []) {
        if (image.publicId && !retained.has(image.publicId)) await deleteImage(image.publicId);
      }
    }
    refreshSite();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Referans kaydedilemedi:", error);
    return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function deleteReference(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    const doc = await Reference.findByIdAndDelete(id).lean();
    if (doc?.logoPublicId) await deleteImage(doc.logoPublicId);
    for (const image of doc?.gallery ?? []) if (image.publicId) await deleteImage(image.publicId);
  } catch (error) {
    console.error("Referans silinemedi:", error);
    return { ok: false, error: "Silinemedi." };
  }
  refreshSite();
  revalidatePath("/admin", "layout");
  redirect("/admin/references");
}

export type TeamMemberInput = {
  name: string;
  roleTr: string;
  roleEn: string;
  roleDe: string;
  roleFr: string;
  roleAr: string;
  bioTr: string;
  bioEn: string;
  bioDe: string;
  bioFr: string;
  bioAr: string;
  photoUrl: string;
  photoPublicId: string;
  linkedin: string;
  instagram: string;
  x: string;
  order: number;
  visible: boolean;
};

export async function saveTeamMember(id: string | null, input: TeamMemberInput): Promise<ActionResult> {
  await requireAdmin();
  if (id !== null && !validId(id)) return { ok: false, error: "Geçersiz istek." };

  const text = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
  const name = text(input.name, 120);
  const photoUrl = text(input.photoUrl, 500);
  const links = { linkedin: text(input.linkedin, 300), instagram: text(input.instagram, 300), x: text(input.x, 300) };

  if (!name) return { ok: false, error: "Ad soyad zorunlu." };
  for (const [key, value] of Object.entries(links)) {
    if (value && !safeUrl(value)) return { ok: false, error: `Geçersiz adres (${key}). https:// ile başlamalı.` };
  }
  if (photoUrl && !isOwnImageUrl(photoUrl)) return { ok: false, error: "Geçersiz fotoğraf adresi." };

  const data = {
    name,
    role: { tr: text(input.roleTr, 200), en: text(input.roleEn, 200), de: text(input.roleDe, 200), fr: text(input.roleFr, 200), ar: text(input.roleAr, 200) },
    bio: { tr: text(input.bioTr, 1000), en: text(input.bioEn, 1000), de: text(input.bioDe, 1000), fr: text(input.bioFr, 1000), ar: text(input.bioAr, 1000) },
    photoUrl,
    photoPublicId: photoUrl ? text(input.photoPublicId, 300) : "",
    ...links,
    order: Number.isFinite(input.order) ? Math.trunc(input.order) : 0,
    visible: Boolean(input.visible),
  };

  try {
    await connectDb();
    if (id === null) {
      await TeamMember.create(data);
    } else {
      const previous = await TeamMember.findById(id).lean();
      if (!previous) return { ok: false, error: "Kayıt bulunamadı." };
      await TeamMember.updateOne({ _id: id }, { $set: data });
      if (previous.photoPublicId && previous.photoPublicId !== data.photoPublicId) {
        await deleteImage(previous.photoPublicId);
      }
    }
    refreshSite();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Ekip üyesi kaydedilemedi:", error);
    return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    const doc = await TeamMember.findByIdAndDelete(id).lean();
    if (doc?.photoPublicId) await deleteImage(doc.photoPublicId);
  } catch (error) {
    console.error("Ekip üyesi silinemedi:", error);
    return { ok: false, error: "Silinemedi." };
  }
  refreshSite();
  revalidatePath("/admin", "layout");
  redirect("/admin/team");
}

export type ProjectInput = {
  slug: string;
  titleTr: string;
  titleEn: string;
  titleDe: string;
  titleFr: string;
  titleAr: string;
  summaryTr: string;
  summaryEn: string;
  summaryDe: string;
  summaryFr: string;
  summaryAr: string;
  descriptionTr: string;
  descriptionEn: string;
  descriptionDe: string;
  descriptionFr: string;
  descriptionAr: string;
  categoryTr: string;
  categoryEn: string;
  categoryDe: string;
  categoryFr: string;
  categoryAr: string;
  client: string;
  year: string;
  url: string;
  coverUrl: string;
  coverPublicId: string;
  coverFit: "cover" | "contain";
  gallery: { url: string; publicId: string }[];
  tags: string;
  order: number;
  visible: boolean;
};

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function saveProject(id: string | null, input: ProjectInput): Promise<ActionResult> {
  await requireAdmin();
  if (id !== null && !validId(id)) return { ok: false, error: "Geçersiz istek." };

  const text = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
  const titleTr = text(input.titleTr, 200);
  const slug = slugify(text(input.slug, 120) || titleTr);
  const url = text(input.url, 300);
  const coverUrl = text(input.coverUrl, 500);
  const gallery = (Array.isArray(input.gallery) ? input.gallery : []).slice(0, 12).map((image) => ({
    url: text(image?.url, 500),
    publicId: text(image?.publicId, 300),
  }));
  const tags = text(input.tags, 400)
    .split(",")
    .map((tag) => tag.trim().slice(0, 40))
    .filter(Boolean)
    .slice(0, 10);

  if (!titleTr) return { ok: false, error: "Türkçe proje başlığı zorunlu." };
  if (!slug) return { ok: false, error: "Geçerli bir sayfa adı (slug) üretilemedi." };
  if (url && !safeProjectUrl(url)) return { ok: false, error: "Proje adresi https:// ile ya da /demos/ ile başlamalı." };
  if (coverUrl && !isOwnImageUrl(coverUrl)) return { ok: false, error: "Geçersiz kapak görseli." };
  if (gallery.some((image) => !isOwnImageUrl(image.url))) return { ok: false, error: "Geçersiz galeri görseli." };

  const data = {
    slug,
    title: { tr: titleTr, en: text(input.titleEn, 200), de: text(input.titleDe, 200), fr: text(input.titleFr, 200), ar: text(input.titleAr, 200) },
    summary: { tr: text(input.summaryTr, 400), en: text(input.summaryEn, 400), de: text(input.summaryDe, 400), fr: text(input.summaryFr, 400), ar: text(input.summaryAr, 400) },
    description: { tr: text(input.descriptionTr, 8000), en: text(input.descriptionEn, 8000), de: text(input.descriptionDe, 8000), fr: text(input.descriptionFr, 8000), ar: text(input.descriptionAr, 8000) },
    category: { tr: text(input.categoryTr, 200), en: text(input.categoryEn, 200), de: text(input.categoryDe, 200), fr: text(input.categoryFr, 200), ar: text(input.categoryAr, 200) },
    client: text(input.client, 120),
    year: text(input.year, 10),
    url,
    coverUrl,
    coverPublicId: coverUrl ? text(input.coverPublicId, 300) : "",
    coverFit: input.coverFit === "contain" ? "contain" : "cover",
    gallery,
    tags,
    order: Number.isFinite(input.order) ? Math.trunc(input.order) : 0,
    visible: Boolean(input.visible),
  };

  try {
    await connectDb();
    const clash = await Project.findOne(id === null ? { slug } : { slug, _id: { $ne: id } }).lean();
    if (clash) return { ok: false, error: "Bu sayfa adı (slug) başka bir projede kullanılıyor." };

    if (id === null) {
      await Project.create(data);
    } else {
      const previous = await Project.findById(id).lean();
      if (!previous) return { ok: false, error: "Kayıt bulunamadı." };
      await Project.updateOne({ _id: id }, { $set: data });

      const keep = new Set([data.coverPublicId, ...gallery.map((image) => image.publicId)]);
      const old = [previous.coverPublicId, ...previous.gallery.map((image) => image.publicId)];
      for (const publicId of old) if (publicId && !keep.has(publicId)) await deleteImage(publicId);
    }
    refreshSite();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Proje kaydedilemedi:", error);
    return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    const doc = await Project.findByIdAndDelete(id).lean();
    if (doc) {
      for (const publicId of [doc.coverPublicId, ...doc.gallery.map((image) => image.publicId)]) {
        if (publicId) await deleteImage(publicId);
      }
    }
  } catch (error) {
    console.error("Proje silinemedi:", error);
    return { ok: false, error: "Silinemedi." };
  }
  refreshSite();
  revalidatePath("/admin", "layout");
  redirect("/admin/projects");
}

export type SeoInput = {
  siteUrl: string;
  titleTr: string;
  descriptionTr: string;
  titleEn: string;
  descriptionEn: string;
  titleDe: string;
  descriptionDe: string;
  titleFr: string;
  descriptionFr: string;
  titleAr: string;
  descriptionAr: string;
  ogImageUrl: string;
  ogImagePublicId: string;
  googleSiteVerification: string;
  allowIndex: boolean;
};

export async function saveSeoSettings(input: SeoInput): Promise<ActionResult> {
  await requireAdmin();
  const text = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
  const siteUrlInput = text(input.siteUrl, 300);
  let siteUrl = "";

  if (siteUrlInput) {
    try {
      const parsed = new URL(siteUrlInput);
      const localHost = ["localhost", "127.0.0.1"].includes(parsed.hostname);
      if ((parsed.protocol !== "https:" && !(localHost && parsed.protocol === "http:")) || parsed.username || parsed.password) {
        return { ok: false, error: "Canlı site adresi https:// ile başlamalı." };
      }
      if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
        return { ok: false, error: "Site adresine yalnızca alan adını yazın; yol, sorgu veya # eklemeyin." };
      }
      siteUrl = parsed.origin;
    } catch {
      return { ok: false, error: "Geçerli bir site adresi girin (https://ornek.com)." };
    }
  }

  const ogImageUrl = text(input.ogImageUrl, 500);
  const ogImagePublicId = text(input.ogImagePublicId, 300);
  const googleSiteVerification = text(input.googleSiteVerification, 200);
  if (ogImageUrl && !isOwnImageUrl(ogImageUrl)) return { ok: false, error: "Sosyal paylaşım görseli kendi Cloudinary hesabınızdan olmalı." };
  if (googleSiteVerification && !/^[A-Za-z0-9_-]+$/.test(googleSiteVerification)) {
    return { ok: false, error: "Google doğrulama kodu geçersiz karakter içeriyor." };
  }

  const seo = {
    siteUrl,
    titleTr: text(input.titleTr, 70),
    descriptionTr: text(input.descriptionTr, 300),
    titleEn: text(input.titleEn, 70),
    descriptionEn: text(input.descriptionEn, 300),
    titleDe: text(input.titleDe, 70),
    descriptionDe: text(input.descriptionDe, 300),
    titleFr: text(input.titleFr, 70),
    descriptionFr: text(input.descriptionFr, 300),
    titleAr: text(input.titleAr, 70),
    descriptionAr: text(input.descriptionAr, 300),
    ogImageUrl,
    ogImagePublicId: ogImageUrl ? ogImagePublicId : "",
    googleSiteVerification,
    allowIndex: Boolean(input.allowIndex),
  };

  try {
    await connectDb();
    const doc = await Content.findOne({ scope: "settings", key: "main" }).lean();
    const current = isPlain(doc?.data) ? doc.data : {};
    const previousSeo = isPlain(current.seo) ? current.seo : {};
    await Content.updateOne(
      { scope: "settings", key: "main" },
      { $set: { data: { ...defaultSettings, ...current, seo } } },
      { upsert: true },
    );
    if (typeof previousSeo.ogImagePublicId === "string" && previousSeo.ogImagePublicId && previousSeo.ogImagePublicId !== seo.ogImagePublicId) {
      await deleteImage(previousSeo.ogImagePublicId);
    }
    refreshSite();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("SEO ayarları kaydedilemedi:", error);
    return { ok: false, error: "SEO ayarları kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function clearAccessLogs(): Promise<ActionResult> {
  await requireAdmin();
  try {
    await connectDb();
    await AccessEvent.deleteMany({});
    revalidatePath("/admin/analytics", "page");
    return { ok: true };
  } catch (error) {
    console.error("Erişim kayıtları temizlenemedi:", error);
    return { ok: false, error: "Kayıtlar temizlenemedi." };
  }
}

