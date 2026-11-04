import { model, models, Schema, type Model } from "mongoose";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewLinkDoc = {
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  uploadCount: number;
  createdAt: Date;
};

export type CustomerReviewDoc = {
  businessName: string;
  logoUrl: string;
  logoPublicId: string;
  text: string;
  rating: number;
  status: ReviewStatus;
  linkId: Schema.Types.ObjectId;
  createdAt: Date;
  approvedAt: Date | null;
};

const ReviewLinkSchema = new Schema<ReviewLinkDoc>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    uploadCount: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const CustomerReviewSchema = new Schema<CustomerReviewDoc>(
  {
    businessName: { type: String, required: true, maxlength: 120 },
    logoUrl: { type: String, required: true, maxlength: 500 },
    logoPublicId: { type: String, required: true, maxlength: 300 },
    text: { type: String, required: true, maxlength: 1200 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    linkId: { type: Schema.Types.ObjectId, ref: "ReviewLink", required: true, index: true },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
CustomerReviewSchema.index({ status: 1, approvedAt: -1 });

export const ReviewLink: Model<ReviewLinkDoc> =
  (models.ReviewLink as Model<ReviewLinkDoc>) || model<ReviewLinkDoc>("ReviewLink", ReviewLinkSchema);
export const CustomerReview: Model<CustomerReviewDoc> =
  (models.CustomerReview as Model<CustomerReviewDoc>) || model<CustomerReviewDoc>("CustomerReview", CustomerReviewSchema);
