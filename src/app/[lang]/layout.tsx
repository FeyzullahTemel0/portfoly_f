import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { AdSlot } from "@/components/ad-slot";
import { CurrencyProvider } from "@/components/currency";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ScrollProgress } from "@/components/scroll-progress";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { getDictionary, getSettings } from "@/dictionaries";
import { getRates } from "@/lib/rates";
import { isLocale, locales } from "@/lib/locales";
import { groupServices } from "@/lib/service-groups";
import { safeUrl } from "@/lib/site";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

// Sayfa açılmadan önce kayıtlı temayı uygulayarak renk titremesini önler.
const themeScript = `try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){}`;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const [{ meta }, settings] = await Promise.all([getDictionary(lang), getSettings()]);
  const seoContent = {
    tr: [settings.seo.titleTr, settings.seo.descriptionTr],
    en: [settings.seo.titleEn, settings.seo.descriptionEn],
    de: [settings.seo.titleDe, settings.seo.descriptionDe],
    fr: [settings.seo.titleFr, settings.seo.descriptionFr],
    ar: [settings.seo.titleAr, settings.seo.descriptionAr],
  }[lang];
  const [seoTitle, seoDescription] = seoContent;
  const siteUrl = safeUrl(settings.seo.siteUrl);
  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    icons: { icon: "/rovax-icon-192.png", apple: "/rovax-icon-192.png" },
    title: seoTitle || meta.title,
    description: seoDescription || meta.description,
    robots: settings.seo.allowIndex ? { index: true, follow: true } : { index: false, follow: false },
    verification: settings.seo.googleSiteVerification ? { google: settings.seo.googleSiteVerification } : undefined,
    openGraph: {
      siteName: settings.legalName,
      locale: { tr: "tr_TR", en: "en_US", de: "de_DE", fr: "fr_FR", ar: "ar_SA" }[lang],
      type: "website",
      images: settings.seo.ogImageUrl ? [{ url: settings.seo.ogImageUrl }] : undefined,
    },
    twitter: {
      card: settings.seo.ogImageUrl ? "summary_large_image" : "summary",
      images: settings.seo.ogImageUrl ? [settings.seo.ogImageUrl] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const settings = await getSettings();
  const { rates } = await getRates();

  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ScrollProgress />
        <AnalyticsConsent lang={lang} />
        <CurrencyProvider rates={rates} lang={lang}>
        <Header
          lang={lang}
          brand={dict.brand}
          nav={dict.nav}
          language={dict.language}
          serviceGroups={groupServices(dict.services).map((group) => ({
            heading: group.heading,
            items: group.items.map(({ slug, title }) => ({ slug, title })),
          }))}
          allServicesLabel={dict.services.all}
        />
        <AdSlot position="top" lang={lang} />
        <main className="flex-1">{children}</main>
        <AdSlot position="bottom" lang={lang} />
        <Footer lang={lang} dict={dict} settings={settings} />
        <MobileTabBar lang={lang} labels={{ home: dict.nav.home, services: dict.nav.services, projects: dict.nav.projects, quote: dict.nav.quote }} />
        </CurrencyProvider>
      </body>
    </html>
  );
}
