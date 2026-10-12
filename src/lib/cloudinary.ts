import "server-only";
import { createHash } from "node:crypto";

export const UPLOAD_FOLDERS = ["temeloji/references", "temeloji/team", "temeloji/projects", "temeloji/seo", "temeloji/profile"] as const;

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return cloudName && apiKey && apiSecret ? { cloudName, apiKey, apiSecret } : null;
}

export function isCloudinaryConfigured() {
  return config() !== null;
}

// Cloudinary imzası: parametreler alfabetik sıralanır, sonuna API secret eklenip SHA-1 alınır.
function sign(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(payload + apiSecret).digest("hex");
}

export function createUploadSignature(folder: string) {
  const cfg = config();
  if (!cfg || !(UPLOAD_FOLDERS as readonly string[]).includes(folder)) return null;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = sign({ folder, timestamp }, cfg.apiSecret);
  return { cloudName: cfg.cloudName, apiKey: cfg.apiKey, timestamp, folder, signature };
}

export function isOwnImageUrl(url: string) {
  const cfg = config();
  return !!cfg && url.startsWith(`https://res.cloudinary.com/${cfg.cloudName}/`);
}

export async function deleteImage(publicId: string) {
  const cfg = config();
  if (!cfg || !publicId) return;
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: cfg.apiKey,
    signature: sign({ public_id: publicId, timestamp }, cfg.apiSecret),
  });
  try {
    await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/destroy`, { method: "POST", body });
  } catch (error) {
    console.error("Görsel Cloudinary'den silinemedi:", error);
  }
}
