"use server";

import { getDictionary, getSettings } from "@/dictionaries";
import { connectDb } from "@/lib/db";
import { isLocale } from "@/lib/locales";
import { sendNotification } from "@/lib/mail";
import { getClientIp, hashIp } from "@/lib/request";
import { Message } from "@/models/message";
import { Quote } from "@/models/quote";

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string | string[]>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[+()\d\s-]{7,25}$/;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function field(formData: FormData, name: string, max: number) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

async function isOverLimit(ipHash: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  const [quotes, messages] = await Promise.all([
    Quote.countDocuments({ ipHash, createdAt: { $gte: since } }),
    Message.countDocuments({ ipHash, createdAt: { $gte: since } }),
  ]);
  return quotes + messages >= MAX_PER_WINDOW;
}

export async function submitQuote(lang: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isLocale(lang)) return { ok: false };
  const dict = await getDictionary(lang);
  const { errors: text, success, quote: labels } = dict.contactForm;

  // Botlar gizli alanı doldurur; başarılı gibi yanıtlayıp kaydetmeyiz.
  if (field(formData, "website", 200)) return { ok: true, message: success.quote };

  const name = field(formData, "name", 120);
  const email = field(formData, "email", 200);
  const phone = field(formData, "phone", 25);
  const details = field(formData, "details", 4000);
  const packageName = field(formData, "package", 80);
  const sizeValue = field(formData, "size", 10);
  const knownSlugs = dict.services.items.map((item) => item.slug);
  const services = formData.getAll("services").map(String).filter((slug) => knownSlugs.includes(slug));
  const noticeAcknowledged = formData.get("noticeAcknowledged") === "on";

  const errors: Record<string, string> = {};
  if (!name) errors.name = text.required;
  if (!EMAIL_PATTERN.test(email)) errors.email = text.email;
  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = text.phone;
  if (services.length === 0) errors.services = text.services;
  if (!noticeAcknowledged) errors.consent = text.consent;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values: { name, email, phone, details, size: sizeValue, services } };
  }

  const sizes = dict.process.page.sizes;
  const sizeIndex = Number(sizeValue);
  const size = sizeValue === "unsure" ? labels.sizeUnsure : (sizes[sizeIndex]?.name ?? "");
  const message = packageName ? `[${packageName}] ${details}`.trim() : details;

  try {
    await connectDb();
    const ipHash = hashIp(await getClientIp());
    if (await isOverLimit(ipHash)) return { ok: false, message: text.tooMany };

    await Quote.create({ name, email, phone, services, size, message, lang, ipHash });

    const settings = await getSettings();
    const serviceTitles = dict.services.items
      .filter((item) => services.includes(item.slug))
      .map((item) => item.title)
      .join(", ");
    await sendNotification(process.env.NOTIFY_EMAIL || settings.email, {
      subject: `Yeni teklif talebi: ${name}`,
      lines: [
        ["Ad soyad", name],
        ["E-posta", email],
        ["Telefon", phone || "-"],
        ["Hizmetler", serviceTitles],
        ["İşin büyüklüğü", size || "-"],
        ["Mesaj", message || "-"],
      ],
    });
  } catch (error) {
    console.error("Teklif kaydedilemedi:", error);
    return { ok: false, message: text.generic, values: { name, email, phone, details, size: sizeValue, services } };
  }

  return { ok: true, message: success.quote };
}

export async function submitMessage(lang: string, _prev: FormState, formData: FormData): Promise<FormState> {
  if (!isLocale(lang)) return { ok: false };
  const dict = await getDictionary(lang);
  const { errors: text, success, message: labels } = dict.contactForm;

  if (field(formData, "website", 200)) return { ok: true, message: success.message };

  const name = field(formData, "name", 120);
  const email = field(formData, "email", 200);
  const body = field(formData, "message", 4000);
  const kindIndex = Number(field(formData, "kind", 3));
  const kind = labels.kinds[kindIndex] ?? "";
  const noticeAcknowledged = formData.get("noticeAcknowledged") === "on";

  const errors: Record<string, string> = {};
  if (!name) errors.name = text.required;
  if (!EMAIL_PATTERN.test(email)) errors.email = text.email;
  if (!body) errors.message = text.required;
  if (!noticeAcknowledged) errors.consent = text.consent;

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values: { name, email, message: body, kind: String(kindIndex) } };
  }

  try {
    await connectDb();
    const ipHash = hashIp(await getClientIp());
    if (await isOverLimit(ipHash)) return { ok: false, message: text.tooMany };

    await Message.create({ name, email, kind, message: body, lang, ipHash });

    const settings = await getSettings();
    await sendNotification(process.env.NOTIFY_EMAIL || settings.email, {
      subject: `Yeni mesaj (${kind || "Genel"}): ${name}`,
      lines: [
        ["Ad soyad", name],
        ["E-posta", email],
        ["Konu", kind || "-"],
        ["Mesaj", body],
      ],
    });
  } catch (error) {
    console.error("Mesaj kaydedilemedi:", error);
    return { ok: false, message: text.generic, values: { name, email, message: body, kind: String(kindIndex) } };
  }

  return { ok: true, message: success.message };
}
