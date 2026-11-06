// Reklam konumları ve sayfa haritaları. Yatay konumlara en fazla 4 reklam (eşit genişlikte yan yana), dikey konuma tek reklam girer.
export const AD_SLOTS = {
  top: { label: "Üst banner", orientation: "horizontal", size: [1200, 120], help: "Menünün hemen altında, sayfanın en üstünde yatay banner." },
  middle: { label: "Orta banner", orientation: "horizontal", size: [1200, 160], help: "Sayfa içeriğinin ortasında geniş yatay banner." },
  lower: { label: "Alt orta banner", orientation: "horizontal", size: [1200, 160], help: "Sayfanın alt bölümünde, çağrı alanından önce yatay banner." },
  bottom: { label: "Alt şerit", orientation: "horizontal", size: [1200, 100], help: "Alt bilginin (footer) hemen üstünde yatay şerit." },
  sidebar: { label: "Dikey kenar", orientation: "vertical", size: [300, 600], help: "Yan sütunda tek reklam gösterilir." },
} as const;

export type AdSlotKey = keyof typeof AD_SLOTS;
export const adSlotKeys = Object.keys(AD_SLOTS) as AdSlotKey[];
export const MAX_HORIZONTAL = 4;

export const slotCapacity = (slot: AdSlotKey) => (AD_SLOTS[slot].orientation === "vertical" ? 1 : MAX_HORIZONTAL);

type Row = { kind: "chrome" | "box"; label: string } | { kind: "slot"; slot: AdSlotKey } | { kind: "split"; label: string; slot: AdSlotKey };

const simple = (label: string): Row[] => [
  { kind: "chrome", label: "Menü" },
  { kind: "slot", slot: "top" },
  { kind: "box", label },
  { kind: "slot", slot: "bottom" },
  { kind: "chrome", label: "Alt bilgi (footer)" },
];

export const AD_PAGES: { key: string; label: string; url: string; rows: Row[] }[] = [
  {
    key: "home",
    label: "Ana sayfa",
    url: "/",
    rows: [
      { kind: "chrome", label: "Menü" },
      { kind: "slot", slot: "top" },
      { kind: "chrome", label: "Karşılama alanı" },
      { kind: "box", label: "Hizmetler" },
      { kind: "slot", slot: "middle" },
      { kind: "box", label: "Neden Biz, Önemli Bilgiler ve değerlendirmeler" },
      { kind: "slot", slot: "lower" },
      { kind: "box", label: "İletişim çağrısı" },
      { kind: "slot", slot: "bottom" },
      { kind: "chrome", label: "Alt bilgi (footer)" },
    ],
  },
  {
    key: "services",
    label: "Hizmetler",
    url: "/services",
    rows: [
      { kind: "chrome", label: "Menü" },
      { kind: "slot", slot: "top" },
      { kind: "box", label: "Sayfa başlığı" },
      { kind: "slot", slot: "middle" },
      { kind: "box", label: "Hizmet listesi" },
      { kind: "slot", slot: "lower" },
      { kind: "slot", slot: "bottom" },
      { kind: "chrome", label: "Alt bilgi (footer)" },
    ],
  },
  {
    key: "service",
    label: "Hizmet detayı",
    url: "/services/…",
    rows: [
      { kind: "chrome", label: "Menü" },
      { kind: "slot", slot: "top" },
      { kind: "box", label: "Hizmet başlığı ve fiyat" },
      { kind: "split", label: "Hizmet detayları", slot: "sidebar" },
      { kind: "slot", slot: "bottom" },
      { kind: "chrome", label: "Alt bilgi (footer)" },
    ],
  },
  {
    key: "projects",
    label: "Eski Projeler → Referanslar",
    url: "/projects → /references",
    rows: [
      { kind: "chrome", label: "Menü" },
      { kind: "slot", slot: "top" },
      { kind: "box", label: "Sayfa başlığı" },
      { kind: "slot", slot: "middle" },
      { kind: "box", label: "Referans kartları" },
      { kind: "slot", slot: "bottom" },
      { kind: "chrome", label: "Alt bilgi (footer)" },
    ],
  },
  {
    key: "references",
    label: "Referanslar",
    url: "/references",
    rows: [
      { kind: "chrome", label: "Menü" },
      { kind: "slot", slot: "top" },
      { kind: "box", label: "Sayfa başlığı" },
      { kind: "slot", slot: "middle" },
      { kind: "box", label: "Referans kartları" },
      { kind: "slot", slot: "bottom" },
      { kind: "chrome", label: "Alt bilgi (footer)" },
    ],
  },
  {
    key: "insights",
    label: "Önemli Bilgiler",
    url: "/insights",
    rows: [
      { kind: "chrome", label: "Menü" },
      { kind: "slot", slot: "top" },
      { kind: "box", label: "Sayfa başlığı ve arama" },
      { kind: "slot", slot: "middle" },
      { kind: "box", label: "Makale listesi" },
      { kind: "slot", slot: "bottom" },
      { kind: "chrome", label: "Alt bilgi (footer)" },
    ],
  },
  {
    key: "contact",
    label: "İletişim",
    url: "/contact",
    rows: [
      { kind: "chrome", label: "Menü" },
      { kind: "slot", slot: "top" },
      { kind: "box", label: "Hızlı iletişim butonları" },
      { kind: "split", label: "Teklif ve mesaj formları", slot: "sidebar" },
      { kind: "slot", slot: "bottom" },
      { kind: "chrome", label: "Alt bilgi (footer)" },
    ],
  },
  { key: "about", label: "Hakkımızda", url: "/about", rows: simple("Sayfa içeriği") },
  { key: "team", label: "Ekibimiz", url: "/team", rows: simple("Ekip kartları") },
  { key: "packages", label: "Paketler", url: "/packages", rows: simple("Paket listesi") },
  { key: "process", label: "Süreç", url: "/process", rows: simple("Süreç adımları") },
  { key: "legal", label: "Yasal sayfalar", url: "/legal/…", rows: simple("Yasal metin") },
];

export const adPageKeys = AD_PAGES.map((page) => page.key);

export const placementKey = (page: string, slot: string) => `${page}:${slot}`;

export function relatedAdPlacements(placement: string) {
  const [page, slot] = placement.split(":");
  if (slot && (page === "projects" || page === "references")) return [`references:${slot}`, `projects:${slot}`];
  return [placement];
}

export function pageSlots(page: string): AdSlotKey[] {
  const found = AD_PAGES.find((item) => item.key === page);
  if (!found) return [];
  return found.rows.flatMap((row) => (row.kind === "slot" || row.kind === "split" ? [row.slot] : []));
}

export function isValidPlacement(value: string) {
  const [page, slot] = value.split(":");
  return !!page && !!slot && (pageSlots(page) as string[]).includes(slot);
}

export function placementLabel(value: string) {
  const [page, slot] = value.split(":");
  const pageLabel = AD_PAGES.find((item) => item.key === page)?.label ?? page;
  const slotLabel = slot in AD_SLOTS ? AD_SLOTS[slot as AdSlotKey].label : slot;
  return `${pageLabel} · ${slotLabel}`;
}

export function isAdSlot(value: string): value is AdSlotKey {
  return value in AD_SLOTS;
}

// Yatay konumda reklam sayısına göre önerilen görsel boyutu (eşit genişlik).
export function recommendedSize(slot: AdSlotKey, count: number): [number, number] {
  const [width, height] = AD_SLOTS[slot].size;
  return AD_SLOTS[slot].orientation === "vertical" ? [width, height] : [Math.round(width / Math.max(1, count)), height];
}

// /tr/services/xyz gibi bir yoldan reklam sayfa anahtarı üretir.
export function pageKeyFromPath(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[1];
  if (!section) return "home";
  if (section === "services") return parts[2] ? "service" : "services";
  if (section === "projects") return "references";
  return adPageKeys.includes(section) ? section : "other";
}
