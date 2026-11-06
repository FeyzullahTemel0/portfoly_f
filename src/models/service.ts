import { model, models, Schema, type Model } from "mongoose";

export type ServiceBlock = {
  title: string;
  summary: string;
  intro: string;
  notice: string;
  includes: string[];
  notIncluded: string[];
  suitable: string[];
  steps: { title: string; text: string }[];
};

export type ServiceDoc = {
  slug: string;
  group: "software" | "design";
  catalogCategory: "web" | "automation" | "ecommerce";
  icon: string;
  imageUrl: string;
  imagePublicId: string;
  priceMode: "from" | "fixed" | "quote";
  priceAmount: number;
  priceCurrency: string;
  order: number;
  visible: boolean;
  content: Record<string, ServiceBlock>;
};

const ServiceSchema = new Schema<ServiceDoc>(
  {
    slug: { type: String, required: true, unique: true, maxlength: 80 },
    group: { type: String, enum: ["software", "design"], default: "software" },
    catalogCategory: { type: String, enum: ["web", "automation", "ecommerce"], default: "web" },
    icon: { type: String, default: "", maxlength: 40 },
    imageUrl: { type: String, default: "", maxlength: 500 },
    imagePublicId: { type: String, default: "", maxlength: 300 },
    priceMode: { type: String, enum: ["from", "fixed", "quote"], default: "quote" },
    priceAmount: { type: Number, default: 0, min: 0 },
    priceCurrency: { type: String, default: "TRY", maxlength: 3 },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
    content: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);
ServiceSchema.index({ order: 1, createdAt: 1 });

export const Service: Model<ServiceDoc> = (models.Service as Model<ServiceDoc>) || model<ServiceDoc>("Service", ServiceSchema);
