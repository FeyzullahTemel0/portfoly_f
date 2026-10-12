import Link from "next/link";

// Dil bilgisi bu dosyaya verilmediği için metin iki dillidir.
export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-70" />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:py-36">
        <p className="text-7xl font-black tracking-normal text-accent sm:text-9xl">404</p>
        <h1 className="mt-4 text-2xl font-bold tracking-normal sm:text-3xl">Sayfa bulunamadı / Page not found</h1>
        <p className="mt-3 text-muted">Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/tr" className="inline-flex h-12 items-center rounded-xl bg-accent px-6 font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition hover:-translate-y-0.5">
            Ana sayfa
          </Link>
          <Link href="/en" className="inline-flex h-12 items-center rounded-xl border border-border bg-background px-6 font-semibold transition hover:-translate-y-0.5 hover:border-accent">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
