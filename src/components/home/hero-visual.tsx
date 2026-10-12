"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { FiArrowUpRight, FiCheck, FiLayers, FiMessageCircle } from "react-icons/fi";

type Props = { imageSrc?: string; imageAlt: string };

export function HeroVisual({ imageSrc, imageAlt }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
      className="relative mx-auto w-full max-w-[640px]"
    >
      {imageSrc ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border shadow-xl">
          <Image src={imageSrc} alt={imageAlt} fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        </div>
      ) : (
        <div role="img" aria-label={imageAlt} className="relative mx-auto aspect-[1.12/1] w-full max-w-[620px]">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.25 }}
            className="absolute left-[7%] top-[5%] z-10 w-[87%] overflow-hidden rounded-xl border border-border bg-background shadow-[0_24px_70px_-32px_rgba(15,23,42,0.38)]"
          >
            <div className="flex h-9 items-center gap-2 border-b border-border bg-surface px-3 sm:h-11 sm:px-4">
              <span className="h-2 w-2 rounded-full bg-foreground/20" />
              <span className="h-2 w-2 rounded-full bg-foreground/20" />
              <span className="h-2 w-2 rounded-full bg-foreground/20" />
              <div className="mx-auto flex h-5 w-[48%] items-center justify-center rounded bg-background text-[8px] text-muted sm:text-[9px]">temeloji.dev / arayüz konsepti</div>
            </div>

            <div className="p-3 sm:p-5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black tracking-normal sm:text-[11px]">MARKA<span className="text-accent">.STUDIO</span></span>
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="h-1 w-7 rounded-full bg-foreground/15 sm:w-10" />
                  <span className="h-1 w-7 rounded-full bg-foreground/15 sm:w-10" />
                  <span className="h-1 w-7 rounded-full bg-foreground/15 sm:w-10" />
                  <span className="h-5 w-12 rounded bg-foreground text-[7px] text-background sm:h-6 sm:w-16 sm:text-[8px]" />
                </div>
              </div>

              <div className="mt-3 grid min-h-[180px] overflow-hidden rounded-lg border border-border sm:mt-5 sm:min-h-[235px] sm:grid-cols-[1.05fr_0.95fr]">
                <div className="flex flex-col justify-center p-4 sm:p-7">
                  <span className="text-[8px] font-semibold uppercase tracking-normal text-accent sm:text-[10px]">DİJİTAL DENEYİM</span>
                  <p className="mt-2 max-w-[13ch] text-xl font-bold leading-[1.05] tracking-normal sm:mt-3 sm:text-3xl">Markanız için iyi bir başlangıç.</p>
                  <p className="mt-2 max-w-[27ch] text-[8px] leading-4 text-muted sm:mt-3 sm:text-[10px] sm:leading-5">Net anlatım, kolay kullanım ve işinize göre tasarlanmış bir web deneyimi.</p>
                  <span className="mt-3 inline-flex h-6 w-[86px] items-center justify-center rounded bg-foreground text-[8px] font-semibold text-background sm:mt-4 sm:h-8 sm:w-24 sm:text-[9px]">Projeyi keşfet <FiArrowUpRight className="ml-1 h-3 w-3" /></span>
                </div>
                <div className="relative m-2 overflow-hidden rounded-md bg-[#dce9e6] sm:m-3">
                  <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(135deg,transparent_44%,#fff_44%,#fff_45%,transparent_45%),linear-gradient(45deg,transparent_54%,#0e7490_54%,#0e7490_55%,transparent_55%)]" />
                  <div className="absolute bottom-[12%] left-[12%] h-[44%] w-[58%] rounded-t-[45%] border-[8px] border-b-0 border-[#477c72] sm:border-[12px] sm:border-b-0" />
                  <div className="absolute bottom-[12%] right-[9%] h-[58%] w-[22%] rounded-t-full bg-[#ed8a62]" />
                  <span className="absolute bottom-[8%] left-[9%] h-2 w-[78%] rounded-full bg-[#617d78]/40" />
                  <span className="absolute right-[9%] top-[10%] h-7 w-7 rounded-full bg-[#f4c977] sm:h-9 sm:w-9" />
                  <span className="absolute left-[10%] top-[12%] rounded bg-background/90 px-2 py-1 text-[7px] font-semibold text-foreground sm:text-[8px]">GÖRSEL DİL</span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-3 sm:gap-3">
                {["Hizmetler", "Projeler", "İletişim"].map((label, index) => (
                  <div key={label} className="rounded-md border border-border p-2 sm:p-3">
                    <span className={`flex h-5 w-5 items-center justify-center rounded ${index === 1 ? "bg-accent/15 text-accent" : "bg-surface text-foreground"}`}>
                      {index === 0 ? <FiLayers className="h-3 w-3" /> : index === 1 ? <FiCheck className="h-3 w-3" /> : <FiMessageCircle className="h-3 w-3" />}
                    </span>
                    <span className="mt-1.5 block text-[7px] font-semibold sm:text-[8px]">{label}</span>
                    <span className="mt-1 block h-1 w-4/5 rounded-full bg-foreground/10" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, x: 20, y: 14 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.55 }}
            className="animate-float absolute bottom-[1%] right-0 z-20 w-[44%] rounded-lg border border-border bg-background p-2.5 shadow-xl sm:bottom-0 sm:right-[-1%] sm:w-[40%] sm:p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold sm:text-[9px]">YÖNETİM PANELİ</span>
              <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-accent"><FiLayers className="h-3 w-3" /></span>
            </div>
            <div className="mt-2 space-y-1.5">
              {["Yeni talepler", "İçerik yönetimi", "Randevular"].map((label, index) => (
                <div key={label} className="flex items-center justify-between rounded border border-border px-2 py-1.5">
                  <span className="text-[7px] text-muted sm:text-[8px]">{label}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-[#e68558]" : "bg-accent"}`} />
                </div>
              ))}
            </div>
          </motion.div>

          <div className="absolute bottom-[12%] left-[2%] z-20 rounded-md border border-border bg-background px-2.5 py-2 shadow-lg sm:left-0 sm:px-3">
            <span className="block text-[7px] font-semibold uppercase tracking-normalr text-muted sm:text-[8px]">TASARIMDAN</span>
            <span className="mt-0.5 block text-[9px] font-bold sm:text-[11px]">Yayına kadar birlikte</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
