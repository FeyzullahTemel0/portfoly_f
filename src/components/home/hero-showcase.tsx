"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { Globe } from "@/components/home/globe";

const serviceLabels = [
  "Kişisel ve Blog Siteleri",
  "Shopier Entegreli E-Ticaret Siteleri",
  "Randevu Sistemleri",
  "Masaüstü Yazılımları",
  "Kitap & Dergi Paylaşım Siteleri",
  "İlan Siteleri",
  "Masaüstü Otomasyonlar",
  "Stok Takip Programları (Masaüstü ve Web)",
];

export function HeroShowcase() {
  const reduce = useReducedMotion();
  const pointer = useRef({ x: 0, y: 0 });
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const farX = useTransform(sx, [-1, 1], [-8, 8]);
  const farY = useTransform(sy, [-1, 1], [-8, 8]);
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
        <Globe pointer={pointer} />
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

      {serviceLabels.map((label, position) => {
        const side = position % 2 === 0 ? "left-0" : "right-0";
        const top = `${16 + Math.floor(position / 2) * 22}%`;
        return (
          <div
            key={label}
            aria-hidden="true"
            className={`service-orbit-label animate-float pointer-events-none absolute z-10 hidden max-w-[36%] items-center gap-1.5 rounded-full border border-accent/25 bg-surface/85 px-2 py-1.5 text-[8px] font-semibold leading-tight shadow-lg backdrop-blur-md min-[360px]:flex sm:max-w-[38%] sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[10px] ${side}`}
            style={{ top, animationDelay: `${position * -0.7}s` }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
            <span>{label}</span>
          </div>
        );
      })}

    </motion.div>
  );
}
