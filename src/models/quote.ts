import { model, models, Schema, type Model } from "mongoose";

export const quoteStatuses = ["new", "contacted", "quoted", "won", "lost"] as const;
export type QuoteStatus = (typeof quoteStatuses)[number];

export type QuoteDoc = {
  name: string;
  email: string;
  phone: string;
  services: string[];
  size: string;
  message: string;
  status: QuoteStatus;
  note: string;
  lang: string;
  ipHash: string;
  createdAt: Date;
};

const QuoteSchema = new Schema<QuoteDoc>(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    phone: { type: String, default: "", maxlength: 40 },
    services: { type: [String], default: [] },
    size: { type: String, default: "", maxlength: 60 },
    message: { type: String, default: "", maxlength: 4000 },
    status: { type: String, enum: quoteStatuses, default: "new" },
    note: { type: String, default: "", maxlength: 4000 },
    lang: { type: String, default: "tr" },
    ipHash: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
QuoteSchema.index({ createdAt: -1 });

export const Quote: Model<QuoteDoc> =
  (models.Quote as Model<QuoteDoc>) || model<QuoteDoc>("Quote", QuoteSchema);
