import type { ReactNode } from "react";
import { Reveal } from "./reveal";

type PageHeroProps = { title: string; text?: string; eyebrow?: ReactNode; compact?: boolean };

export function PageHero({ title, text, eyebrow, compact = false }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden="true"
        className="animate-blob pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-blob pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-accent-2/15 blur-3xl [animation-delay:-6s]"
      />
      <div className={`relative mx-auto max-w-6xl px-4 sm:px-6 ${compact ? "py-6 sm:py-20" : "py-10 sm:py-20"}`}>
        <Reveal>
          {eyebrow && <div className="mb-4 text-sm text-muted">{eyebrow}</div>}
          <h1 className={`max-w-3xl text-balance font-extrabold tracking-normal ${compact ? "text-2xl sm:text-5xl" : "text-3xl sm:text-5xl"}`}>{title}</h1>
          {text && <p className={`max-w-2xl text-muted ${compact ? "mt-2 text-sm leading-6 sm:mt-4 sm:text-lg sm:leading-8" : "mt-3 text-base leading-7 sm:mt-4 sm:text-lg sm:leading-8"}`}>{text}</p>}
        </Reveal>
      </div>
    </section>
  );
}
