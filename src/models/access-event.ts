import { model, models, Schema, type Model } from "mongoose";

export const accessEventTypes = ["page_view", "login_failed", "login_rate_limited", "login_success"] as const;
export type AccessEventType = (typeof accessEventTypes)[number];

export type AccessEventDoc = {
  type: AccessEventType;
  path: string;
  referrerHost: string;
  device: "mobile" | "tablet" | "desktop" | "unknown";
  browser: "chrome" | "safari" | "firefox" | "edge" | "other";
  sourceKey: string;
  createdAt: Date;
};

const AccessEventSchema = new Schema<AccessEventDoc>(
  {
    type: { type: String, required: true, enum: accessEventTypes },
    path: { type: String, default: "", maxlength: 240 },
    referrerHost: { type: String, default: "", maxlength: 160 },
    device: { type: String, enum: ["mobile", "tablet", "desktop", "unknown"], default: "unknown" },
    browser: { type: String, enum: ["chrome", "safari", "firefox", "edge", "other"], default: "other" },
    sourceKey: { type: String, default: "", maxlength: 32 },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
  },
  { versionKey: false },
);

AccessEventSchema.index({ type: 1, createdAt: -1 });

export const AccessEvent: Model<AccessEventDoc> =
  (models.AccessEvent as Model<AccessEventDoc>) || model<AccessEventDoc>("AccessEvent", AccessEventSchema);
