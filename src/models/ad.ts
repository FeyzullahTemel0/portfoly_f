import { model, models, Schema, type Model } from "mongoose";

export type AdDoc = {
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
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
  weight: number;
  impressions: number;
  clicks: number;
};

const AdSchema = new Schema<AdDoc>(
  {
    advertiser: { type: String, required: true, maxlength: 120 },
    pages: { type: [String], default: ["all"] },
    position: { type: String, required: true, maxlength: 30 },
    imageUrl: { type: String, default: "", maxlength: 500 },
    imagePublicId: { type: String, default: "", maxlength: 300 },
    mobileImageUrl: { type: String, default: "", maxlength: 500 },
    mobileImagePublicId: { type: String, default: "", maxlength: 300 },
    imageWidth: { type: Number, default: 0 },
    imageHeight: { type: Number, default: 0 },
    mobileImageWidth: { type: Number, default: 0 },
    mobileImageHeight: { type: Number, default: 0 },
    linkUrl: { type: String, default: "", maxlength: 600 },
    alt: { type: String, default: "", maxlength: 160 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
    weight: { type: Number, default: 1, min: 1, max: 10 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true },
);
AdSchema.index({ position: 1, active: 1 });

export const Ad: Model<AdDoc> = (models.Ad as Model<AdDoc>) || model<AdDoc>("Ad", AdSchema);
