"use client";

import { useEffect, useRef, type RefObject } from "react";
import { buildLandDots, cities, hub, type City } from "./world-data";

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

const rgba = (c: Rgb, alpha: number) => `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
const unit = (lat: number, lon: number): [number, number, number] => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];

// Merkez şehirden (Gaziantep) dünya şehirlerine uzanan, yükselen büyük daire yayları.
function buildArc(from: City, to: City, steps = 56) {
  const a = unit(from.lat, from.lon);
  const b = unit(to.lat, to.lon);
  const omega = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  const points: [number, number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s1 = Math.sin((1 - t) * omega) / Math.sin(omega);
    const s2 = Math.sin(t * omega) / Math.sin(omega);
    const p = [a[0] * s1 + b[0] * s2, a[1] * s1 + b[1] * s2, a[2] * s1 + b[2] * s2];
    const length = Math.hypot(p[0], p[1], p[2]) || 1;
    const lift = 1 + Math.sin(Math.PI * t) * (0.05 + omega * 0.11);
    points.push([(p[0] / length) * lift, (p[1] / length) * lift, (p[2] / length) * lift]);
  }
  return points;
}

// Kıtaları nokta dokusuyla gösteren, Gaziantep merkezli bağlantı yayları taşıyan dönen dünya.
export function Globe({ pointer }: { pointer: RefObject<{ x: number; y: number }> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const land = buildLandDots(2.1);
    const north = land.filter((dot) => dot.lat >= 0).map((dot) => unit(dot.lat, dot.lon));
    const south = land.filter((dot) => dot.lat < 0).map((dot) => unit(dot.lat, dot.lon));
    const arcs = cities.map((city, index) => ({ city, points: buildArc(hub, city), phase: index * 0.37 }));
    const hubVector = unit(hub.lat, hub.lon);
    const graticule: [number, number, number][][] = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      const ring: [number, number, number][] = [];
      for (let lon = 0; lon <= 360; lon += 6) ring.push(unit((lat * Math.PI) / 180, (lon * Math.PI) / 180));
      graticule.push(ring);
    }
    for (let lon = 0; lon < 360; lon += 30) {
      const meridian: [number, number, number][] = [];
      for (let lat = -84; lat <= 84; lat += 6) meridian.push(unit((lat * Math.PI) / 180, (lon * Math.PI) / 180));
      graticule.push(meridian);
    }

    let colors = readColors();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = true;
    let frame = 0;
    let tx = 0;
    let ty = 0;

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
      const angY = -hub.lon + time * 0.00009 + tx * 0.45;
      const angX = 0.5 + ty * 0.25;
      const cosY = Math.cos(angY);
      const sinY = Math.sin(angY);
      const cosX = Math.cos(angX);
      const sinX = Math.sin(angX);
      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.38;
      const { a, b } = colors;

      const project = (v: [number, number, number]) => {
        const x1 = v[0] * cosY + v[2] * sinY;
        const z1 = -v[0] * sinY + v[2] * cosY;
        const y2 = v[1] * cosX - z1 * sinX;
        const z2 = v[1] * sinX + z1 * cosX;
        return { x: x1, y: y2, z: z2 };
      };

      // Atmosfer ışıması ve gövde.
      const glow = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.32);
      glow.addColorStop(0, rgba(a, 0.4));
      glow.addColorStop(0.35, rgba(b, 0.14));
      glow.addColorStop(1, rgba(b, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.32, 0, Math.PI * 2);
      ctx.fill();

      const body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R);
      body.addColorStop(0, rgba(a, 0.13));
      body.addColorStop(0.55, rgba(b, 0.04));
      body.addColorStop(1, rgba(b, 0.12));
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Enlem ve boylam çizgileri.
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = rgba(a, 0.14);
      for (const line of graticule) {
        ctx.beginPath();
        let pen = false;
        for (const v of line) {
          const p = project(v);
          if (p.z > 0) {
            const px = cx + p.x * R;
            const py = cy - p.y * R;
            if (pen) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
            pen = true;
          } else {
            pen = false;
          }
        }
        ctx.stroke();
      }

      // Kıtalar: ışığa dönük noktalar daha parlak.
      for (const [set, color] of [[north, a], [south, b]] as const) {
        ctx.fillStyle = rgba(color, 1);
        for (const v of set) {
          const p = project(v);
          if (p.z <= 0.02) continue;
          const shade = 0.4 + 0.6 * Math.pow(p.z, 0.6);
          ctx.globalAlpha = Math.min(1, shade);
          const size = 1.3 + p.z * 1.6;
          ctx.fillRect(cx + p.x * R - size / 2, cy - p.y * R - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;

      // Kenar çizgisi.
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = rgba(a, 0.45);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // Bağlantı yayları ve üzerlerinde gezen veri atımları.
      for (const arc of arcs) {
        const projected = arc.points.map(project);
        const visibleAt = (p: { x: number; y: number; z: number }) => p.z > 0 || Math.hypot(p.x, p.y) > 1.0;
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = rgba(a, 0.42);
        ctx.beginPath();
        let pen = false;
        projected.forEach((p) => {
          if (!visibleAt(p)) {
            pen = false;
            return;
          }
          const px = cx + p.x * R;
          const py = cy - p.y * R;
          if (pen) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
          pen = true;
        });
        ctx.stroke();

        const head = ((time * 0.00032 + arc.phase) % 1.5) / 1.5;
        const last = projected.length - 1;
        const headIndex = Math.min(last, Math.round(head * 1.5 * last));
        const tail = Math.max(0, headIndex - 14);
        for (let i = tail; i < headIndex; i++) {
          const p = projected[i];
          const q = projected[i + 1];
          if (!visibleAt(p) || !visibleAt(q)) continue;
          ctx.strokeStyle = rgba(b, ((i - tail) / (headIndex - tail)) * 0.95);
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(cx + p.x * R, cy - p.y * R);
          ctx.lineTo(cx + q.x * R, cy - q.y * R);
          ctx.stroke();
        }
        const tip = projected[headIndex];
        if (headIndex < last && visibleAt(tip)) {
          ctx.fillStyle = rgba(b, 0.25);
          ctx.beginPath();
          ctx.arc(cx + tip.x * R, cy - tip.y * R, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(cx + tip.x * R, cy - tip.y * R, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Şehir işaretleri.
      for (const city of cities) {
        const p = project(unit(city.lat, city.lon));
        if (p.z <= 0.02) continue;
        const px = cx + p.x * R;
        const py = cy - p.y * R;
        ctx.fillStyle = rgba(b, 0.22);
        ctx.beginPath();
        ctx.arc(px, py, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(b, 1);
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Merkez: atan işaret.
      const h = project(hubVector);
      if (h.z > 0) {
        const px = cx + h.x * R;
        const py = cy - h.y * R;
        for (const offset of [0, 0.5]) {
          const t = ((time * 0.00055 + offset) % 1 + 1) % 1;
          ctx.strokeStyle = rgba(a, (1 - t) * 0.75);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(px, py, 4 + t * 24, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = rgba(a, 0.35);
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(a, 1);
        ctx.beginPath();
        ctx.arc(px, py, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(px, py, 1.7, 0, Math.PI * 2);
        ctx.fill();
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
