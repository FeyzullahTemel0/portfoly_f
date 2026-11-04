"use client";

import { useState, useTransition, type FormEvent } from "react";
import { FiStar, FiUploadCloud } from "react-icons/fi";
import type { Locale } from "@/lib/locales";
import { reviewUi } from "@/lib/review-ui";
import { submitCustomerReview } from "@/app/review-actions";

export function CustomerReviewForm({ token, lang }: { token: string; lang: Locale }) {
  const ui = reviewUi[lang];
  const [businessName, setBusinessName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const direction = lang === "ar" ? "rtl" : "ltr";
  const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-accent";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!businessName.trim() || !comment.trim() || !rating || !file || !consent) {
      setMessage(ui.required);
      return;
    }
    startTransition(async () => {
      try {
        const body = new FormData();
        body.set("token", token);
        body.set("file", file);
        const upload = await fetch("/api/review-upload", { method: "POST", body });
        const image = await upload.json().catch(() => ({}));
        if (!upload.ok || typeof image.url !== "string") {
          setMessage(image.error || ui.uploadError);
          return;
        }
        const result = await submitCustomerReview(token, { businessName, logoUrl: image.url, text: comment, rating, consent });
        if (!result.ok) {
          setMessage(result.error === "invalid" ? ui.invalid : result.error === "required" ? ui.required : ui.uploadError);
          return;
        }
        setDone(true);
        setMessage(ui.success);
      } catch {
        setMessage(ui.uploadError);
      }
    });
  }

  if (done) {
    return <p role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center font-medium text-emerald-700 dark:text-emerald-300">{message}</p>;
  }

  return (
    <form onSubmit={submit} dir={direction} className="space-y-5">
      <div>
        <label htmlFor="review-business" className="mb-1.5 block text-sm font-semibold">{ui.business}</label>
        <input id="review-business" autoComplete="organization" maxLength={120} required value={businessName} onChange={(event) => setBusinessName(event.target.value)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="review-logo" className="mb-1.5 block text-sm font-semibold">{ui.logo}</label>
        <label htmlFor="review-logo" className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm transition hover:border-accent">
          <FiUploadCloud className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{file?.name || ui.logoHint}</span>
        </label>
        <input id="review-logo" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" required className="sr-only" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
      </div>
      <div>
        <span className="mb-2 block text-sm font-semibold">{ui.rating}</span>
        <div role="radiogroup" aria-label={ui.rating} className="flex gap-1">
          {ui.stars.map((label, index) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={rating === index + 1}
              aria-label={`${index + 1}: ${label}`}
              onClick={() => setRating(index + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-lg outline-none transition hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <FiStar className={`h-6 w-6 ${rating > index ? "fill-amber-400 text-amber-400" : "text-muted"}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="review-comment" className="mb-1.5 block text-sm font-semibold">{ui.comment}</label>
        <textarea id="review-comment" rows={6} minLength={20} maxLength={1200} required value={comment} onChange={(event) => setComment(event.target.value)} className={inputClass} />
        <p className="mt-1 text-right text-xs text-muted">{comment.length} / 1200</p>
      </div>
      <p className="text-xs leading-5 text-muted">{ui.privacy}</p>
      <label className="flex items-start gap-3 text-sm leading-6">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" />
        <span>{ui.consent}</span>
      </label>
      {message && <p role="alert" className="text-sm font-medium text-red-500">{message}</p>}
      <button type="submit" disabled={pending} className="button-primary inline-flex h-12 w-full items-center justify-center rounded-xl px-6 text-sm font-bold disabled:opacity-60">
        {pending ? ui.sending : ui.submit}
      </button>
    </form>
  );
}
