"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { uploadImage, type UploadFolder } from "./upload";

type Props = {
  url: string;
  folder: UploadFolder;
  ready: boolean;
  label: string;
  rounded?: boolean;
  successMessage?: string;
  removeMessage?: string;
  onChange: (url: string, publicId: string) => void | Promise<void>;
  onMessage: (ok: boolean, text: string) => void;
};

export function ImageUploader({ url, folder, ready, label, rounded, successMessage, removeMessage, onChange, onMessage }: Props) {
  const [uploading, setUploading] = useState(false);

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, folder);
      await onChange(result.url, result.publicId);
      onMessage(true, successMessage ?? "Görsel yüklendi. Kaydet'e basmayı unutmayın.");
    } catch (error) {
      onMessage(false, error instanceof Error ? error.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  }

  async function remove() {
    setUploading(true);
    try {
      await onChange("", "");
      onMessage(true, removeMessage ?? "Görsel kaldırıldı. Kaydet'e basmayı unutmayın.");
    } catch (error) {
      onMessage(false, error instanceof Error ? error.message : "Görsel kaldırılamadı.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`flex h-24 items-center justify-center overflow-hidden border border-dashed border-border bg-background ${
            rounded ? "w-24 rounded-full" : "w-40 rounded-lg"
          }`}
        >
          {url ? (
            <Image
              src={url}
              alt={`${label} önizleme`}
              width={160}
              height={160}
              className={rounded ? "h-24 w-24 object-cover" : "h-20 w-auto max-w-full object-contain"}
            />
          ) : (
            <span className="text-xs text-muted">Görsel yok</span>
          )}
        </div>
        <div className="space-y-2">
          <label
            className={`inline-flex h-10 cursor-pointer items-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent ${
              !ready || uploading ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {uploading ? "Yükleniyor..." : url ? "Değiştir" : "Yükle"}
            <input type="file" accept="image/*" onChange={onFile} className="sr-only" disabled={!ready || uploading} />
          </label>
          {url && (
            <button type="button" onClick={() => void remove()} disabled={uploading} className="block text-sm text-red-500 hover:underline disabled:opacity-60">
              Kaldır
            </button>
          )}
          {!ready && (
            <p className="max-w-xs text-xs text-amber-500">
              Görsel yükleme için .env.local dosyasına Cloudinary bilgileri eklenmeli.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
