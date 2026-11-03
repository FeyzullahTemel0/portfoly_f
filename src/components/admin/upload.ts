export type UploadFolder = "rovax/references" | "rovax/team" | "rovax/projects" | "rovax/seo" | "rovax/profile" | "rovax/ads";
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_SIDE = 2400;

// Büyük görselleri tarayıcıda küçültüp WebP'ye çevirir; böylece yükleme hızlı ve sınırın altında kalır.
async function prepare(file: File): Promise<File> {
  if (file.type === "image/gif" || (file.size < 900_000 && file.type !== "image/avif")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
    if (blob && blob.size < file.size) return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    // Dönüştürülemezse özgün dosya gönderilir.
  }
  return file;
}

// Dosya, oturum kontrolü yapan sunucu uç noktası üzerinden Cloudflare R2'ye yazılır; depo anahtarları tarayıcıya inmez.
export async function uploadImage(file: File, folder: UploadFolder): Promise<{ url: string; publicId: string }> {
  if (!file.type.startsWith("image/")) throw new Error("Yalnızca görsel dosyası yükleyebilirsiniz.");
  const ready = await prepare(file);
  if (ready.size > MAX_IMAGE_BYTES) throw new Error("Görsel 4 MB'tan küçük olmalı.");

  const body = new FormData();
  body.set("file", ready);
  body.set("folder", folder);
  const response = await fetch("/admin/upload", { method: "POST", body });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.url) throw new Error(result?.error ?? "Yükleme başarısız.");
  return { url: result.url, publicId: result.publicId };
}
