"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { isValidPlacement, placementLabel, relatedAdPlacements, slotCapacity, type AdSlotKey } from "@/lib/ads";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { safeUrl } from "@/lib/site";
import { deleteImage, isOwnImageUrl } from "@/lib/storage";
import { Ad } from "@/models/ad";

export type AdResult = { ok: boolean; error?: string; id?: string };

export type AdInput = {
  advertiser: string;
  title: string;
  description: string;
  placements: string[];
  imageUrl: string;
  imagePublicId: string;
  imageWidth: number;
  imageHeight: number;
  linkUrl: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  priority: number;
  note: string;
};

const validId = (id: string) => mongoose.isValidObjectId(id);
const clip = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const dimension = (value: unknown) => {
  const number = Math.round(Number(value));
  return Number.isFinite(number) && number > 0 && number <= 20000 ? number : 0;
};

function parseDate(value: string, endOfDay: boolean) {
  if (!value) return null;
  const date = new Date(`${value.slice(0, 10)}T${endOfDay ? "23:59:59" : "00:00:00"}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function saveAd(id: string | null, input: AdInput): Promise<AdResult> {
  await requireAdmin();
  if (id !== null && !validId(id)) return { ok: false, error: "Geçersiz istek." };

  const advertiser = clip(input.advertiser, 120);
  const title = clip(input.title, 120);
  const description = clip(input.description, 240);
  if (!advertiser) return { ok: false, error: "İşletme / sponsor adı zorunlu." };
  const linkUrl = safeUrl(clip(input.linkUrl, 600));
  if (!linkUrl) return { ok: false, error: "Yönlendirme bağlantısı https:// ile başlamalı." };
  if (input.imageUrl && !isOwnImageUrl(input.imageUrl)) return { ok: false, error: "Görsel doğrulanamadı; yeniden yükleyin." };
  if (!input.imageUrl && !title) return { ok: false, error: "Görsel yüklemediyseniz reklam başlığı yazın." };

  const placements = [...new Set((input.placements ?? []).filter((item) => typeof item === "string" && isValidPlacement(item)))];
  if (placements.length === 0) return { ok: false, error: "En az bir reklam konumu seçin." };

  const startsAt = parseDate(input.startsAt, false);
  const endsAt = parseDate(input.endsAt, true);
  if (startsAt === undefined || endsAt === undefined) return { ok: false, error: "Tarih geçersiz." };
  if (startsAt && endsAt && endsAt < startsAt) return { ok: false, error: "Bitiş tarihi başlangıçtan önce olamaz." };
  const priority = Math.min(100, Math.max(0, Math.round(Number(input.priority) || 0)));

  try {
    await connectDb();

    // Konum kapasitesi: yatayda 4, dikeyde 1 yayındaki reklam.
    if (input.active) {
      const now = new Date();
      for (const placement of placements) {
        const slot = placement.split(":")[1] as AdSlotKey;
        const taken = await Ad.countDocuments({
          placements: { $in: relatedAdPlacements(placement) },
          active: true,
          ...(id ? { _id: { $ne: id } } : {}),
          $or: [{ endsAt: null }, { endsAt: { $gte: now } }],
        });
        if (taken >= slotCapacity(slot)) return { ok: false, error: `"${placementLabel(placement)}" konumu dolu (en fazla ${slotCapacity(slot)} reklam). Başka bir konum seçin veya mevcut reklamı durdurun.` };
      }
    }

    const data = {
      advertiser,
      title,
      description,
      placements,
      imageUrl: input.imageUrl || "",
      imagePublicId: input.imageUrl ? clip(input.imagePublicId, 300) : "",
      imageWidth: input.imageUrl ? dimension(input.imageWidth) : 0,
      imageHeight: input.imageUrl ? dimension(input.imageHeight) : 0,
      linkUrl,
      startsAt,
      endsAt,
      active: !!input.active,
      priority,
      note: clip(input.note, 1000),
    };

    let savedId = id;
    if (id) {
      const previous = await Ad.findById(id).lean();
      if (!previous) return { ok: false, error: "Reklam bulunamadı." };
      await Ad.updateOne({ _id: id }, { $set: data });
      if (previous.imagePublicId && previous.imagePublicId !== data.imagePublicId) await deleteImage(previous.imagePublicId);
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

export async function setAdActive(id: string, active: boolean): Promise<AdResult> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    if (active) {
      const ad = await Ad.findById(id).lean();
      if (!ad) return { ok: false, error: "Reklam bulunamadı." };
      const now = new Date();
      for (const placement of ad.placements) {
        const slot = placement.split(":")[1] as AdSlotKey;
        const taken = await Ad.countDocuments({ placements: { $in: relatedAdPlacements(placement) }, active: true, _id: { $ne: id }, $or: [{ endsAt: null }, { endsAt: { $gte: now } }] });
        if (taken >= slotCapacity(slot)) return { ok: false, error: `"${placementLabel(placement)}" konumu dolu.` };
      }
    }
    await Ad.updateOne({ _id: id }, { $set: { active } });
    revalidatePath("/admin/ads");
    return { ok: true };
  } catch (error) {
    console.error("Reklam güncellenemedi:", error);
    return { ok: false, error: "Güncellenemedi." };
  }
}

export async function deleteAd(id: string): Promise<AdResult> {
  await requireAdmin();
  if (!validId(id)) return { ok: false, error: "Geçersiz istek." };
  try {
    await connectDb();
    const ad = await Ad.findByIdAndDelete(id).lean();
    if (ad?.imagePublicId) await deleteImage(ad.imagePublicId);
    revalidatePath("/admin/ads");
    return { ok: true };
  } catch (error) {
    console.error("Reklam silinemedi:", error);
    return { ok: false, error: "Silinemedi." };
  }
}
