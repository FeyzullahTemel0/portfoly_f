import type { Locale } from "@/lib/locales";

// Varsayılan site ayarları. Yönetim panelinde değiştirilen değerler bunların üzerine yazılır.
export const defaultSettings = {
  legalName: "Rovax Software Yazılım Çözümleri",
  email: "",
  phone: "+90 501 372 43 47",
  // Ülke kodlu, yalnızca rakam; WhatsApp bağlantısı bu numaradan oluşur.
  whatsapp: "905013724347",
  address: {
    tr: "Bayır Mahallesi, Menteşe / Muğla",
    en: "Bayır District, Menteşe / Muğla, Türkiye",
    de: "Stadtteil Bayır, Menteşe / Muğla, Türkei",
    fr: "Quartier Bayır, Menteşe / Muğla, Turquie",
    ar: "حي بايير، منتشه / موغلا، تركيا",
  },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bay%C4%B1r+Mahallesi,+Mente%C5%9Fe,+Mu%C4%9Fla",
  social: { instagram: "", telegram: "", threads: "", x: "", linkedin: "", facebook: "", youtube: "", tiktok: "" },
  legalUpdated: "2026-11-03",
  seo: {
    siteUrl: "",
    titleTr: "",
    descriptionTr: "",
    titleEn: "",
    descriptionEn: "",
    titleDe: "",
    descriptionDe: "",
    titleFr: "",
    descriptionFr: "",
    titleAr: "",
    descriptionAr: "",
    ogImageUrl: "",
    ogImagePublicId: "",
    googleSiteVerification: "",
    allowIndex: true,
  },
};

export type Settings = typeof defaultSettings;

// Yönetim panelinden girilen adreslerde yalnızca http(s) bağlantılara izin verilir.
export function safeUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

// Proje adresi: https/http bağlantısı ya da sitenin kendi /demos/ klasöründeki statik demo.
export function safeProjectUrl(value: string) {
  const trimmed = value.trim();
  return /^\/demos\/[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/.test(trimmed) ? trimmed : safeUrl(trimmed);
}

export type ContactItem = { key: "phone" | "email" | "address"; value: string; href: string };
export type SocialKey = "whatsapp" | "phone" | "email" | "telegram" | "instagram" | "threads" | "x" | "linkedin" | "facebook" | "youtube" | "tiktok";
export type SocialItem = { key: SocialKey; label: string; href: string };

export function getContactItems(settings: Settings, lang: Locale): ContactItem[] {
  const items: ContactItem[] = [];
  if (settings.phone) {
    items.push({ key: "phone", value: settings.phone, href: `tel:${settings.phone.replace(/[^\d+]/g, "")}` });
  }
  if (settings.email) {
    items.push({ key: "email", value: settings.email, href: `mailto:${settings.email}` });
  }
  if (settings.address[lang]) {
    items.push({ key: "address", value: settings.address[lang], href: "" });
  }
  return items;
}

export function getSocialItems(settings: Settings): SocialItem[] {
  const items: SocialItem[] = [];
  const digits = settings.whatsapp.replace(/\D/g, "");

  if (digits) items.push({ key: "whatsapp", label: "WhatsApp", href: `https://wa.me/${digits}` });
  const labels: [Exclude<SocialKey, "whatsapp" | "phone" | "email">, string][] = [
    ["telegram", "Telegram"], ["instagram", "Instagram"], ["threads", "Threads"], ["x", "X"],
    ["linkedin", "LinkedIn"], ["facebook", "Facebook"], ["youtube", "YouTube"], ["tiktok", "TikTok"],
  ];
  for (const [key, label] of labels) {
    const href = safeUrl(settings.social[key] ?? "");
    if (href) items.push({ key, label, href });
  }
  return items;
}
