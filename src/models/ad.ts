import { model, models, Schema, type Model } from "mongoose";

export type AdDoc = {
  advertiser: string;
  title: string;
  description: string;
  placements: string[];
  imageUrl: string;
  imagePublicId: string;
  imageWidth: number;
  imageHeight: number;
  linkUrl: string;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
  priority: number;
  note: string;
  impressions: number;
  clicks: number;
  createdAt: Date;
};

const AdSchema = new Schema<AdDoc>(
  {
    advertiser: { type: String, required: true, maxlength: 120 },
    title: { type: String, default: "", maxlength: 120 },
    description: { type: String, default: "", maxlength: 240 },
    placements: { type: [String], default: [] },
    imageUrl: { type: String, default: "", maxlength: 500 },
    imagePublicId: { type: String, default: "", maxlength: 300 },
    imageWidth: { type: Number, default: 0 },
    imageHeight: { type: Number, default: 0 },
    linkUrl: { type: String, default: "", maxlength: 600 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 0, min: 0, max: 100 },
    note: { type: String, default: "", maxlength: 1000 },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true },
);
AdSchema.index({ placements: 1, active: 1 });

export const Ad: Model<AdDoc> = (models.Ad as Model<AdDoc>) || model<AdDoc>("Ad", AdSchema);

export type AdStatus = "live" | "scheduled" | "paused" | "expired";

export function adStatus(ad: Pick<AdDoc, "active" | "startsAt" | "endsAt">, now = Date.now()): AdStatus {
  if (ad.endsAt && ad.endsAt.getTime() < now) return "expired";
  if (!ad.active) return "paused";
  if (ad.startsAt && ad.startsAt.getTime() > now) return "scheduled";
  return "live";
}
