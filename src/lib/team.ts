import "server-only";
import { cache } from "react";
import { connectDb } from "@/lib/db";
import type { Locale } from "@/lib/locales";
import { TeamMember } from "@/models/team-member";

export type PublicTeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  linkedin: string;
  instagram: string;
  x: string;
};

// Sadece görünür ekip üyeleri, seçilen dilde; veritabanına ulaşılamazsa boş liste döner.
export const getTeam = cache(async (lang: Locale): Promise<PublicTeamMember[]> => {
  try {
    await connectDb();
    const docs = await TeamMember.find({ visible: true }).sort({ order: 1, createdAt: 1 }).lean();
    return docs.map((doc) => ({
      id: String(doc._id),
      name: doc.name,
      role: doc.role[lang] || doc.role.en || doc.role.tr,
      bio: doc.bio[lang] || doc.bio.en || doc.bio.tr,
      photoUrl: doc.photoUrl,
      linkedin: doc.linkedin,
      instagram: doc.instagram,
      x: doc.x,
    }));
  } catch (error) {
    console.error("Ekip yüklenemedi:", error);
    return [];
  }
});
