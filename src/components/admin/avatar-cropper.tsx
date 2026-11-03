"use client";

import { useEffect, useRef, useState } from "react";

type Props = { file: File; onCancel: () => void; onDone: (cropped: File) => void };

const STAGE = 288;
const OUTPUT = 512;

// Profil fotoğrafı için sürükle-yakınlaştır kare kırpma penceresi.
export function AvatarCropper({ file, onCancel, onDone }: Props) {
  const [src, setSrc] = useState("");
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setSrc(String(reader.result));
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);

  const base = size ? Math.max(STAGE / size.w, STAGE / size.h) : 1;
  const scale = base * zoom;
  const clamp = (x: number, y: number, s = scale) => {
    if (!size) return { x, y };
    const maxX = Math.max(0, (size.w * s - STAGE) / 2);
    const maxY = Math.max(0, (size.h * s - STAGE) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
  };

  function onZoom(value: number) {
    setZoom(value);
    setOffset((current) => clamp(current.x, current.y, base * value));
  }

  function confirm() {
    const image = imageRef.current;
    if (!image || !size) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ratio = OUTPUT / STAGE;
    const width = size.w * scale * ratio;
    const height = size.h * scale * ratio;
    ctx.drawImage(image, OUTPUT / 2 + offset.x * ratio - width / 2, OUTPUT / 2 + offset.y * ratio - height / 2, width, height);
    canvas.toBlob(
      (blob) => {
        if (blob) onDone(new File([blob], "profil.webp", { type: "image/webp" }));
      },
      "image/webp",
      0.92,
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Fotoğrafı kırp" className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <h2 className="font-semibold">Fotoğrafı kırp</h2>
        <p className="mt-1 text-xs text-muted">Sürükleyerek konumlandırın, kaydırıcıyla yakınlaştırın.</p>
        <div
          className="relative mx-auto mt-4 touch-none select-none overflow-hidden rounded-2xl bg-black"
          style={{ width: STAGE, height: STAGE }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            setOffset(clamp(drag.current.ox + event.clientX - drag.current.x, drag.current.oy + event.clientY - drag.current.y));
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        >
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imageRef}
              src={src}
              alt=""
              draggable={false}
              onLoad={(event) => setSize({ w: event.currentTarget.naturalWidth, h: event.currentTarget.naturalHeight })}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
              style={size ? { width: size.w * scale, height: size.h * scale, transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))` } : { opacity: 0 }}
            />
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_999px_rgba(0,0,0,0.55)] ring-2 ring-white/70" />
        </div>
        <label className="mt-4 block text-xs font-semibold text-muted">
          Yakınlaştırma
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(event) => onZoom(Number(event.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="h-10 rounded-lg border border-border px-4 text-sm hover:border-accent">Vazgeç</button>
          <button type="button" onClick={confirm} disabled={!size} className="button-primary h-10 rounded-lg px-5 text-sm font-semibold disabled:opacity-50">Kırp ve yükle</button>
        </div>
      </div>
    </div>
  );
}
