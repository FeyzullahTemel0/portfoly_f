import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import type { Locale } from "@/lib/locales";
import type { PublicProject } from "@/lib/projects";

export function ProjectCard({ lang, project, more }: { lang: Locale; project: PublicProject; more: string }) {
  return (
    <Link
      href={`/${lang}/projects/${project.slug}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-xl hover:shadow-foreground/10"
    >
      {project.coverUrl ? (
        <Image
          src={project.coverUrl}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw"
          className={project.coverFit === "contain" ? "object-contain p-2" : "object-cover transition-transform duration-700 group-hover:scale-110"}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-teal-500/25 text-5xl font-black text-accent/60">
          {project.title.slice(0, 1).toLocaleUpperCase()}
        </div>
      )}

      <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-t ${project.coverFit === "contain" ? "from-black/80 via-transparent to-transparent opacity-90" : "from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100"} transition-opacity duration-300`} />

      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        {project.category && (
          <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur">
            {project.category}
          </span>
        )}
        <h3 className="text-lg font-bold leading-tight">{project.title}</h3>
        <p className="mt-1 line-clamp-2 max-h-0 text-sm text-white/85 opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100">
          {project.summary}
        </p>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold">
          {more}
          <FiArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
