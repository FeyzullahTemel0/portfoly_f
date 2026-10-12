import { getUploadSignature } from "@/app/admin/(panel)/actions";

export type UploadFolder = "temeloji/references" | "temeloji/team" | "temeloji/projects" | "temeloji/seo" | "temeloji/profile";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Dosyayı sunucudan alınan imzayla doğrudan Cloudinary'ye yükler; API secret tarayıcıya inmez.
export async function uploadImage(file: File, folder: UploadFolder): Promise<{ url: string; publicId: string }> {
  if (!file.type.startsWith("image/")) throw new Error("Yalnızca görsel dosyası yükleyebilirsiniz.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Görsel 5 MB'tan küçük olmalı.");

  const sign = await getUploadSignature(folder);
  if (!sign) throw new Error("Cloudinary ayarlanmamış.");

  const body = new FormData();
  body.set("file", file);
  body.set("api_key", sign.apiKey);
  body.set("timestamp", String(sign.timestamp));
  body.set("folder", sign.folder);
  body.set("signature", sign.signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, { method: "POST", body });
  const result = await response.json();
  if (!response.ok || !result.secure_url) throw new Error(result?.error?.message ?? "Yükleme başarısız.");
  return { url: result.secure_url, publicId: result.public_id };
}
