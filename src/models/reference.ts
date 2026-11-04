import { model, models, Schema, type Model } from "mongoose";
import type { LocalizedText } from "@/lib/locales";

export type ReferenceDoc = {
  slug: string;
  name: string;
  website: string;
  tagline: LocalizedText;
  sector: LocalizedText;
  description: LocalizedText;
  story: LocalizedText;
  features: { title: LocalizedText; text: LocalizedText }[];
  stats: { value: string; label: LocalizedText }[];
  tech: string[];
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

const text = (max: number) => ({
  tr: { type: String, default: "", maxlength: max },
  en: { type: String, default: "", maxlength: max },
  de: { type: String, default: "", maxlength: max },
  fr: { type: String, default: "", maxlength: max },
  ar: { type: String, default: "", maxlength: max },
});

const ReferenceSchema = new Schema<ReferenceDoc>(
  {
    slug: { type: String, default: "", maxlength: 120 },
    name: { type: String, required: true, maxlength: 120 },
    website: { type: String, default: "", maxlength: 300 },
    tagline: text(240),
    sector: text(200),
    description: text(2000),
    story: text(6000),
    features: { type: [{ _id: false, title: text(120), text: text(500) }], default: [] },
    stats: { type: [{ _id: false, value: { type: String, default: "", maxlength: 20 }, label: text(80) }], default: [] },
    tech: { type: [String], default: [] },
    logoUrl: { type: String, default: "", maxlength: 500 },
    logoPublicId: { type: String, default: "", maxlength: 300 },
    gallery: { type: [{ _id: false, url: String, publicId: String, caption: text(200), description: text(1500) }], default: [] },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);
ReferenceSchema.index({ order: 1, createdAt: -1 });

export const Reference: Model<ReferenceDoc> =
  (models.Reference as Model<ReferenceDoc>) || model<ReferenceDoc>("Reference", ReferenceSchema);
