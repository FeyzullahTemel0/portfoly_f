import type { IconType } from "react-icons";
import { FiBox, FiCalendar, FiCode, FiCpu, FiEdit3, FiImage, FiLayout, FiLifeBuoy, FiMonitor, FiPenTool, FiShoppingBag, FiSliders, FiSmartphone, FiTarget, FiUsers, FiZap } from "react-icons/fi";

const serviceIcons: Record<string, IconType> = {
  "corporate-website": FiLayout,
  "shopier-ecommerce": FiShoppingBag,
  "booking-systems": FiCalendar,
  "personal-blog": FiEdit3,
  "custom-software": FiCode,
  "admin-panel": FiSliders,
  "windows-desktop-apps": FiCpu,
  "crm-panel": FiUsers,
  "web-design-mockup": FiMonitor,
  "advertising-design": FiTarget,
  "poster-design": FiImage,
  "digital-platform-design": FiPenTool,
};

const whyIcons: IconType[] = [FiZap, FiSmartphone, FiSliders, FiLifeBuoy];

export const serviceIconKeys = Object.keys(serviceIcons);

// Yönetim panelinde seçilen ikon varsa onu, yoksa hizmet adresine göre ikonu kullanır.
export const iconKey = (item: { slug: string; icon?: string }) => item.icon || item.slug;

export function ServiceIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = serviceIcons[slug] ?? FiBox;
  return <Icon className={className} aria-hidden="true" />;
}

export function WhyIcon({ index, className }: { index: number; className?: string }) {
  const Icon = whyIcons[index % whyIcons.length];
  return <Icon className={className} aria-hidden="true" />;
}
