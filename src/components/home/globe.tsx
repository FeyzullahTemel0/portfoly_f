"use client";

import { useEffect, useRef, type RefObject } from "react";
import { buildLandDots, cities, hub, type City } from "./world-data";

type Rgb = [number, number, number];
type Vec3 = [number, number, number];
type Screen = { x: number; y: number; z: number };

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
const unit = (lat: number, lon: number): Vec3 => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Merkez şehirden (Gaziantep) dünya şehirlerine uzanan, yükselen büyük daire yayları.
function buildArc(from: City, to: City, steps = 64) {
  const a = unit(from.lat, from.lon);
  const b = unit(to.lat, to.lon);
  const omega = Math.acos(Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  const points: Vec3[] = [];
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

// Yay üzerinde kesirli konumdaki noktayı iki komşu nokta arasında yumuşatır.
function pointAt(points: Screen[], position: number): Screen {
  const last = points.length - 1;
  const clamped = Math.min(last, Math.max(0, position));
  const i = Math.min(last - 1, Math.floor(clamped));
  const t = clamped - i;
  const p = points[i];
  const q = points[i + 1];
  return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, z: p.z + (q.z - p.z) * t };
}

const CYCLE_MS = 7600;
const OUT_END = 0.42;
const BACK_START = 0.52;
const BACK_END = 0.94;

// Kıtaları nefes alan nokta dokusuyla gösteren, Gaziantep merkezli çift yönlü veri akışı taşıyan dönen dünya.
export function Globe({ pointer }: { pointer: RefObject<{ x: number; y: number }> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hubVector = unit(hub.lat, hub.lon);
    const dots = buildLandDots(2.1).map((dot) => {
      const v = unit(dot.lat, dot.lon);
      const dist = Math.acos(Math.min(1, Math.max(-1, v[0] * hubVector[0] + v[1] * hubVector[1] + v[2] * hubVector[2])));
      return { v, north: dot.lat >= 0, phase: dot.lon * 2.3 + dot.lat * 3.1, dist };
    });
    const arcs = cities.map((city, index) => ({ city, points: buildArc(hub, city), phase: index * 0.37 }));
    const graticule: Vec3[][] = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      const ring: Vec3[] = [];
      for (let lon = 0; lon <= 360; lon += 6) ring.push(unit((lat * Math.PI) / 180, (lon * Math.PI) / 180));
      graticule.push(ring);
    }
    for (let lon = 0; lon < 360; lon += 30) {
      const meridian: Vec3[] = [];
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

      const project = (v: Vec3): Screen => {
        const x1 = v[0] * cosY + v[2] * sinY;
        const z1 = -v[0] * sinY + v[2] * cosY;
        const y2 = v[1] * cosX - z1 * sinX;
        const z2 = v[1] * sinX + z1 * cosX;
        return { x: x1, y: y2, z: z2 };
      };
      const sx = (p: Screen) => cx + p.x * R;
      const sy = (p: Screen) => cy - p.y * R;
      const isVisible = (p: Screen) => p.z > 0 || Math.hypot(p.x, p.y) > 1.0;

      // Atmosfer ışıması ve gövde; ışıma yavaşça nefes alır.
      const breathe = 0.5 + 0.5 * Math.sin(time * 0.0013);
      const glow = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.32);
      glow.addColorStop(0, rgba(a, 0.34 + breathe * 0.1));
      glow.addColorStop(0.35, rgba(b, 0.12 + breathe * 0.04));
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
            if (pen) ctx.lineTo(sx(p), sy(p));
            else ctx.moveTo(sx(p), sy(p));
            pen = true;
          } else {
            pen = false;
          }
        }
        ctx.stroke();
      }

      // Kıtalar: her nokta kendi fazında nefes alır; merkezden yayılan dalga noktaları geçerken parlatır.
      const wavePulse = time * 0.0018;
      const waveFront = (time * 0.00042) % 4.2;
      const fillA = rgba(a, 1);
      const fillB = rgba(b, 1);
      let currentFill = "";
      for (const dot of dots) {
        const p = project(dot.v);
        if (p.z <= 0.02) continue;
        const fill = dot.north ? fillA : fillB;
        if (fill !== currentFill) {
          ctx.fillStyle = fill;
          currentFill = fill;
        }
        const breath = 0.5 + 0.5 * Math.sin(wavePulse + dot.phase);
        const delta = dot.dist - waveFront;
        const wave = Math.exp(-delta * delta * 26);
        const shade = 0.4 + 0.6 * Math.pow(p.z, 0.6);
        ctx.globalAlpha = Math.min(1, shade * (0.58 + 0.42 * breath) + wave * 0.55);
        const size = (1.3 + p.z * 1.6) * (0.86 + 0.28 * breath) + wave * 1.3;
        ctx.fillRect(sx(p) - size / 2, sy(p) - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      // Kenar çizgisi.
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = rgba(a, 0.45);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // Neon parıltı için ışıkları toplayan karışım modu.
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const hubScreen = project(hubVector);

      // Bağlantı yayları: giden ve dönen veri atımları ease-in-out ile hızlanıp yavaşlar.
      for (const arc of arcs) {
        const projected = arc.points.map(project);
        const last = projected.length - 1;

        // Yayın kendisi: geniş sönük ışıma ve ince çekirdek, hafif nefes.
        const base = 0.5 + 0.5 * Math.sin(time * 0.0016 + arc.phase * 6);
        for (const [lineWidth, alpha, color] of [[5, 0.05 + base * 0.04, b], [1.1, 0.3 + base * 0.14, a]] as const) {
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = rgba(color, alpha);
          ctx.beginPath();
          let pen = false;
          for (const p of projected) {
            if (!isVisible(p)) {
              pen = false;
              continue;
            }
            if (pen) ctx.lineTo(sx(p), sy(p));
            else ctx.moveTo(sx(p), sy(p));
            pen = true;
          }
          ctx.stroke();
        }

        const cycle = (time / CYCLE_MS + arc.phase) % 1;
        const outbound = cycle < OUT_END;
        const inbound = cycle >= BACK_START && cycle < BACK_END;

        if (outbound || inbound) {
          const local = outbound ? cycle / OUT_END : (cycle - BACK_START) / (BACK_END - BACK_START);
          const eased = easeInOut(local);
          const dir = outbound ? 1 : -1;
          const position = (outbound ? eased : 1 - eased) * last;
          // Kuyruk, atımın hızlandığı yerde uzar, uçlarda kısalır.
          const tailLength = last * (0.12 + 0.3 * Math.sin(Math.PI * local));
          const segments = 16;

          for (const [lineWidth, alpha] of [[5.5, 0.2], [2, 1]] as const) {
            ctx.lineWidth = lineWidth;
            for (let k = 0; k < segments; k++) {
              const p = pointAt(projected, position - dir * (k / segments) * tailLength);
              const q = pointAt(projected, position - dir * ((k + 1) / segments) * tailLength);
              if (!isVisible(p) || !isVisible(q)) continue;
              const fade = Math.pow(1 - k / segments, 1.7);
              ctx.strokeStyle = rgba(k < 2 ? [255, 255, 255] : outbound ? b : a, fade * alpha);
              ctx.beginPath();
              ctx.moveTo(sx(p), sy(p));
              ctx.lineTo(sx(q), sy(q));
              ctx.stroke();
            }
          }

          const tip = pointAt(projected, position);
          if (isVisible(tip)) {
            const color = outbound ? b : a;
            for (const [radius, alpha] of [[9, 0.16], [5, 0.4]] as const) {
              ctx.fillStyle = rgba(color, alpha);
              ctx.beginPath();
              ctx.arc(sx(tip), sy(tip), radius, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(sx(tip), sy(tip), 1.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Varış halkaları: giden atım şehirde, dönen atım merkezde dalga bırakır.
        const arrivals: [number, Screen, Rgb][] = [
          [(cycle - OUT_END) / 0.2, projected[last], b],
          [(cycle - BACK_END) / 0.06, projected[0], a],
        ];
        for (const [t, spot, color] of arrivals) {
          if (t < 0 || t > 1 || !(spot.z > 0.02)) continue;
          ctx.strokeStyle = rgba(color, (1 - t) * 0.7);
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(sx(spot), sy(spot), 3 + t * 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Şehir işaretleri: her biri kendi ritminde yayılan ışık halkası taşır.
      cities.forEach((city, index) => {
        const p = project(unit(city.lat, city.lon));
        if (p.z <= 0.02) return;
        const t = (time * 0.00042 + index * 0.23) % 1;
        ctx.strokeStyle = rgba(b, (1 - t) * 0.55);
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(sx(p), sy(p), 3 + t * 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = rgba(b, 0.22);
        ctx.beginPath();
        ctx.arc(sx(p), sy(p), 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(b, 1);
        ctx.beginPath();
        ctx.arc(sx(p), sy(p), 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Merkez: üç katmanlı, aralıklı yayılan ışık halkaları.
      if (hubScreen.z > 0) {
        const px = sx(hubScreen);
        const py = sy(hubScreen);
        for (const offset of [0, 0.33, 0.66]) {
          const t = (((time * 0.00045 + offset) % 1) + 1) % 1;
          ctx.strokeStyle = rgba(a, Math.pow(1 - t, 1.5) * 0.8);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(px, py, 4 + t * 30, 0, Math.PI * 2);
          ctx.stroke();
        }
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.004);
        ctx.fillStyle = rgba(a, 0.22 + pulse * 0.12);
        ctx.beginPath();
        ctx.arc(px, py, 11 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(a, 0.4);
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
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

      ctx.globalCompositeOperation = "source-over";
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

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full transform-gpu" />;
}
