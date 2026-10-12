"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/locales";

const copy = {
  tr: {
    title: "Gizliliğiniz önemli",
    text: "Site kullanımını iyileştirmek için isteğe bağlı ziyaret istatistikleri tutabiliriz. Ham IP adresi, isim veya form içeriği kaydedilmez; IP'den aylık değişen takma adlı bir özet üretilir ve kayıtlar 30 gün sonra silinir.",
    privacy: "Gizlilik politikası",
    reject: "Reddet",
    accept: "İzin ver",
    preferences: "Gizlilik tercihleri",
  },
  en: {
    title: "Your privacy matters",
    text: "We can collect optional visit statistics to improve the site. Raw IP addresses, names and form contents are not stored; a monthly rotating pseudonymous key is derived from the IP, and records are deleted after 30 days.",
    privacy: "Privacy policy",
    reject: "Decline",
    accept: "Allow analytics",
    preferences: "Privacy preferences",
  },
  de: {
    title: "Ihre Privatsphäre ist wichtig",
    text: "Wir können optionale Besuchsstatistiken erheben. IP-Adressen, Namen und Formularinhalte werden nicht gespeichert. Statistiken werden nach 30 Tagen gelöscht.",
    privacy: "Datenschutzerklärung",
    reject: "Ablehnen",
    accept: "Zustimmen",
    preferences: "Datenschutzeinstellungen",
  },
  fr: {
    title: "Votre confidentialité compte",
    text: "Nous pouvons recueillir des statistiques de visite facultatives. Les adresses IP, les noms et le contenu des formulaires ne sont pas conservés. Les statistiques sont supprimées après 30 jours.",
    privacy: "Politique de confidentialité",
    reject: "Refuser",
    accept: "Accepter",
    preferences: "Préférences de confidentialité",
  },
  ar: {
    title: "خصوصيتكم مهمة",
    text: "قد نجمع إحصاءات زيارة اختيارية لتحسين الموقع. لا نحفظ عناوين IP أو الأسماء أو محتوى النماذج، وتُحذف الإحصاءات بعد 30 يومًا.",
    privacy: "سياسة الخصوصية",
    reject: "رفض",
    accept: "موافقة",
    preferences: "تفضيلات الخصوصية",
  },
} as const;

type Consent = "accepted" | "rejected" | null;
type ConsentRecord = { value: Exclude<Consent, null>; expiresAt: number };
const CONSENT_STORAGE_KEY = "analytics-consent";
const CONSENT_DURATION_MS = 180 * 24 * 60 * 60 * 1000;
const MAX_TIMEOUT_MS = 24 * 60 * 60 * 1000;

function readConsentRecord(): ConsentRecord | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;
    const value: unknown = JSON.parse(stored);
    if (typeof value !== "object" || value === null) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    const record = value as Record<string, unknown>;
    if (
      (record.value !== "accepted" && record.value !== "rejected") ||
      typeof record.expiresAt !== "number" ||
      record.expiresAt <= Date.now()
    ) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }
    return { value: record.value, expiresAt: record.expiresAt };
  } catch {
    return null;
  }
}

function subscribeConsent(callback: () => void) {
  window.addEventListener("analytics-consent-updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("analytics-consent-updated", callback);
    window.removeEventListener("storage", callback);
  };
}

function getConsent(): Consent {
  return readConsentRecord()?.value ?? null;
}

function getServerConsent(): Consent {
  return null;
}

export function AnalyticsConsent({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const consent = useSyncExternalStore(subscribeConsent, getConsent, getServerConsent);
  const trackedPath = useRef("");

  const track = useCallback((path: string) => {
    let consent: string | null = null;
    try {
      consent = localStorage.getItem("analytics-consent");
    } catch {
      return;
    }
    if (consent !== "accepted" || !path || trackedPath.current === path) return;
    trackedPath.current = path;
    void fetch("/api/analytics/visit", {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, referrer: document.referrer }),
    }).catch(() => {});
  }, []);

  useEffect(() => track(pathname), [pathname, track]);

  useEffect(() => {
    const onConsent = () => {
      trackedPath.current = "";
      track(pathname);
    };
    window.addEventListener("analytics-consent-updated", onConsent);
    return () => window.removeEventListener("analytics-consent-updated", onConsent);
  }, [pathname, track]);

  useEffect(() => {
    if (consent === null) return;
    const record = readConsentRecord();
    if (!record) return;

    let timer: ReturnType<typeof setTimeout>;
    const checkExpiry = () => {
      const remaining = record.expiresAt - Date.now();
      if (remaining <= 0) {
        window.dispatchEvent(new Event("analytics-consent-updated"));
        return;
      }
      timer = setTimeout(checkExpiry, Math.min(remaining, MAX_TIMEOUT_MS));
    };

    timer = setTimeout(checkExpiry, Math.min(record.expiresAt - Date.now(), MAX_TIMEOUT_MS));
    return () => clearTimeout(timer);
  }, [consent]);

  async function choose(value: Exclude<Consent, null>) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ value, expiresAt: Date.now() + CONSENT_DURATION_MS }));
      const response = await fetch("/api/analytics/consent", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent: value }),
      });
      if (!response.ok) throw new Error("Consent endpoint unavailable");
      window.dispatchEvent(new Event("analytics-consent-updated"));
    } catch {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      window.dispatchEvent(new Event("analytics-consent-updated"));
    }
  }

  const text = copy[lang];

  if (consent !== null) return null;

  return (
    <aside
      aria-label={text.title}
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-xl border border-border bg-background p-4 shadow-2xl sm:inset-x-6 sm:flex sm:items-center sm:gap-5 sm:p-5"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{text.title}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{text.text} <Link href={`/${lang}/legal/privacy`} className="font-semibold text-accent underline underline-offset-2">{text.privacy}</Link></p>
      </div>
      <div className="mt-3 flex shrink-0 gap-2 sm:mt-0">
        <button type="button" onClick={() => choose("rejected")} className="inline-flex h-9 items-center rounded-md border border-border px-3 text-xs font-semibold transition hover:border-foreground">{text.reject}</button>
        <button type="button" onClick={() => choose("accepted")} className="button-primary inline-flex h-9 items-center rounded-md px-3 text-xs font-semibold">{text.accept}</button>
      </div>
    </aside>
  );
}

export function PrivacyPreferencesButton({ lang }: { lang: Locale }) {
  async function reopenPreferences() {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      // Continue to clear the server preference if browser storage is unavailable.
    }
    try {
      await fetch("/api/analytics/consent", { method: "DELETE", credentials: "same-origin" });
    } catch {
      // Local consent is cleared even if the server is temporarily unreachable.
    }
    window.dispatchEvent(new Event("analytics-consent-updated"));
  }

  return (
    <button type="button" onClick={() => void reopenPreferences()} className="text-sm text-muted transition-colors hover:text-foreground">
      {copy[lang].preferences}
    </button>
  );
}
