import { model, models, Schema, type Model } from "mongoose";
import type { LocalizedText } from "@/lib/locales";

export type TeamMemberDoc = {
  name: string;
  role: LocalizedText;
  bio: LocalizedText;
  photoUrl: string;
  photoPublicId: string;
  linkedin: string;
  instagram: string;
  x: string;
  order: number;
  visible: boolean;
};

const short = { tr: { type: String, default: "", maxlength: 200 }, en: { type: String, default: "", maxlength: 200 }, de: { type: String, default: "", maxlength: 200 }, fr: { type: String, default: "", maxlength: 200 }, ar: { type: String, default: "", maxlength: 200 } };
const long = { tr: { type: String, default: "", maxlength: 1000 }, en: { type: String, default: "", maxlength: 1000 }, de: { type: String, default: "", maxlength: 1000 }, fr: { type: String, default: "", maxlength: 1000 }, ar: { type: String, default: "", maxlength: 1000 } };

const TeamMemberSchema = new Schema<TeamMemberDoc>(
  {
    name: { type: String, required: true, maxlength: 120 },
    role: short,
    bio: long,
    photoUrl: { type: String, default: "", maxlength: 500 },
    photoPublicId: { type: String, default: "", maxlength: 300 },
    linkedin: { type: String, default: "", maxlength: 300 },
    instagram: { type: String, default: "", maxlength: 300 },
    x: { type: String, default: "", maxlength: 300 },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);
TeamMemberSchema.index({ order: 1, createdAt: 1 });

export const TeamMember: Model<TeamMemberDoc> =
  (models.TeamMember as Model<TeamMemberDoc>) || model<TeamMemberDoc>("TeamMember", TeamMemberSchema);
