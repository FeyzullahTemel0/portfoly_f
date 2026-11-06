import type { Locale } from "@/lib/locales";

// Referans vitrini, detay sayfası ve görsel büyüteci metinleri (sözlükten bağımsız, 5 dil).
export type ReferenceUi = {
  showcaseEyebrow: string;
  showcaseTitle: string;
  showcaseText: string;
  viewCase: string;
  allReferences: string;
  back: string;
  visitLive: string;
  about: string;
  features: string;
  featuresText: string;
  tech: string;
  gallery: string;
  galleryText: string;
  tapToZoom: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  others: string;
  badge: string;
  location: string;
  allLocations: string;
  noLocationResults: string;
  lightbox: { close: string; zoomIn: string; zoomOut: string; reset: string; previous: string; next: string; hint: string };
};

export const referenceUi: Record<Locale, ReferenceUi> = {
  tr: {
    showcaseEyebrow: "Referanslarımız",
    showcaseTitle: "Birlikte büyüdüğümüz markalar",
    showcaseText: "Bir logoya dokunun; projenin hikâyesini, ekranlarını ve sonuçlarını inceleyin.",
    viewCase: "Projeyi incele",
    allReferences: "Tüm referanslar",
    back: "Tüm referanslar",
    visitLive: "Canlı siteyi ziyaret et",
    about: "Proje hikâyesi",
    features: "Neler yaptık?",
    featuresText: "İşletmenin ihtiyacını netleştirip ekranların her birini satışa ve güvene hizmet edecek şekilde tasarladık.",
    tech: "Kullanılan yaklaşım",
    gallery: "Ekran görüntüleri",
    galleryText: "Görsellere dokunarak büyütebilir, yakınlaştırıp ayrıntıları inceleyebilirsiniz.",
    tapToZoom: "Büyütmek için dokunun",
    ctaTitle: "Sıradaki başarı hikâyesi sizin olsun",
    ctaText: "İşletmenizi internette en güçlü hâline taşıyalım. Hedefinizi anlatın, size özel bir yol haritası hazırlayalım.",
    ctaButton: "Ücretsiz teklif alın",
    others: "Diğer referanslarımız",
    badge: "Referans projesi",
    location: "Konuma göre filtrele",
    allLocations: "Tüm konumlar",
    noLocationResults: "Bu konumda referans bulunamadı.",
    lightbox: { close: "Kapat", zoomIn: "Yakınlaştır", zoomOut: "Uzaklaştır", reset: "Sığdır", previous: "Önceki görsel", next: "Sonraki görsel", hint: "Kaydırarak gezin, tekerlek veya iki parmakla yakınlaştırın" },
  },
  en: {
    showcaseEyebrow: "Our references",
    showcaseTitle: "Brands we grow with",
    showcaseText: "Tap a logo to explore the project story, the screens and the results.",
    viewCase: "View project",
    allReferences: "All references",
    back: "All references",
    visitLive: "Visit the live site",
    about: "Project story",
    features: "What we delivered",
    featuresText: "We clarified the business needs and designed every screen to support sales and trust.",
    tech: "Our approach",
    gallery: "Screenshots",
    galleryText: "Tap any image to enlarge it, zoom in and inspect the details.",
    tapToZoom: "Tap to enlarge",
    ctaTitle: "Let your business be the next success story",
    ctaText: "Let's take your business online at its strongest. Tell us your goal and we will prepare a tailored roadmap.",
    ctaButton: "Get a free quote",
    others: "More references",
    badge: "Reference project",
    location: "Filter by location",
    allLocations: "All locations",
    noLocationResults: "No references found in this location.",
    lightbox: { close: "Close", zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Fit", previous: "Previous image", next: "Next image", hint: "Drag to pan, use the wheel or pinch to zoom" },
  },
  de: {
    showcaseEyebrow: "Unsere Referenzen",
    showcaseTitle: "Marken, mit denen wir wachsen",
    showcaseText: "Tippen Sie auf ein Logo und entdecken Sie Projektgeschichte, Screens und Ergebnisse.",
    viewCase: "Projekt ansehen",
    allReferences: "Alle Referenzen",
    back: "Alle Referenzen",
    visitLive: "Live-Website besuchen",
    about: "Projektgeschichte",
    features: "Was wir umgesetzt haben",
    featuresText: "Wir haben den Bedarf des Unternehmens geklärt und jeden Screen auf Verkauf und Vertrauen ausgerichtet.",
    tech: "Unser Ansatz",
    gallery: "Screenshots",
    galleryText: "Tippen Sie auf ein Bild, um es zu vergrößern und Details zu prüfen.",
    tapToZoom: "Zum Vergrößern tippen",
    ctaTitle: "Ihre Erfolgsgeschichte ist die nächste",
    ctaText: "Bringen wir Ihr Unternehmen online in Bestform. Nennen Sie uns Ihr Ziel, wir erstellen eine passende Roadmap.",
    ctaButton: "Kostenloses Angebot anfragen",
    others: "Weitere Referenzen",
    badge: "Referenzprojekt",
    location: "Nach Standort filtern",
    allLocations: "Alle Standorte",
    noLocationResults: "Keine Referenzen an diesem Standort gefunden.",
    lightbox: { close: "Schließen", zoomIn: "Vergrößern", zoomOut: "Verkleinern", reset: "Einpassen", previous: "Vorheriges Bild", next: "Nächstes Bild", hint: "Zum Verschieben ziehen, per Mausrad oder Pinch zoomen" },
  },
  fr: {
    showcaseEyebrow: "Nos références",
    showcaseTitle: "Les marques avec lesquelles nous grandissons",
    showcaseText: "Touchez un logo pour découvrir l’histoire du projet, les écrans et les résultats.",
    viewCase: "Voir le projet",
    allReferences: "Toutes les références",
    back: "Toutes les références",
    visitLive: "Visiter le site en ligne",
    about: "Histoire du projet",
    features: "Ce que nous avons réalisé",
    featuresText: "Nous avons clarifié les besoins de l’entreprise et conçu chaque écran pour servir la vente et la confiance.",
    tech: "Notre approche",
    gallery: "Captures d’écran",
    galleryText: "Touchez une image pour l’agrandir, zoomer et examiner les détails.",
    tapToZoom: "Touchez pour agrandir",
    ctaTitle: "Votre entreprise sera la prochaine réussite",
    ctaText: "Mettons votre entreprise en ligne sous son meilleur jour. Décrivez-nous votre objectif et nous préparerons une feuille de route sur mesure.",
    ctaButton: "Obtenir un devis gratuit",
    others: "Autres références",
    badge: "Projet de référence",
    location: "Filtrer par lieu",
    allLocations: "Tous les lieux",
    noLocationResults: "Aucune référence trouvée dans ce lieu.",
    lightbox: { close: "Fermer", zoomIn: "Zoom avant", zoomOut: "Zoom arrière", reset: "Ajuster", previous: "Image précédente", next: "Image suivante", hint: "Faites glisser pour naviguer, zoomez à la molette ou avec deux doigts" },
  },
  ar: {
    showcaseEyebrow: "أعمالنا",
    showcaseTitle: "علامات نكبر معها",
    showcaseText: "اضغطوا على أي شعار لاستكشاف قصة المشروع وشاشاته ونتائجه.",
    viewCase: "عرض المشروع",
    allReferences: "كل الأعمال",
    back: "كل الأعمال",
    visitLive: "زيارة الموقع المباشر",
    about: "قصة المشروع",
    features: "ماذا أنجزنا؟",
    featuresText: "حددنا احتياجات النشاط التجاري وصممنا كل شاشة لتخدم المبيعات وتبني الثقة.",
    tech: "أسلوب عملنا",
    gallery: "لقطات الشاشة",
    galleryText: "اضغطوا على أي صورة لتكبيرها وفحص التفاصيل.",
    tapToZoom: "اضغط للتكبير",
    ctaTitle: "لتكن قصة النجاح التالية قصتكم",
    ctaText: "لنوصل نشاطكم إلى الإنترنت بأقوى صورة. أخبرونا بهدفكم ونعد لكم خطة مخصصة.",
    ctaButton: "احصلوا على عرض مجاني",
    others: "أعمال أخرى",
    badge: "مشروع مرجعي",
    location: "تصفية حسب الموقع",
    allLocations: "كل المواقع",
    noLocationResults: "لم يتم العثور على أعمال في هذا الموقع.",
    lightbox: { close: "إغلاق", zoomIn: "تكبير", zoomOut: "تصغير", reset: "ملاءمة", previous: "الصورة السابقة", next: "الصورة التالية", hint: "اسحبوا للتنقل واستخدموا العجلة أو إصبعين للتكبير" },
  },
};
