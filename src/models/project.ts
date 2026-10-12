import { model, models, Schema, type Model } from "mongoose";
import type { LocalizedText } from "@/lib/locales";

export type ProjectImage = { url: string; publicId: string };

export type ProjectDoc = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  category: LocalizedText;
  client: string;
  year: string;
  url: string;
  coverUrl: string;
  coverPublicId: string;
  coverFit: "cover" | "contain";
  gallery: ProjectImage[];
  tags: string[];
  order: number;
  visible: boolean;
};

const short = { tr: { type: String, default: "", maxlength: 200 }, en: { type: String, default: "", maxlength: 200 }, de: { type: String, default: "", maxlength: 200 }, fr: { type: String, default: "", maxlength: 200 }, ar: { type: String, default: "", maxlength: 200 } };
const long = { tr: { type: String, default: "", maxlength: 8000 }, en: { type: String, default: "", maxlength: 8000 }, de: { type: String, default: "", maxlength: 8000 }, fr: { type: String, default: "", maxlength: 8000 }, ar: { type: String, default: "", maxlength: 8000 } };

const ProjectSchema = new Schema<ProjectDoc>(
  {
    slug: { type: String, required: true, unique: true, maxlength: 120 },
    title: short,
    summary: { tr: { type: String, default: "", maxlength: 400 }, en: { type: String, default: "", maxlength: 400 }, de: { type: String, default: "", maxlength: 400 }, fr: { type: String, default: "", maxlength: 400 }, ar: { type: String, default: "", maxlength: 400 } },
    description: long,
    category: short,
    client: { type: String, default: "", maxlength: 120 },
    year: { type: String, default: "", maxlength: 10 },
    url: { type: String, default: "", maxlength: 300 },
    coverUrl: { type: String, default: "", maxlength: 500 },
    coverPublicId: { type: String, default: "", maxlength: 300 },
    coverFit: { type: String, enum: ["cover", "contain"], default: "cover" },
    gallery: { type: [{ _id: false, url: String, publicId: String }], default: [] },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);
ProjectSchema.index({ order: 1, createdAt: -1 });

export const Project: Model<ProjectDoc> =
  (models.Project as Model<ProjectDoc>) || model<ProjectDoc>("Project", ProjectSchema);
