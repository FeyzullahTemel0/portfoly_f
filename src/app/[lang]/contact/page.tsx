import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FiMail, FiMapPin, FiNavigation, FiPhone } from "react-icons/fi";
import { AdSlot } from "@/components/ad-slot";
import { ContactForms } from "@/components/contact-forms";
import { MapEmbed } from "@/components/map-embed";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { socialColors, socialIcons } from "@/components/social-icons";
import { getDictionary, getSettings } from "@/dictionaries";
import { isLocale, type Locale } from "@/lib/locales";
import { localizedAlternates } from "@/lib/seo";
import { getSocialItems, safeUrl } from "@/lib/site";

const copy: Record<Locale, { quick: string; whatsapp: string; call: string; mail: string; location: string; openMap: string; channels: string; showMap: string; mapNote: string }> = {
  tr: { quick: "Hemen ulaşın", whatsapp: "WhatsApp'tan yazın", call: "Hemen arayın", mail: "E-posta gönderin", location: "Konum", openMap: "Haritada aç", channels: "Sosyal medya ve mesajlaşma", showMap: "Haritayı göster", mapNote: "Harita Google Maps'ten yüklenir; göster dediğinizde Google ile veri paylaşımı başlar." },
  en: { quick: "Reach us now", whatsapp: "Chat on WhatsApp", call: "Call now", mail: "Send an email", location: "Location", openMap: "Open in Maps", channels: "Social media & messaging", showMap: "Show map", mapNote: "The map loads from Google Maps; data is shared with Google once you show it." },
  de: { quick: "Direkt erreichbar", whatsapp: "Per WhatsApp schreiben", call: "Jetzt anrufen", mail: "E-Mail senden", location: "Standort", openMap: "In Karten öffnen", channels: "Social Media & Messenger", showMap: "Karte anzeigen", mapNote: "Die Karte wird von Google Maps geladen; beim Anzeigen werden Daten an Google übermittelt." },
  fr: { quick: "Contactez-nous", whatsapp: "Écrire sur WhatsApp", call: "Appeler maintenant", mail: "Envoyer un e-mail", location: "Adresse", openMap: "Ouvrir dans Maps", channels: "Réseaux sociaux et messageries", showMap: "Afficher la carte", mapNote: "La carte est chargée depuis Google Maps ; des données sont partagées avec Google une fois affichée." },
  ar: { quick: "تواصلوا معنا الآن", whatsapp: "راسلونا على واتساب", call: "اتصلوا الآن", mail: "أرسلوا بريدًا", location: "الموقع", openMap: "افتح في الخرائط", channels: "وسائل التواصل والمراسلة", showMap: "إظهار الخريطة", mapNote: "تُحمّل الخريطة من Google Maps وتُشارك البيانات مع Google عند إظهارها." },
};

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { contact, brand } = await getDictionary(lang);
  return { title: `${contact.title} | ${brand.name} ${brand.suffix}`, description: contact.text, alternates: localizedAlternates(lang, "/contact") };
}

export default async function ContactPage({ params, searchParams }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const query = await searchParams;
  const dict = await getDictionary(lang);
  const settings = await getSettings();
  const { contact } = dict;
  const text = copy[lang];

  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const requestedService = first(query.service);
  const initialService = dict.services.items.some((item) => item.slug === requestedService) ? requestedService : undefined;
  const initialPackage = first(query.package)?.slice(0, 80);

  const socials = getSocialItems(settings);
  const whatsapp = socials.find((item) => item.key === "whatsapp");
  const others = socials.filter((item) => item.key !== "whatsapp");
  const phoneHref = settings.phone ? `tel:${settings.phone.replace(/[^\d+]/g, "")}` : "";
  const address = settings.address[lang] || settings.address.tr;
  const mapQuery = encodeURIComponent(settings.address.tr || address);
  const mapsLink = safeUrl(settings.mapsUrl) || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const quick = [
    whatsapp && { key: "whatsapp", href: whatsapp.href, label: text.whatsapp, sub: settings.phone, icon: socialIcons.whatsapp, color: "#25D366", external: true },
    phoneHref && { key: "call", href: phoneHref, label: text.call, sub: settings.phone, icon: FiPhone, color: "var(--accent)", external: false },
    settings.email && { key: "mail", href: `mailto:${settings.email}`, label: text.mail, sub: settings.email, icon: FiMail, color: "var(--accent-2)", external: false },
  ].filter(Boolean) as { key: string; href: string; label: string; sub: string; icon: React.ElementType; color: string; external: boolean }[];

  return (
    <>
      <section aria-label={text.quick} className="relative border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent">{text.quick}</p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {quick.map(({ key, href, label, sub, icon: Icon, color, external }) => (
              <li key={key}>
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="card-glow flex items-center gap-4 rounded-2xl border border-border bg-background p-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg" style={{ background: color }}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold">{label}</span>
                    <span className="block truncate text-sm text-muted" dir="ltr">{sub}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {others.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold text-muted">{text.channels}</p>
              <ul className="flex flex-wrap gap-2" aria-label={contact.social}>
                {others.map((social) => {
                  const Icon = socialIcons[social.key];
                  if (!Icon) return null;
                  return (
                    <li key={social.key}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium transition-colors hover:border-accent"
                      >
                        <Icon className="h-4 w-4" style={{ color: socialColors[social.key] }} aria-hidden="true" />
                        {social.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      <PageHero title={contact.title} text={contact.text} />

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactForms
            lang={lang}
            form={dict.contactForm}
            services={dict.services.items.map(({ slug, title }) => ({ slug, title }))}
            sizes={dict.process.page.sizes}
            initialService={initialService}
            initialPackage={initialPackage}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-start gap-3 p-5">
                <FiMapPin className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted">{text.location}</p>
                  <p className="font-semibold">{address}</p>
                </div>
              </div>
              <MapEmbed query={settings.address.tr || address} lang={lang} title={text.location} showLabel={text.showMap} note={text.mapNote} />
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 border-t border-border p-3 text-sm font-semibold text-accent hover:bg-background">
                <FiNavigation className="h-4 w-4" aria-hidden="true" /> {text.openMap}
              </a>
            </div>
          </Reveal>
          <AdSlot position="sidebar" lang={lang} className="!px-0 !py-0" />
        </aside>
      </section>
    </>
  );
}
