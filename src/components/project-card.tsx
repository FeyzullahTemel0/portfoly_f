import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiLayers } from "react-icons/fi";
import type { Locale } from "@/lib/locales";
import type { PublicProject } from "@/lib/projects";

export function ProjectCard({ lang, project, more }: { lang: Locale; project: PublicProject; more: string }) {
  return (
    <Link
      href={`/${lang}/projects/${project.slug}`}
      className="card-glow group flex h-full flex-row overflow-hidden rounded-xl border border-border bg-surface shadow-sm sm:flex-col sm:rounded-2xl"
    >
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden bg-background sm:aspect-[16/10] sm:w-full">
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className={project.coverFit === "contain" ? "object-contain p-2" : "object-cover transition-transform duration-500 group-hover:scale-[1.02]"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-accent/20 via-surface to-accent-2/25">
            <span aria-hidden="true" className="absolute h-40 w-40 rounded-full bg-accent/25 blur-3xl" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-accent-foreground shadow-xl shadow-accent/30">
              <FiLayers className="h-8 w-8" aria-hidden="true" />
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center p-3 sm:min-h-36 sm:p-4">
        {project.category && (
          <span className="mb-1.5 inline-flex max-w-full w-fit truncate rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent sm:mb-2 sm:py-1 sm:text-xs">
            {project.category}
          </span>
        )}
        <h3 className="text-sm font-bold leading-snug text-foreground sm:text-lg">{project.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-4 text-muted sm:mt-2 sm:text-sm sm:leading-5">
          {project.summary}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 pt-1 text-xs font-semibold text-accent sm:mt-auto sm:pt-4 sm:text-sm">
          {more}
          <FiArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
