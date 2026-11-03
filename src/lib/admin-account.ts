import "server-only";
import { randomBytes, scryptSync } from "node:crypto";
import { connectDb } from "@/lib/db";
import { Content } from "@/models/content";

export type AdminProfile = { displayName: string; bio: string; photoUrl: string; photoPublicId: string };
export const emptyProfile: AdminProfile = { displayName: "", bio: "", photoUrl: "", photoPublicId: "" };

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  return `scrypt:${salt.toString("hex")}:${scryptSync(password, salt, 64).toString("hex")}`;
}

// Yönetici bilgileri önce veritabanından, yoksa ortam değişkenlerinden okunur.
export async function getCredentials(): Promise<{ email: string; hash: string } | null> {
  try {
    await connectDb();
    const doc = await Content.findOne({ scope: "settings", key: "adminAuth" }).lean();
    const data = doc?.data as { email?: unknown; hash?: unknown } | undefined;
    if (typeof data?.email === "string" && typeof data.hash === "string" && data.email && data.hash) {
      return { email: data.email.toLowerCase(), hash: data.hash };
    }
  } catch (error) {
    console.error("Yönetici hesabı okunamadı:", error);
  }
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const hash = process.env.ADMIN_PASSWORD_HASH;
  return email && hash ? { email, hash } : null;
}

export async function getAdminProfile(): Promise<AdminProfile> {
  try {
    await connectDb();
    const doc = await Content.findOne({ scope: "settings", key: "adminProfile" }).lean();
    const data = (doc?.data ?? {}) as Partial<AdminProfile>;
    return {
      displayName: typeof data.displayName === "string" ? data.displayName : "",
      bio: typeof data.bio === "string" ? data.bio : "",
      photoUrl: typeof data.photoUrl === "string" ? data.photoUrl : "",
      photoPublicId: typeof data.photoPublicId === "string" ? data.photoPublicId : "",
    };
  } catch {
    return emptyProfile;
  }
}
