import Link from "next/link";
import { FaApple, FaGooglePlay } from "react-icons/fa6";
import { FiCheck, FiPackage, FiShoppingBag } from "react-icons/fi";
import type { Dictionary } from "@/dictionaries/tr";

type Copy = Dictionary["shopierShowcase"];

export function ShopierShowcase({ copy }: { copy: Copy }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-accent">
            <FiShoppingBag className="h-4 w-4" aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h2 className="mt-4 text-2xl font-bold leading-tight tracking-normal sm:text-3xl">{copy.title}</h2>
          <p className="mt-3 leading-7 text-muted">{copy.text}</p>

          <div className="mt-5 space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>{copy.noPanel}</span>
            </p>
            <div>
              <p className="text-xs leading-5 text-muted">{copy.pricing}</p>
              <a
                href="https://help.shopier.com/help/shopier-ucretlendirmesi-nasil"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs font-semibold text-accent underline underline-offset-2"
              >
                {copy.pricingLink}
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href="https://apps.apple.com/tr/app/shopier/id1255502757"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-semibold transition hover:border-foreground"
            >
              <FaApple className="h-4 w-4" aria-hidden="true" /> {copy.appStore}
            </Link>
            <Link
              href="https://play.google.com/store/apps/details?id=com.deger.hantal.goshopier"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-semibold transition hover:border-foreground"
            >
              <FaGooglePlay className="h-3.5 w-3.5" aria-hidden="true" /> {copy.googlePlay}
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden border-t border-border bg-background p-6 lg:border-l lg:border-t-0 sm:p-10">
          <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-70" />
          <div aria-label={copy.mobile} role="img" className="relative flex w-full max-w-[360px] items-end justify-center gap-4">
            <div className="w-[76%] overflow-hidden rounded-xl border border-border bg-background shadow-xl">
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <span className="text-xs font-bold tracking-normal">shopier</span>
                <span className="rounded bg-accent/10 px-2 py-1 text-[9px] font-semibold text-accent">{copy.mobile}</span>
              </div>
              <div className="space-y-3 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold">{copy.products}</span>
                  <FiPackage className="h-4 w-4 text-accent" aria-hidden="true" />
                </div>
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md border border-border p-2">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded ${item === 0 ? "bg-[#dce9e6]" : item === 1 ? "bg-[#f4e4d6]" : "bg-[#e3edf3]"}`}>
                      <FiShoppingBag className="h-4 w-4 text-foreground/70" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block h-1.5 w-4/5 rounded-full bg-foreground/20" />
                      <span className="mt-1.5 block h-1 w-2/5 rounded-full bg-foreground/10" />
                    </span>
                    <span className="text-[9px] font-semibold text-muted">••••</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-md bg-foreground px-2.5 py-2 text-background">
                  <span className="flex items-center gap-1.5 text-[9px] font-medium"><FiCheck className="h-3 w-3 text-accent" />{copy.orders}</span>
                  <span className="text-[9px] opacity-75">{copy.orderState}</span>
                </div>
              </div>
            </div>

            <div aria-hidden="true" className="absolute -bottom-2 right-[2%] h-24 w-14 rounded-[14px] border-2 border-foreground/80 bg-background p-1 shadow-lg sm:right-[1%]">
              <div className="h-full overflow-hidden rounded-[9px] bg-surface p-1.5">
                <span className="mx-auto block h-1 w-5 rounded-full bg-foreground/20" />
                <span className="mt-3 block h-1.5 w-full rounded-full bg-accent/40" />
                <span className="mt-2 block h-7 rounded bg-[#dce9e6]" />
                <span className="mt-2 block h-1 w-4/5 rounded-full bg-foreground/15" />
                <span className="mt-1.5 block h-1 w-3/5 rounded-full bg-foreground/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
