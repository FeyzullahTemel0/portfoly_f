"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { FiArrowLeft, FiArrowRight, FiTrash2 } from "react-icons/fi";
import { uploadImage, type UploadFolder } from "./upload";

export type GalleryImage = { url: string; publicId: string };

type Props = {
  images: GalleryImage[];
  folder: UploadFolder;
  ready: boolean;
  max?: number;
  onChange: (images: GalleryImage[]) => void;
  onMessage: (ok: boolean, text: string) => void;
};

const iconButton =
  "inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-colors hover:bg-black/80 disabled:opacity-30";

export function GalleryUploader({ images, folder, ready, max = 12, onChange, onMessage }: Props) {
  const [uploading, setUploading] = useState(false);

  async function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, max - images.length);
    event.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    const added: GalleryImage[] = [];
    try {
      for (const file of files) {
        const result = await uploadImage(file, folder);
        added.push({ url: result.url, publicId: result.publicId });
      }
      onMessage(true, `${added.length} görsel yüklendi. Kaydet'e basmayı unutmayın.`);
    } catch (error) {
      onMessage(false, error instanceof Error ? error.message : "Yükleme başarısız.");
    } finally {
      if (added.length > 0) onChange([...images, ...added]);
      setUploading(false);
    }
  }

  function move(index: number, to: number) {
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">Galeri görselleri ({images.length}/{max})</p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <li key={image.publicId || image.url} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-background">
            <Image src={image.url} alt={`Galeri ${index + 1}`} fill sizes="160px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 p-1.5">
              <div className="flex gap-1">
                <button type="button" aria-label="Sola taşı" disabled={index === 0} onClick={() => move(index, index - 1)} className={iconButton}>
                  <FiArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button type="button" aria-label="Sağa taşı" disabled={index === images.length - 1} onClick={() => move(index, index + 1)} className={iconButton}>
                  <FiArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <button type="button" aria-label="Sil" onClick={() => onChange(images.filter((_, i) => i !== index))} className={`${iconButton} hover:!bg-red-600`}>
                <FiTrash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
        {images.length < max && (
          <li>
            <label
              className={`flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted transition-colors hover:border-accent hover:text-accent ${
                !ready || uploading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {uploading ? "Yükleniyor..." : "+ Görsel ekle"}
              <input type="file" accept="image/*" multiple onChange={onFiles} className="sr-only" disabled={!ready || uploading} />
            </label>
          </li>
        )}
      </ul>
      {!ready && <p className="mt-2 text-xs text-amber-500">Görsel yükleme için .env.local dosyasına Cloudinary bilgileri eklenmeli.</p>}
    </div>
  );
}
