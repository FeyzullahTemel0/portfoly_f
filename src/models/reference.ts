import { model, models, Schema, type Model } from "mongoose";
import type { LocalizedText } from "@/lib/locales";

export type ReferenceDoc = {
  slug: string;
  name: string;
  website: string;
  sector: LocalizedText;
  description: LocalizedText;
  logoUrl: string;
  logoPublicId: string;
  gallery: {
    url: string;
    publicId: string;
    caption: LocalizedText;
    description: LocalizedText;
  }[];
  order: number;
  visible: boolean;
};

const localized = { tr: { type: String, default: "", maxlength: 200 }, en: { type: String, default: "", maxlength: 200 }, de: { type: String, default: "", maxlength: 200 }, fr: { type: String, default: "", maxlength: 200 }, ar: { type: String, default: "", maxlength: 200 } };
const localizedLong = { tr: { type: String, default: "", maxlength: 1000 }, en: { type: String, default: "", maxlength: 1000 }, de: { type: String, default: "", maxlength: 1000 }, fr: { type: String, default: "", maxlength: 1000 }, ar: { type: String, default: "", maxlength: 1000 } };
const localizedCaption = { tr: { type: String, default: "", maxlength: 160 }, en: { type: String, default: "", maxlength: 160 }, de: { type: String, default: "", maxlength: 160 }, fr: { type: String, default: "", maxlength: 160 }, ar: { type: String, default: "", maxlength: 160 } };

const ReferenceSchema = new Schema<ReferenceDoc>(
  {
    slug: { type: String, default: "", maxlength: 120 },
    name: { type: String, required: true, maxlength: 120 },
    website: { type: String, default: "", maxlength: 300 },
    sector: localized,
    description: localizedLong,
    logoUrl: { type: String, default: "", maxlength: 500 },
    logoPublicId: { type: String, default: "", maxlength: 300 },
    gallery: { type: [{ _id: false, url: String, publicId: String, caption: localizedCaption, description: localizedLong }], default: [] },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);
ReferenceSchema.index({ order: 1, createdAt: -1 });

export const Reference: Model<ReferenceDoc> =
  (models.Reference as Model<ReferenceDoc>) || model<ReferenceDoc>("Reference", ReferenceSchema);
