import type { Locale } from "@/lib/locales";

// Varsayılan site ayarları. Yönetim panelinde değiştirilen değerler bunların üzerine yazılır.
export const defaultSettings = {
  legalName: "Temeloji Dijital",
  email: "",
  phone: "",
  // Ülke kodlu, yalnızca rakam (örn. 905xxxxxxxxx).
  whatsapp: "",
  address: { tr: "Muğla / Merkez", en: "Muğla / Merkez", de: "Muğla / Türkei", fr: "Muğla / Turquie", ar: "موغلا / تركيا" },
  social: { instagram: "", linkedin: "", x: "" },
  legalUpdated: "2026-10-08",
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
export type SocialItem = { key: "instagram" | "linkedin" | "x" | "whatsapp"; label: string; href: string };

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
  const instagram = safeUrl(settings.social.instagram);
  const linkedin = safeUrl(settings.social.linkedin);
  const x = safeUrl(settings.social.x);
  const digits = settings.whatsapp.replace(/\D/g, "");

  if (instagram) items.push({ key: "instagram", label: "Instagram", href: instagram });
  if (linkedin) items.push({ key: "linkedin", label: "LinkedIn", href: linkedin });
  if (x) items.push({ key: "x", label: "X", href: x });
  if (digits) items.push({ key: "whatsapp", label: "WhatsApp", href: `https://wa.me/${digits}` });
  return items;
}
