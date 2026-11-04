import "server-only";
import { randomBytes } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const UPLOAD_FOLDERS = ["rovax/references", "rovax/team", "rovax/projects", "rovax/seo", "rovax/profile", "rovax/ads", "rovax/reviews"] as const;
export const MEDIA_PREFIX = "/media/";
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const KEY_PATTERN = /^rovax\/(references|team|projects|seo|profile|ads|reviews)\/[A-Za-z0-9_-]{8,64}\.(jpg|png|webp|gif|avif)$/;

function config() {
  const endpoint = process.env.R2_ENDPOINT?.replace(/\/+$/, "");
  const bucket = process.env.R2_BUCKET;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  return endpoint && bucket && accessKeyId && secretAccessKey ? { endpoint, bucket, accessKeyId, secretAccessKey } : null;
}

let client: S3Client | null = null;
function getClient() {
  const cfg = config();
  if (!cfg) return null;
  client ??= new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
  return { s3: client, bucket: cfg.bucket };
}

export function isStorageConfigured() {
  return config() !== null;
}

export function isValidKey(key: string) {
  return KEY_PATTERN.test(key);
}

export function keyFromUrl(url: string) {
  return url.startsWith(MEDIA_PREFIX) ? url.slice(MEDIA_PREFIX.length) : "";
}

// Yalnızca kendi depomuzdaki görsel adreslerine izin verilir.
export function isOwnImageUrl(url: string) {
  return isValidKey(keyFromUrl(url));
}

export async function putImage(folder: string, body: Buffer, contentType: string) {
  const extension = EXTENSIONS[contentType];
  const target = getClient();
  if (!target || !extension || !(UPLOAD_FOLDERS as readonly string[]).includes(folder)) return null;
  const key = `${folder}/${randomBytes(12).toString("base64url")}.${extension}`;
  await target.s3.send(new PutObjectCommand({ Bucket: target.bucket, Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
  return { url: `${MEDIA_PREFIX}${key}`, publicId: key };
}

export async function getImage(key: string) {
  const target = getClient();
  if (!target || !isValidKey(key)) return null;
  try {
    const result = await target.s3.send(new GetObjectCommand({ Bucket: target.bucket, Key: key }));
    if (!result.Body) return null;
    return { stream: result.Body.transformToWebStream(), contentType: result.ContentType ?? "application/octet-stream", length: result.ContentLength };
  } catch {
    return null;
  }
}

export async function deleteImage(key: string) {
  const target = getClient();
  if (!target || !isValidKey(key)) return;
  try {
    await target.s3.send(new DeleteObjectCommand({ Bucket: target.bucket, Key: key }));
  } catch (error) {
    console.error("Görsel depodan silinemedi:", error);
  }
}

export const allowedImageTypes = Object.keys(EXTENSIONS);
