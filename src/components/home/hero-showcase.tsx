"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { FiActivity, FiArrowUpRight } from "react-icons/fi";

export type ShowcaseSlide = { src: string; title: string; category: string; href: string };

type Props = { slides: ShowcaseSlide[]; chips: string[]; moreLabel: string };
type Rgb = [number, number, number];

function parseColor(value: string, fallback: Rgb): Rgb {
  const hex = value.trim().replace("#", "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return fallback;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

function readColors() {
  const style = getComputedStyle(document.documentElement);
  return { a: parseColor(style.getPropertyValue("--accent"), [46, 230, 255]), b: parseColor(style.getPropertyValue("--accent-2"), [59, 130, 255]) };
}

// Dönen, veri dalgası taşıyan üç boyutlu ağ küresi; imleçle yön değiştirir.
function NetworkSphere({ pointer }: { pointer: RefObject<{ x: number; y: number }> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = 240;
    const points = Array.from({ length: count }, (_, i) => {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = i * 2.399963;
      return { x: Math.cos(t) * r, y, z: Math.sin(t) * r };
    });
    const edges: [number, number][] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dz = points[i].z - points[j].z;
        if (dx * dx + dy * dy + dz * dz < 0.17) edges.push([i, j]);
      }
    }

    let colors = readColors();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = true;
    let frame = 0;
    let tx = 0;
    let ty = 0;
    const screen = points.map(() => ({ x: 0, y: 0, depth: 0, pulse: 0 }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const draw = (time: number) => {
      if (!reduce) frame = requestAnimationFrame(draw);
      if (!visible || width === 0) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const target = pointer.current ?? { x: 0, y: 0 };
      tx += (target.x - tx) * 0.05;
      ty += (target.y - ty) * 0.05;
      const angY = time * 0.00018 + tx * 0.6;
      const angX = 0.38 + ty * 0.35;
      const cosY = Math.cos(angY);
      const sinY = Math.sin(angY);
      const cosX = Math.cos(angX);
      const sinX = Math.sin(angX);
      const radius = Math.min(width, height) * 0.4;
      const wave = ((time * 0.00035) % 1.5) - 0.25;

      for (let i = 0; i < count; i++) {
        const p = points[i];
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const persp = 2.8 / (2.8 - z2);
        const s = screen[i];
        s.x = width / 2 + x1 * radius * persp;
        s.y = height / 2 + y2 * radius * persp;
        s.depth = (z2 + 1) / 2;
        s.pulse = Math.max(0, 1 - Math.abs(y2 * 0.5 + 0.5 - wave) * 5);
      }

      ctx.lineWidth = 1;
      for (const [i, j] of edges) {
        const a = screen[i];
        const b = screen[j];
        const depth = (a.depth + b.depth) / 2;
        const pulse = Math.max(a.pulse, b.pulse);
        const alpha = 0.04 + 0.3 * depth * depth + pulse * 0.5;
        const c = pulse > 0.35 ? colors.b : colors.a;
        ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${Math.min(alpha, 0.9)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (const s of screen) {
        const lit = s.pulse > 0.3;
        const c = lit ? colors.b : colors.a;
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.25 + s.depth * 0.65})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 0.7 + s.depth * 1.7 + s.pulse * 2.4, 0, Math.PI * 2);
        ctx.fill();
        if (lit) {
          ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${s.pulse * 0.18})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 7 + s.pulse * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    visibility.observe(canvas);
    const theme = new MutationObserver(() => {
      colors = readColors();
      if (reduce) draw(0);
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    if (reduce) draw(0);
    else frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      theme.disconnect();
    };
  }, [pointer]);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

const terminalLines = ["$ build --prod", "✔ compiled", "✔ tests passed", "✔ deployed"];

function TerminalCard({ reduce }: { reduce: boolean | null }) {
  const [step, setStep] = useState(reduce ? terminalLines.length : 0);

  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => setStep((value) => (value + 1) % (terminalLines.length + 3)), 1000);
    return () => clearInterval(timer);
  }, [reduce]);

  return (
    <div className="glass w-full overflow-hidden rounded-xl border border-border shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
      </div>
      <div className="min-h-[3.9rem] space-y-0.5 px-3 py-2 font-mono text-[9px] leading-4 sm:min-h-[4.6rem] sm:text-[11px] sm:leading-5">
        {terminalLines.map((line, index) => (
          <p
            key={line}
            className={`transition-all duration-300 ${index < step ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"} ${index === 0 ? "text-muted" : "text-accent"}`}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

const bars = [
  { heights: ["35%", "80%", "55%", "35%"], duration: 3.2 },
  { heights: ["60%", "40%", "90%", "60%"], duration: 4.1 },
  { heights: ["45%", "95%", "50%", "45%"], duration: 3.6 },
  { heights: ["75%", "50%", "70%", "75%"], duration: 4.6 },
  { heights: ["30%", "65%", "85%", "30%"], duration: 3.9 },
  { heights: ["55%", "85%", "40%", "55%"], duration: 4.3 },
];

function BarsCard({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="glass w-full rounded-xl border border-border p-2.5 shadow-2xl sm:p-3">
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent/15 text-accent sm:h-6 sm:w-6">
        <FiActivity className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
      </span>
      <div className="mt-2 flex h-10 items-end gap-1 sm:h-14">
        {bars.map((bar, index) => (
          <motion.span
            key={index}
            className="w-full rounded-sm bg-gradient-to-t from-accent-2 to-accent"
            initial={{ height: bar.heights[0] }}
            animate={reduce ? undefined : { height: bar.heights }}
            transition={{ duration: bar.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}

const orbitSlots: { ring: "outer" | "inner"; delay: string }[] = [
  { ring: "outer", delay: "0s" },
  { ring: "outer", delay: "-23s" },
  { ring: "inner", delay: "-6s" },
  { ring: "inner", delay: "-23s" },
];
const ringConfig = {
  outer: { radius: "42%", duration: "46s", reverse: false },
  inner: { radius: "29%", duration: "34s", reverse: true },
};

export function HeroShowcase({ slides, chips, moreLabel }: Props) {
  const reduce = useReducedMotion();
  const pointer = useRef({ x: 0, y: 0 });
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const farX = useTransform(sx, [-1, 1], [-8, 8]);
  const farY = useTransform(sy, [-1, 1], [-8, 8]);
  const nearX = useTransform(sx, [-1, 1], [-22, 22]);
  const nearY = useTransform(sy, [-1, 1], [-22, 22]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || reduce) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % slides.length), 4800);
    return () => clearInterval(timer);
  }, [slides.length, reduce]);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    pointer.current = { x, y };
    mx.set(x);
    my.set(y);
  }

  function onPointerLeave() {
    pointer.current = { x: 0, y: 0 };
    mx.set(0);
    my.set(0);
  }

  const slide = slides[index];

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto aspect-square w-full max-w-[560px] touch-pan-y"
    >
      <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_28%,transparent),transparent_68%)] blur-2xl" />

      <motion.div style={{ x: farX, y: farY }} className="absolute inset-0">
        <NetworkSphere pointer={pointer} />
      </motion.div>

      <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="hero-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="1" />
          </linearGradient>
        </defs>
        <g className="spin-cw" style={{ "--d": "240s", transformOrigin: "50px 50px" } as CSSProperties}>
          {Array.from({ length: 72 }, (_, i) => (
            <line key={i} x1="50" y1="0.6" x2="50" y2={i % 6 === 0 ? "3" : "1.8"} stroke="var(--accent)" strokeOpacity={i % 6 === 0 ? 0.6 : 0.28} strokeWidth="0.25" transform={`rotate(${i * 5} 50 50)`} />
          ))}
        </g>
        <g className="spin-ccw" style={{ "--d": "70s", transformOrigin: "50px 50px" } as CSSProperties}>
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" strokeOpacity="0.3" strokeWidth="0.25" strokeDasharray="7 3 1 3" />
        </g>
        <g className="spin-cw" style={{ "--d": "12s", transformOrigin: "50px 50px" } as CSSProperties}>
          <circle cx="50" cy="50" r="43" fill="none" stroke="url(#hero-arc)" strokeWidth="0.7" strokeLinecap="round" strokeDasharray="62 208" />
        </g>
        <g className="spin-ccw" style={{ "--d": "20s", transformOrigin: "50px 50px" } as CSSProperties}>
          <circle cx="50" cy="50" r="33" fill="none" stroke="var(--accent-2)" strokeOpacity="0.55" strokeWidth="0.35" strokeDasharray="1.2 4.2" strokeLinecap="round" />
        </g>
        <g className="spin-cw" style={{ "--d": "30s", transformOrigin: "50px 50px" } as CSSProperties}>
          <circle cx="50" cy="50" r="26" fill="none" stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="0.3" strokeDasharray="24 10 4 10" />
          <circle cx="50" cy="24" r="1.1" fill="var(--accent)" />
        </g>
      </svg>

      {chips.slice(0, orbitSlots.length).map((chip, position) => {
        const slot = orbitSlots[position];
        const ring = ringConfig[slot.ring];
        const direction = ring.reverse ? "reverse" : "normal";
        return (
          <div key={chip} aria-hidden="true" className="orbit pointer-events-none" style={{ "--d": ring.duration, "--delay": slot.delay, animationDirection: direction } as CSSProperties}>
            <div className="orbit-item" style={{ "--r": ring.radius } as CSSProperties}>
              <span style={{ animationDirection: direction }}>
                <span className="glass block whitespace-nowrap rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold shadow-lg sm:px-3 sm:py-1.5 sm:text-xs">{chip}</span>
              </span>
            </div>
          </div>
        );
      })}

      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[12%] w-[12%] -translate-x-1/2 -translate-y-1/2">
        <span className="animate-pulse-ring absolute inset-0 rounded-full border border-accent/60" />
        <span style={{ animationDelay: "1s" }} className="animate-pulse-ring absolute inset-0 rounded-full border border-accent/40" />
        <motion.span
          animate={reduce ? undefined : { opacity: [0.7, 1, 0.7], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-[30%] rounded-full bg-accent shadow-[0_0_40px_10px_var(--accent)]"
        />
      </div>

      <motion.div style={{ x: nearX, y: nearY }} className="pointer-events-none absolute inset-0 hidden min-[420px]:block" aria-hidden="true">
        <div className="animate-float absolute left-[-2%] top-[6%] w-[36%]">
          <TerminalCard reduce={reduce} />
        </div>
        <div className="animate-float absolute right-[-2%] top-[18%] w-[24%]" style={{ animationDelay: "-2.5s" }}>
          <BarsCard reduce={reduce} />
        </div>
        <div className="animate-float glass absolute bottom-[12%] left-[2%] flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[10px] font-semibold shadow-xl sm:text-xs" style={{ animationDelay: "-4s" }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#28c840]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#28c840]" />
          </span>
          online
        </div>
      </motion.div>

      {slide && (
        <motion.div style={{ x: nearX, y: nearY }} className="absolute bottom-[2%] right-[-2%] z-10 w-[58%]">
          <Link href={slide.href} className="glass relative block overflow-hidden rounded-xl border border-border shadow-2xl">
            <div className="relative aspect-[16/10] bg-background">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={slide.src}
                  initial={reduce ? false : { opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image src={slide.src} alt={slide.title} fill sizes="(min-width: 1024px) 330px, 60vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-2.5 text-white sm:p-3">
                <div className="min-w-0">
                  {slide.category && <span className="block truncate text-[9px] font-semibold uppercase tracking-wide text-accent sm:text-[10px]">{slide.category}</span>}
                  <p className="truncate text-xs font-bold sm:text-sm">{slide.title}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-white/15 px-2 py-1 text-[10px] font-semibold backdrop-blur">
                  {moreLabel}
                  <FiArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </div>
            </div>
          </Link>
          {slides.length > 1 && (
            <div className="mt-2 flex justify-center gap-1.5" role="tablist">
              {slides.map((item, position) => (
                <button
                  key={item.src}
                  type="button"
                  role="tab"
                  aria-selected={position === index}
                  aria-label={item.title}
                  onClick={() => setIndex(position)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${position === index ? "w-6 bg-accent" : "w-2.5 bg-foreground/30 hover:bg-foreground/50"}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
