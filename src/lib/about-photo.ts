import "server-only";
import { connectDb } from "@/lib/db";
import { Content } from "@/models/content";

export type AboutPhoto = { url: string; publicId: string };

export async function getAboutPhoto(): Promise<AboutPhoto> {
  try {
    await connectDb();
    const doc = await Content.findOne({ scope: "settings", key: "aboutPhoto" }).lean();
    const data = doc?.data;
    if (typeof data !== "object" || data === null || Array.isArray(data)) return { url: "", publicId: "" };
    const value = data as Record<string, unknown>;
    const url = typeof value.url === "string" && value.url.startsWith("https://res.cloudinary.com/") ? value.url : "";
    return {
      url,
      publicId: typeof value.publicId === "string" ? value.publicId : "",
    };
  } catch {
    return { url: "", publicId: "" };
  }
}