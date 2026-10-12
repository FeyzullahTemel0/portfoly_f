import { model, models, Schema, type Model } from "mongoose";

export type ContentDoc = { scope: string; key: string; data: unknown };

const ContentSchema = new Schema<ContentDoc>(
  {
    scope: { type: String, required: true },
    key: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);
ContentSchema.index({ scope: 1, key: 1 }, { unique: true });

export const Content: Model<ContentDoc> =
  (models.Content as Model<ContentDoc>) || model<ContentDoc>("Content", ContentSchema);
