// Reklam alanları IAB standart boyutlarına göre tanımlanır (genişlik x yükseklik, piksel).
export const AD_POSITIONS = {
  top: { label: "Üst banner (Leaderboard)", help: "Sayfanın en üstü, menünün altı.", desktop: [728, 90], mobile: [320, 100] },
  middle: { label: "Orta banner (Billboard)", help: "Sayfa bölümleri arasında geniş alan.", desktop: [970, 250], mobile: [300, 250] },
  rectangle: { label: "Dikdörtgen kutu (Medium Rectangle)", help: "İçerik içi kutu; hizmet ve referans listelerinde.", desktop: [300, 250], mobile: [300, 250] },
  sidebar: { label: "Yan sütun (Half Page)", help: "İletişim ve hizmet detay sayfalarında yan sütun.", desktop: [300, 600], mobile: [300, 250] },
  bottom: { label: "Alt banner (Leaderboard)", help: "Alt bilginin hemen üstü.", desktop: [728, 90], mobile: [320, 100] },
} as const;

export type AdPosition = keyof typeof AD_POSITIONS;
export const adPositionKeys = Object.keys(AD_POSITIONS) as AdPosition[];

export const AD_PAGES = [
  { key: "all", label: "Tüm sayfalar" },
  { key: "home", label: "Ana sayfa" },
  { key: "services", label: "Hizmetler listesi" },
  { key: "service", label: "Hizmet detay sayfaları" },
  { key: "projects", label: "Projeler" },
  { key: "references", label: "Referanslar" },
  { key: "about", label: "Hakkımızda" },
  { key: "team", label: "Ekibimiz" },
  { key: "contact", label: "İletişim" },
  { key: "packages", label: "Paketler" },
  { key: "process", label: "Süreç" },
  { key: "legal", label: "Yasal sayfalar" },
] as const;

export const adPageKeys = AD_PAGES.map((page) => page.key) as string[];

export function isAdPosition(value: string): value is AdPosition {
  return value in AD_POSITIONS;
}

// /tr/services/xyz gibi bir yoldan reklam sayfa anahtarı üretir.
export function pageKeyFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[1];
  if (!section) return "home";
  if (section === "services") return parts[2] ? "service" : "services";
  if (section === "projects" || section === "references") return section;
  return adPageKeys.includes(section) ? section : "other";
}
