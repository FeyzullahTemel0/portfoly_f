import { BrandMark } from "@/components/brand-logo";

type PageLoadingProps = {
  variant?: "site" | "admin";
};

export function PageLoading({ variant = "site" }: PageLoadingProps) {
  return (
    <section role="status" aria-live="polite" aria-busy="true" className="mx-auto min-h-[62vh] w-full max-w-6xl px-4 py-8 sm:px-6">
      <span className="sr-only">
        <span className="loading-copy-tr">Sayfa yükleniyor</span>
        <span className="loading-copy-en">Loading page</span>
      </span>
      <div aria-hidden="true">
        <div className="h-px overflow-hidden bg-border">
          <div className="route-loading-progress h-full w-[38%] bg-accent" />
        </div>
        <div className="mt-10 flex items-center gap-3">
          <BrandMark />
          <span className="text-sm font-semibold">Temeloji Dijital</span>
        </div>
        {variant === "admin" ? (
          <div className="mt-10">
            <div className="shimmer h-8 w-56 rounded-sm bg-surface" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="shimmer h-24 rounded-lg border border-border bg-surface" />)}
            </div>
            <div className="mt-8 space-y-3">
              {Array.from({ length: 5 }, (_, index) => <div key={index} className="shimmer h-12 rounded-md border border-border bg-surface" />)}
            </div>
          </div>
        ) : (
          <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="shimmer h-3 w-40 rounded-sm bg-surface" />
              <div className="shimmer mt-6 h-12 w-[92%] rounded-sm bg-surface" />
              <div className="shimmer mt-3 h-12 w-[72%] rounded-sm bg-surface" />
              <div className="shimmer mt-7 h-4 w-full max-w-lg rounded-sm bg-surface" />
              <div className="shimmer mt-3 h-4 w-[78%] max-w-lg rounded-sm bg-surface" />
              <div className="mt-8 flex gap-3">
                <div className="shimmer h-11 w-40 rounded-md bg-surface" />
                <div className="shimmer h-11 w-32 rounded-md bg-surface" />
              </div>
            </div>
            <div className="shimmer aspect-[1.35] rounded-xl border border-border bg-surface" />
          </div>
        )}
      </div>
    </section>
  );
}