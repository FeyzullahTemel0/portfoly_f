import { model, models, Schema, type Model } from "mongoose";

export type MessageDoc = {
  name: string;
  email: string;
  kind: string;
  message: string;
  read: boolean;
  lang: string;
  ipHash: string;
  createdAt: Date;
};

const MessageSchema = new Schema<MessageDoc>(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    kind: { type: String, default: "", maxlength: 60 },
    message: { type: String, required: true, maxlength: 4000 },
    read: { type: Boolean, default: false },
    lang: { type: String, default: "tr" },
    ipHash: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
MessageSchema.index({ createdAt: -1 });

export const Message: Model<MessageDoc> =
  (models.Message as Model<MessageDoc>) || model<MessageDoc>("Message", MessageSchema);
