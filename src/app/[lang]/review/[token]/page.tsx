import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FiShield } from "react-icons/fi";
import { CustomerReviewForm } from "@/components/customer-review-form";
import { connectDb } from "@/lib/db";
import { isLocale } from "@/lib/locales";
import { hashReviewToken } from "@/lib/review-token";
import { reviewUi } from "@/lib/review-ui";
import { ReviewLink } from "@/models/customer-review";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Müşteri yorumu", robots: { index: false, follow: false } };
}

export default async function ReviewPage({ params }: PageProps<"/[lang]/review/[token]">) {
  const { lang, token } = await params;
  if (!isLocale(lang)) notFound();
  const ui = reviewUi[lang];
  let valid = false;
  if (/^[A-Za-z0-9_-]{40,48}$/.test(token)) {
    try {
      await connectDb();
      valid = Boolean(await ReviewLink.exists({ tokenHash: hashReviewToken(token), expiresAt: { $gt: new Date() }, usedAt: null, revokedAt: null }));
    } catch (error) {
      console.error("Yorum bağlantısı doğrulanamadı:", error);
    }
  }

  return (
    <section className="relative isolate flex flex-1 items-center overflow-hidden px-4 py-12 sm:px-6 sm:py-20">
      <div aria-hidden="true" className="hero-aurora pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(var(--foreground)_1px,transparent_1px),linear-gradient(90deg,var(--foreground)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative mx-auto w-full max-w-2xl rounded-2xl border border-border bg-surface/90 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
        <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <FiShield className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="text-balance text-2xl font-extrabold sm:text-3xl">{ui.title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{ui.text}</p>
        <div className="mt-7">
          {valid ? <CustomerReviewForm token={token} lang={lang} /> : <p role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-medium">{ui.invalid}</p>}
        </div>
      </div>
    </section>
  );
}
