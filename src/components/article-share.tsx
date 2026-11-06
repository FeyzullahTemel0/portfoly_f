"use client";

import { useState } from "react";
import { FiCheck, FiCopy, FiShare2 } from "react-icons/fi";
import { articleUi } from "@/lib/article-ui";
import type { Locale } from "@/lib/locales";

export function ArticleShare({ title, labels }: { title: string; labels: (typeof articleUi)[Locale] }) {
  const [copied, setCopied] = useState(false);
  const buttonClass = "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold transition hover:border-accent hover:text-accent sm:h-10 sm:px-4 sm:text-sm";

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href });
      else await copy();
    } catch {
      await copy();
    }
  }

  function openShare(platform: "whatsapp" | "linkedin" | "facebook" | "x") {
    const url = encodeURIComponent(window.location.href);
    const encodedTitle = encodeURIComponent(title);
    const links = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${url}`,
    };
    window.open(links[platform], "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={labels.share}>
      <button type="button" className={buttonClass} onClick={share}><FiShare2 aria-hidden="true" />{labels.shareNative}</button>
      <button type="button" className={buttonClass} onClick={copy} aria-live="polite">{copied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}{copied ? labels.copied : labels.copy}</button>
      <button type="button" className={buttonClass} onClick={() => openShare("whatsapp")}>WhatsApp</button>
      <button type="button" className={buttonClass} onClick={() => openShare("linkedin")}>LinkedIn</button>
      <button type="button" className={buttonClass} onClick={() => openShare("facebook")}>Facebook</button>
      <button type="button" className={buttonClass} onClick={() => openShare("x")}>X</button>
    </div>
  );
}
