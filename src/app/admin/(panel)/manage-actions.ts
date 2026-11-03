"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { baseDictionaries } from "@/dictionaries/base";
import { getAdminProfile, getCredentials, hashPassword } from "@/lib/admin-account";
import { AD_POSITIONS, adPageKeys, isAdPosition } from "@/lib/ads";
import { endSession, requireAdmin, verifyPassword } from "@/lib/auth";
import { isCurrency } from "@/lib/currency";
import { connectDb } from "@/lib/db";
import { locales, type Locale } from "@/lib/locales";
import { emptyBlock, normalizeBlock } from "@/lib/services";
import { safeUrl } from "@/lib/site";
import { deleteImage, isOwnImageUrl } from "@/lib/storage";
import { translateTexts } from "@/lib/translate";
import { Ad } from "@/models/ad";
import { Content } from "@/models/content";
import { Service, type ServiceBlock } from "@/models/service";

export type Result = { ok: boolean; error?: string; id?: string; data?: unknown };

const refreshSite = () => revalidatePath("/[lang]", "layout");
const validId = (id: string) => mongoose.isValidObjectId(id);
const clip = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const dimension = (value: unknown) => {
  const number = Math.round(Number(value));
  return Number.isFinite(number) && number > 0 && number <= 20000 ? number : 0;
};

// ---------- Hizmetler ----------

export type ServiceInput = {
  slug: string;
  group: string;
  icon: string;
  priceMode: string;
  priceAmount: number;
  priceCurrency: string;
  order: number;
  visible: boolean;
  content: Record<string, ServiceBlock>;
};

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanBlock(value: unknown): ServiceBlock {
  const block = normalizeBlock(value);
  return {
    title: block.title.slice(0, 120),
    summary: block.summary.slice(0, 400),
    intro: block.intro.slice(0, 2000),
    notice: block.notice.slice(0, 1000),
    includes: block.includes.slice(0, 30).map((item) => item.slice(0, 300)),
    notIncluded: block.notIncluded.slice(0, 30).map((item) => item.slice(0, 300)),
    suitable: block.suitable.slice(0, 20).map((item) => item.slice(0, 300)),
    steps: block.steps.slice(0, 12).map((step) => ({ title: step.title.slice(0, 120), text: step.text.slice(0, 600) })),
  };
}

// Türkçe metni diğer dillere çevirir; yalnızca boş olan alanlar (ya da overwrite açıksa tümü) doldurulur.
async function fillTranslations(content: Record<string, ServiceBlock>, overwrite: boolean) {
  const source = content.tr ?? emptyBlock();
  const targets = locales.filter((locale) => locale !== "tr") as Locale[];

  for (const target of targets) {
    const current = content[target] ?? emptyBlock();
    const next: ServiceBlock = { ...current };
    const flat: string[] = [];
    const take = (value: string) => (flat.push(value), flat.length - 1);

    const fields = (["title", "summary", "intro", "notice"] as const).map((key) => ({ key, index: !overwrite && current[key] ? -1 : take(source[key]) }));
    const lists = (["includes", "notIncluded", "suitable"] as const).map((key) => ({
      key,
      indexes: !overwrite && current[key].length ? null : source[key].map(take),
    }));
    const steps = !overwrite && current.steps.length ? null : source.steps.map((step) => ({ title: take(step.title), text: take(step.text) }));

    if (flat.length === 0) {
      content[target] = next;
      continue;
    }
    const translated = await translateTexts(flat, "tr", target);
    for (const { key, index } of fields) if (index >= 0) next[key] = translated[index];
    for (const { key, indexes } of lists) if (indexes) next[key] = indexes.map((i) => translated[i]);
    if (steps) next.steps = steps.map((step) => ({ title: translated[step.title], text: translated[step.text] }));
    content[target] = next;
  }
  return content;
}

export async function translateServiceContent(content: Record<string, ServiceBlock>, overwrite: boolean): Promise<Result> {
  await requireAdmin();
  try {
    const clean: Record<string, ServiceBlock> = {};
    for (const locale of locales) clean[locale] = cleanBlock(content?.[locale]);
    if (!clean.tr.title) return { ok: false, error: "Önce Türkçe başlığı doldurun." };
    return { ok: true, data: await fillTranslations(clean, overwrite) };
  } catch (error) {
    console.error("Çeviri başarısız:", error);
    return { ok: false, error: "Otomatik çeviri şu anda yapılamadı. Biraz sonra tekrar deneyin veya alanları elle doldurun." };
  }
}

export async function saveService(id: string | null, input: ServiceInput, autoTranslate: boolean): Promise<Result> {
  await requireAdmin();
  if (id !== null && !validId(id)) return { ok: false, error: "Geçersiz istek." };

  const content: Record<string, ServiceBlock> = {};
  for (const locale of locales) content[locale] = cleanBlock(input.content?.[locale]);
  if (!content.tr.title) return { ok: false, error: "Türkçe başlık zorunlu." };
  const slug = slugify(input.slug || content.tr.title);
  if (!slug) return { ok: false, error: "Sayfa adresi oluşturulamadı." };
  const amount = Number(input.priceAmount);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000) return { ok: false, error: "Fiyat geçersiz." };
  const priceMode = ["from", "fixed", "quote"].includes(input.priceMode) ? input.priceMode : "quote";
  if (priceMode !== "quote" && amount <= 0) return { ok: false, error: "Fiyat türü seçtiyseniz tutar 0'dan büyük olmalı." };

  try {
    await connectDb();
    const duplicate = await Service.findOne({ slug, ...(id ? { _id: { $ne: id } } : {}) }).lean();
    if (duplicate) return { ok: false, error: "Bu sayfa adresi başka bir hizmette kullanılıyor." };

    let warning = "";
    if (autoTranslate) {
      try {
        await fillTranslations(content, false);
      } catch (error) {
        console.error("Otomatik çeviri atlandı:", error);
        warning = "Hizmet kaydedildi ancak otomatik çeviri yapılamadı; diğer diller boş kaldı.";
      }
    }

    const data = {
      slug,
      group: input.group === "design" ? "design" : "software",
      icon: clip(input.icon, 40),
      priceMode,
      priceAmount: amount,
      priceCurrency: isCurrency(input.priceCurrency) ? input.priceCurrency : "TRY",
      order: Number.isFinite(Number(input.order)) ? Math.round(Number(input.order)) : 0,
      visible: !!input.visible,
      content,
    };
    let savedId = id;
    if (id) {
      const result = await Service.updateOne({ _id: id }, { $set: data });
      if (result.matchedCount === 0) return { ok: false, error: "Hizmet bulunamadı." };
    } else {
      savedId = String((await Service.create(data))._id);
    }
    await Content.updateOne({ scope: "settings", key: "servicesManaged" }, { $set: { data: { on: true } } }, { upsert: true });
    refreshSite();
    revalidatePath("/admin/services");
    return { ok: true, id: savedId ?? undefined, error: warning || undefined };
  } catch (error) {
    console.error("Hizmet kaydedilemedi:", error);
    return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function deleteService(id: string): Promise<Result> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    await Service.deleteOne({ _id: id });
    await Content.updateOne({ scope: "settings", key: "servicesManaged" }, { $set: { data: { on: true } } }, { upsert: true });
    refreshSite();
    revalidatePath("/admin/services");
    return { ok: true };
  } catch (error) {
    console.error("Hizmet silinemedi:", error);
    return { ok: false, error: "Silinemedi." };
  }
}

// Sitenin hazır gelen hizmetlerini (5 dilde) veritabanına aktarır; mevcut adresler atlanır.
export async function importDefaultServices(): Promise<Result> {
  await requireAdmin();
  try {
    await connectDb();
    let added = 0;
    const base = baseDictionaries.tr.services.items;
    for (const [index, item] of base.entries()) {
      if (await Service.exists({ slug: item.slug })) continue;
      const content: Record<string, ServiceBlock> = {};
      for (const locale of locales) {
        const match = baseDictionaries[locale].services.items.find((entry) => entry.slug === item.slug) as unknown;
        content[locale] = cleanBlock(match);
      }
      await Service.create({ slug: item.slug, group: item.group === "design" ? "design" : "software", icon: item.slug, priceMode: "quote", priceAmount: 0, priceCurrency: "TRY", order: index, visible: true, content });
      added += 1;
    }
    await Content.updateOne({ scope: "settings", key: "servicesManaged" }, { $set: { data: { on: true } } }, { upsert: true });
    refreshSite();
    revalidatePath("/admin/services");
    return { ok: true, data: { added } };
  } catch (error) {
    console.error("Varsayılan hizmetler aktarılamadı:", error);
    return { ok: false, error: "Aktarılamadı." };
  }
}

// ---------- Reklamlar ----------

export type AdInput = {
  advertiser: string;
  pages: string[];
  position: string;
  imageUrl: string;
  imagePublicId: string;
  mobileImageUrl: string;
  mobileImagePublicId: string;
  imageWidth: number;
  imageHeight: number;
  mobileImageWidth: number;
  mobileImageHeight: number;
  linkUrl: string;
  alt: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  weight: number;
};

function parseDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function saveAd(id: string | null, input: AdInput): Promise<Result> {
  await requireAdmin();
  if (id !== null && !validId(id)) return { ok: false, error: "Geçersiz istek." };
  const advertiser = clip(input.advertiser, 120);
  if (!advertiser) return { ok: false, error: "Reklam veren adı zorunlu." };
  if (!isAdPosition(input.position)) return { ok: false, error: "Reklam konumu geçersiz." };
  const pages = [...new Set((input.pages ?? []).filter((page) => adPageKeys.includes(page)))];
  if (pages.length === 0) return { ok: false, error: "En az bir sayfa seçin." };
  const linkUrl = safeUrl(clip(input.linkUrl, 600));
  if (!linkUrl) return { ok: false, error: "Hedef adres https:// ile başlamalı." };
  if (!input.imageUrl || !isOwnImageUrl(input.imageUrl)) return { ok: false, error: "Masaüstü reklam görseli yükleyin." };
  if (input.mobileImageUrl && !isOwnImageUrl(input.mobileImageUrl)) return { ok: false, error: "Geçersiz mobil görsel." };
  const startsAt = parseDate(input.startsAt);
  const endsAt = parseDate(input.endsAt);
  if (startsAt === undefined || endsAt === undefined) return { ok: false, error: "Tarih geçersiz." };
  if (startsAt && endsAt && endsAt < startsAt) return { ok: false, error: "Bitiş tarihi başlangıçtan önce olamaz." };
  const weight = Math.min(10, Math.max(1, Math.round(Number(input.weight) || 1)));

  const data = {
    advertiser,
    pages,
    position: input.position,
    imageUrl: input.imageUrl,
    imagePublicId: clip(input.imagePublicId, 300),
    mobileImageUrl: input.mobileImageUrl || "",
    mobileImagePublicId: input.mobileImageUrl ? clip(input.mobileImagePublicId, 300) : "",
    imageWidth: dimension(input.imageWidth),
    imageHeight: dimension(input.imageHeight),
    mobileImageWidth: input.mobileImageUrl ? dimension(input.mobileImageWidth) : 0,
    mobileImageHeight: input.mobileImageUrl ? dimension(input.mobileImageHeight) : 0,
    linkUrl,
    alt: clip(input.alt, 160),
    startsAt,
    endsAt,
    active: !!input.active,
    weight,
  };

  try {
    await connectDb();
    let savedId = id;
    if (id) {
      const previous = await Ad.findById(id).lean();
      if (!previous) return { ok: false, error: "Reklam bulunamadı." };
      await Ad.updateOne({ _id: id }, { $set: data });
      if (previous.imagePublicId && previous.imagePublicId !== data.imagePublicId) await deleteImage(previous.imagePublicId);
      if (previous.mobileImagePublicId && previous.mobileImagePublicId !== data.mobileImagePublicId) await deleteImage(previous.mobileImagePublicId);
    } else {
      savedId = String((await Ad.create(data))._id);
    }
    revalidatePath("/admin/ads");
    return { ok: true, id: savedId ?? undefined };
  } catch (error) {
    console.error("Reklam kaydedilemedi:", error);
    return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  }
}

export async function setAdActive(id: string, active: boolean): Promise<Result> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    await Ad.updateOne({ _id: id }, { $set: { active } });
    revalidatePath("/admin/ads");
    return { ok: true };
  } catch (error) {
    console.error("Reklam güncellenemedi:", error);
    return { ok: false, error: "Güncellenemedi." };
  }
}

export async function deleteAd(id: string): Promise<Result> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    const ad = await Ad.findByIdAndDelete(id).lean();
    if (ad?.imagePublicId) await deleteImage(ad.imagePublicId);
    if (ad?.mobileImagePublicId) await deleteImage(ad.mobileImagePublicId);
    revalidatePath("/admin/ads");
    return { ok: true };
  } catch (error) {
    console.error("Reklam silinemedi:", error);
    return { ok: false, error: "Silinemedi." };
  }
}

export async function resetAdStats(id: string): Promise<Result> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    await Ad.updateOne({ _id: id }, { $set: { impressions: 0, clicks: 0 } });
    revalidatePath("/admin/ads");
    return { ok: true };
  } catch {
    return { ok: false, error: "Sıfırlanamadı." };
  }
}

// ---------- Profil ----------

export async function saveProfile(input: { displayName: string; bio: string }): Promise<Result> {
  await requireAdmin();
  try {
    await connectDb();
    await Content.updateOne(
      { scope: "settings", key: "adminProfile" },
      { $set: { "data.displayName": clip(input.displayName, 80), "data.bio": clip(input.bio, 500) } },
      { upsert: true },
    );
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Profil kaydedilemedi:", error);
    return { ok: false, error: "Kaydedilemedi." };
  }
}

export async function saveProfilePhoto(url: string, publicId: string): Promise<Result> {
  await requireAdmin();
  if (url && (!isOwnImageUrl(url) || !publicId.startsWith("rovax/profile/"))) return { ok: false, error: "Fotoğraf doğrulanamadı." };
  try {
    const previous = await getAdminProfile();
    await connectDb();
    await Content.updateOne(
      { scope: "settings", key: "adminProfile" },
      { $set: { "data.photoUrl": url, "data.photoPublicId": url ? publicId : "" } },
      { upsert: true },
    );
    if (previous.photoPublicId && previous.photoPublicId !== publicId) await deleteImage(previous.photoPublicId);
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Profil fotoğrafı kaydedilemedi:", error);
    return { ok: false, error: "Kaydedilemedi." };
  }
}

// E-posta ve/veya şifre değişimi; mevcut şifre doğrulanır ve işlem sonrası oturum kapanır.
export async function changeCredentials(input: { currentPassword: string; newEmail: string; newPassword: string }): Promise<Result> {
  await requireAdmin();
  const credentials = await getCredentials();
  if (!credentials || !verifyPassword(String(input.currentPassword ?? ""), credentials.hash)) return { ok: false, error: "Mevcut şifre hatalı." };
  const email = clip(input.newEmail, 120).toLowerCase() || credentials.email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "Geçersiz e-posta adresi." };
  const password = String(input.newPassword ?? "");
  if (password && password.length < 10) return { ok: false, error: "Yeni şifre en az 10 karakter olmalı." };
  if (!password && email === credentials.email) return { ok: false, error: "Değiştirilecek bir bilgi girmediniz." };

  try {
    await connectDb();
    await Content.updateOne(
      { scope: "settings", key: "adminAuth" },
      { $set: { data: { email, hash: password ? hashPassword(password) : credentials.hash } } },
      { upsert: true },
    );
    await endSession();
    return { ok: true };
  } catch (error) {
    console.error("Hesap bilgileri güncellenemedi:", error);
    return { ok: false, error: "Güncellenemedi." };
  }
}

export async function getAdSpecs() {
  return AD_POSITIONS;
}
