"use client";

import { useDeferredValue, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import type { Dictionary } from "@/dictionaries/tr";
import type { Locale } from "@/lib/locales";
import type { PublicProject } from "@/lib/projects";
import { ProjectCard } from "./project-card";
import { Reveal } from "./reveal";

type Copy = Pick<Dictionary["projects"], "more" | "searchLabel" | "searchPlaceholder" | "searchNoResults">;

function normalize(value: string, lang: Locale) {
  return value.toLocaleLowerCase(lang).normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

export function ProjectBrowser({ lang, projects, copy }: { lang: Locale; projects: PublicProject[]; copy: Copy }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalize(deferredQuery, lang);
  const filteredProjects = normalizedQuery
    ? projects.filter((project) => normalize(`${project.title} ${project.category} ${project.summary}`, lang).includes(normalizedQuery))
    : projects;

  return (
    <div>
      <div className="relative mb-7 max-w-xl">
        <FiSearch className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <label htmlFor="project-search" className="sr-only">{copy.searchLabel}</label>
        <input
          id="project-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.searchPlaceholder}
          className="h-12 w-full rounded-lg border border-border bg-background ps-11 pe-12 text-sm outline-none transition-colors placeholder:text-muted/80 focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label={copy.searchLabel} className="absolute end-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground">
            <FiX className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {filteredProjects.length === 0 ? (
        <p role="status" className="rounded-lg border border-border bg-surface px-5 py-8 text-center text-sm text-muted">{copy.searchNoResults}</p>
      ) : (
        <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <Reveal key={project.id} delay={(index % 3) * 0.05}>
              <ProjectCard lang={lang} project={project} more={copy.more} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
