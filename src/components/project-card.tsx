import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import type { Locale } from "@/lib/locales";
import type { PublicProject } from "@/lib/projects";

export function ProjectCard({ lang, project, more }: { lang: Locale; project: PublicProject; more: string }) {
  return (
    <Link
      href={`/${lang}/projects/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-xl hover:shadow-foreground/10"
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-background">
        {project.coverUrl ? (
          <Image
            src={project.coverUrl}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className={project.coverFit === "contain" ? "object-contain p-2" : "object-cover transition-transform duration-500 group-hover:scale-[1.02]"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/15 to-teal-500/20 text-5xl font-black text-accent/60">
            {project.title.slice(0, 1).toLocaleUpperCase()}
          </div>
        )}
      </div>

      <div className="flex min-h-36 flex-1 flex-col p-4">
        {project.category && (
          <span className="mb-2 inline-flex w-fit rounded-md bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
            {project.category}
          </span>
        )}
        <h3 className="text-base font-bold leading-snug text-foreground sm:text-lg">{project.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">
          {project.summary}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent">
          {more}
          <FiArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
