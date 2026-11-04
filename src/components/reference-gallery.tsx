"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import { FiChevronLeft, FiChevronRight, FiMaximize, FiMinus, FiPlus, FiX, FiZoomIn } from "react-icons/fi";
import type { ReferenceUi } from "@/lib/reference-ui";

export type GalleryItem = { url: string; caption: string; description: string };

type View = { s: number; x: number; y: number };
const MIN = 1;
const MAX = 6;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Tam ekran görsel büyüteci: tekerlek, çift dokunuş, iki parmakla yakınlaştırma ve sürükleyerek gezme.
function Lightbox({ items, index, labels, name, onIndex, onClose }: { items: GalleryItem[]; index: number; labels: ReferenceUi["lightbox"]; name: string; onIndex: (next: number) => void; onClose: () => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ distance: number; s: number } | null>(null);
  const lastTap = useRef(0);
  const [raw, setRaw] = useState<View & { i: number }>({ s: 1, x: 0, y: 0, i: index });
  const view: View = raw.i === index ? raw : { s: 1, x: 0, y: 0 };
  // Görsel değiştiğinde yakınlaştırma kendiliğinden sıfırlanır.
  const setView = useCallback(
    (next: View | ((current: View) => View)) =>
      setRaw((previous) => {
        const base: View = previous.i === index ? previous : { s: 1, x: 0, y: 0 };
        return { ...(typeof next === "function" ? next(base) : next), i: index };
      }),
    [index],
  );
  const [dragging, setDragging] = useState(false);
  const item = items[index];

  const limits = useCallback((s: number) => {
    const stage = stageRef.current;
    const image = imageRef.current;
    if (!stage || !image) return { x: 0, y: 0 };
    return {
      x: Math.max(0, (image.offsetWidth * s - stage.clientWidth) / 2),
      y: Math.max(0, (image.offsetHeight * s - stage.clientHeight) / 2),
    };
  }, []);

  const apply = useCallback(
    (s: number, x: number, y: number) => {
      const scale = clamp(s, MIN, MAX);
      const max = limits(scale);
      setView({ s: scale, x: scale === 1 ? 0 : clamp(x, -max.x, max.x), y: scale === 1 ? 0 : clamp(y, -max.y, max.y) });
    },
    [limits, setView],
  );

  // Verilen noktayı (sahne merkezine göre) sabit tutarak yakınlaştırır.
  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      setView((current) => {
        const scale = clamp(current.s * factor, MIN, MAX);
        const ratio = scale / current.s;
        const max = limits(scale);
        return {
          s: scale,
          x: scale === 1 ? 0 : clamp(px - (px - current.x) * ratio, -max.x, max.x),
          y: scale === 1 ? 0 : clamp(py - (py - current.y) * ratio, -max.y, max.y),
        };
      });
    },
    [limits, setView],
  );

  const go = useCallback(
    (direction: number) => {
      onIndex((index + direction + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "+" || event.key === "=") zoomAt(1.4, 0, 0);
      else if (event.key === "-") zoomAt(1 / 1.4, 0, 0);
      else if (event.key === "0") setView({ s: 1, x: 0, y: 0 });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose, setView, zoomAt]);

  function center(event: { clientX: number; clientY: number }) {
    const rect = stageRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left - rect.width / 2, y: event.clientY - rect.top - rect.height / 2 };
  }

  function onWheel(event: ReactWheelEvent) {
    const point = center(event);
    zoomAt(event.deltaY < 0 ? 1.18 : 1 / 1.18, point.x, point.y);
  }

  function onPointerDown(event: ReactPointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    setDragging(true);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), s: view.s };
    }
    const now = Date.now();
    if (pointers.current.size === 1 && now - lastTap.current < 300) {
      const point = center(event);
      if (view.s > 1) setView({ s: 1, x: 0, y: 0 });
      else zoomAt(2.5, point.x, point.y);
    }
    lastTap.current = now;
  }

  function onPointerMove(event: ReactPointerEvent) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && gesture.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = stageRef.current!.getBoundingClientRect();
      const mid = { x: (a.x + b.x) / 2 - rect.left - rect.width / 2, y: (a.y + b.y) / 2 - rect.top - rect.height / 2 };
      const target = clamp(gesture.current.s * (distance / gesture.current.distance), MIN, MAX);
      zoomAt(target / view.s, mid.x, mid.y);
    } else if (pointers.current.size === 1 && view.s > 1) {
      apply(view.s, view.x + event.clientX - previous.x, view.y + event.clientY - previous.y);
    }
  }

  function onPointerUp(event: ReactPointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
    if (pointers.current.size === 0) setDragging(false);
  }

  const button = "flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption || name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.caption || name}</p>
          <p className="text-xs text-white/60">
            {index + 1} / {items.length}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className={button} onClick={() => zoomAt(1 / 1.4, 0, 0)} aria-label={labels.zoomOut} disabled={view.s <= MIN}>
            <FiMinus className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="hidden w-12 text-center text-xs font-semibold tabular-nums sm:block" aria-live="polite">
            {Math.round(view.s * 100)}%
          </span>
          <button type="button" className={button} onClick={() => zoomAt(1.4, 0, 0)} aria-label={labels.zoomIn} disabled={view.s >= MAX}>
            <FiPlus className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" className={button} onClick={() => setView({ s: 1, x: 0, y: 0 })} aria-label={labels.reset}>
            <FiMaximize className="h-4 w-4" aria-hidden="true" />
          </button>
          <button ref={closeRef} type="button" className={`${button} ml-1`} onClick={onClose} aria-label={labels.close}>
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={`relative min-h-0 flex-1 touch-none select-none overflow-hidden ${view.s > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Tam çözünürlüklü görsel, kullanıcı yakınlaştırır. */}
        <img
          ref={imageRef}
          key={item.url}
          src={item.url}
          alt={item.caption || name}
          draggable={false}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`, transition: dragging ? "none" : "transform 0.18s ease-out" }}
          className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
        />
        {items.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} onPointerDown={(event) => event.stopPropagation()} aria-label={labels.previous} className={`${button} absolute left-3 top-1/2 -translate-y-1/2 sm:left-5`}>
              <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => go(1)} onPointerDown={(event) => event.stopPropagation()} aria-label={labels.next} className={`${button} absolute right-3 top-1/2 -translate-y-1/2 sm:right-5`}>
              <FiChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <div className="px-4 pb-4 pt-3 text-center sm:px-6">
        {item.description && <p className="mx-auto mb-3 line-clamp-2 max-w-3xl text-xs leading-5 text-white/70 sm:text-sm">{item.description}</p>}
        {items.length > 1 && (
          <div className="mx-auto flex max-w-full justify-center gap-2 overflow-x-auto pb-1">
            {items.map((thumb, position) => (
              <button
                key={thumb.url}
                type="button"
                onClick={() => onIndex(position)}
                aria-label={thumb.caption || `${name} ${position + 1}`}
                aria-current={position === index}
                className={`relative h-12 w-20 shrink-0 overflow-hidden rounded-md border-2 transition ${position === index ? "border-accent opacity-100" : "border-transparent opacity-50 hover:opacity-90"}`}
              >
                <Image src={thumb.url} alt="" fill sizes="80px" className="object-cover object-top" />
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 hidden text-[11px] text-white/40 sm:block">{labels.hint}</p>
      </div>
    </motion.div>
  );
}

function Shot({ item, index, name, host, hint, onOpen }: { item: GalleryItem; index: number; name: string; host: string; hint: string; onOpen: () => void }) {
  const [portrait, setPortrait] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${item.caption || name} — ${hint}`}
      className={`group relative block w-full cursor-zoom-in text-left outline-none focus-visible:ring-2 focus-visible:ring-accent ${portrait ? "mx-auto max-w-[17rem] rounded-[2rem] border-[6px] border-foreground/80 bg-background p-0 shadow-2xl" : "overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/10"} transition-transform duration-500 hover:-translate-y-1`}
    >
      {!portrait && (
        <span className="flex items-center gap-3 border-b border-border bg-background/70 px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="min-w-0 flex-1 truncate rounded-md bg-foreground/5 px-3 py-1 text-center text-[11px] text-muted">{host}</span>
        </span>
      )}
      <span className={`relative block overflow-hidden ${portrait ? "rounded-[1.5rem]" : ""}`}>
        <Image
          src={item.url}
          alt={item.caption || `${name} ${index + 1}`}
          width={1280}
          height={800}
          sizes="(min-width: 1024px) 720px, 100vw"
          onLoad={(event) => setPortrait(event.currentTarget.naturalHeight / event.currentTarget.naturalWidth > 1.2)}
          className="block h-auto w-full transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/45 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:opacity-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
            <FiZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
            {hint}
          </span>
        </span>
      </span>
    </button>
  );
}

export function ReferenceGallery({ items, name, host, ui }: { items: GalleryItem[]; name: string; host: string; ui: ReferenceUi }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <div className="space-y-8 sm:space-y-24">
        {items.map((item, index) => (
          <motion.article
            key={item.url}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="grid items-center gap-3 sm:gap-6 lg:grid-cols-12 lg:gap-12"
          >
            <div className={`min-w-0 lg:col-span-7 ${index % 2 ? "lg:order-2" : ""}`}>
              <Shot item={item} index={index} name={name} host={host} hint={ui.tapToZoom} onOpen={() => setOpen(index)} />
            </div>
            <div className={`min-w-0 lg:col-span-5 ${index % 2 ? "lg:order-1" : ""}`}>
              <span className="bg-gradient-to-br from-accent to-accent-2 bg-clip-text text-4xl font-black leading-none text-transparent sm:text-7xl" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-base font-bold tracking-normal sm:mt-3 sm:text-3xl">{item.caption || name}</h3>
              {item.description && <p className="mt-1.5 text-xs leading-5 text-muted sm:mt-3 sm:text-base sm:leading-8">{item.description}</p>}
            </div>
          </motion.article>
        ))}
      </div>
      <AnimatePresence>
        {open !== null && <Lightbox key="lightbox" items={items} index={open} labels={ui.lightbox} name={name} onIndex={setOpen} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
