import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { ReferenceLogo } from "@/components/reference-logo";
import type { Locale } from "@/lib/locales";
import type { PublicReference } from "@/lib/references";
import { referenceUi } from "@/lib/reference-ui";
import { safeUrl } from "@/lib/site";

function Card({ item, lang, hidden }: { item: PublicReference; lang: Locale; hidden: boolean }) {
  const href = item.slug ? `/${lang}/references/${item.slug}` : safeUrl(item.website);
  const body = (
    <>
      <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-black/5">
        <ReferenceLogo reference={item} variant="tile" />
      </span>
      <span className="min-w-0 flex-1 text-left rtl:text-right">
        <span className="line-clamp-2 block text-sm font-bold leading-snug">{item.name}</span>
        {item.sector && <span className="block truncate text-xs font-medium text-accent">{item.sector}</span>}
      </span>
      <FiArrowUpRight className="h-4 w-4 shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
    </>
  );
  const className = "card-glow group flex w-[17.5rem] shrink-0 items-center gap-3 rounded-2xl border border-border bg-surface p-2.5 pr-4 sm:w-[19rem]";
  if (!href) return <div className={className}>{body}</div>;
  const external = !item.slug;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined} className={className}>
      {body}
    </a>
  ) : (
    <Link href={href} tabIndex={hidden ? -1 : undefined} className={className}>
      {body}
    </Link>
  );
}

// Anasayfada karşılama alanının hemen altında akan referans logoları; her kart detay sayfasına gider.
export function ReferenceShowcase({ items, lang }: { items: PublicReference[]; lang: Locale }) {
  if (items.length === 0) return null;
  const ui = referenceUi[lang];
  const copies = Math.max(1, Math.ceil(6 / items.length));
  const half = Array.from({ length: copies }, () => items).flat();
  const duration = `${Math.max(30, half.length * 8)}s`;

  return (
    <section aria-label={ui.showcaseTitle} className="relative border-b border-border">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_50%_0%,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-4 pt-10 text-center sm:px-6 sm:pt-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {ui.showcaseEyebrow}
        </span>
        <h2 className="mx-auto mt-4 max-w-2xl text-balance text-2xl font-extrabold tracking-normal sm:text-4xl">{ui.showcaseTitle}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">{ui.showcaseText}</p>
      </div>

      <div dir="ltr" className="relative overflow-hidden py-8 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] sm:py-10">
        <div className="animate-marquee flex w-max" style={{ animationDuration: duration }}>
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 gap-4 pr-4">
              {half.map((item, index) => (
                <Card key={`${copy}-${index}`} item={item} lang={lang} hidden={copy === 1} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="relative pb-8 text-center sm:pb-10">
        <Link href={`/${lang}/references`} className="text-sm font-semibold text-accent hover:underline">
          {ui.allReferences} →
        </Link>
      </p>
    </section>
  );
}
