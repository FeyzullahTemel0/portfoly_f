import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { AdminHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { locales } from "@/lib/locales";
import { emptyBlock, normalizeBlock } from "@/lib/services";
import { Service } from "@/models/service";
import type { ServiceInput } from "../../manage-actions";
import { ServiceForm } from "./service-form";

export default async function ServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  let initial: ServiceInput = {
    slug: "",
    group: "software",
    icon: "",
    priceMode: "quote",
    priceAmount: 0,
    priceCurrency: "TRY",
    order: 100,
    visible: true,
    content: Object.fromEntries(locales.map((locale) => [locale, emptyBlock()])),
  };

  if (!isNew) {
    if (!mongoose.isValidObjectId(id)) notFound();
    await connectDb();
    const doc = await Service.findById(id).lean();
    if (!doc) notFound();
    const content = (doc.content ?? {}) as Record<string, unknown>;
    initial = {
      slug: doc.slug,
      group: doc.group,
      icon: doc.icon,
      priceMode: doc.priceMode,
      priceAmount: doc.priceAmount,
      priceCurrency: doc.priceCurrency,
      order: doc.order,
      visible: doc.visible,
      content: Object.fromEntries(locales.map((locale) => [locale, normalizeBlock(content[locale])])),
    };
  }

  return (
    <>
      <AdminHeader title={isNew ? "Yeni hizmet" : "Hizmeti düzenle"} text="Türkçe metni girin; diğer diller otomatik çevrilir. Fiyat ziyaretçinin para birimine güncel kurla çevrilir." />
      <ServiceForm id={isNew ? null : id} initial={initial} />
    </>
  );
}
