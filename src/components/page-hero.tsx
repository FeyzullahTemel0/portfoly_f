import type { ReactNode } from "react";
import { Reveal } from "./reveal";

type PageHeroProps = { title: string; text?: string; eyebrow?: ReactNode };

export function PageHero({ title, text, eyebrow }: PageHeroProps) {
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
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-20">
        <Reveal>
          {eyebrow && <div className="mb-4 text-sm text-muted">{eyebrow}</div>}
          <h1 className="max-w-3xl text-balance text-3xl font-extrabold tracking-normal sm:text-5xl">{title}</h1>
          {text && <p className="mt-3 max-w-2xl text-base leading-7 text-muted sm:mt-4 sm:text-lg sm:leading-8">{text}</p>}
        </Reveal>
      </div>
    </section>
  );
}
