import type { IconType } from "react-icons";
import { FiActivity, FiBell, FiBox, FiCalendar, FiCheckCircle, FiCode, FiCpu, FiDollarSign, FiEdit3, FiFileText, FiGrid, FiHardDrive, FiHeart, FiImage, FiLayout, FiLifeBuoy, FiLink, FiMonitor, FiPackage, FiPenTool, FiShoppingBag, FiShoppingCart, FiSliders, FiSmartphone, FiTarget, FiTruck, FiUsers, FiZap } from "react-icons/fi";

const serviceIcons: Record<string, IconType> = {
  "corporate-website": FiLayout,
  "shopier-ecommerce": FiShoppingBag,
  "booking-systems": FiCalendar,
  "personal-blog": FiEdit3,
  "custom-software": FiCode,
  "admin-panel": FiSliders,
  "windows-desktop-apps": FiCpu,
  "crm-panel": FiUsers,
  "comprehensive-ecommerce": FiShoppingCart,
  "clinic-automation": FiActivity,
  "dietitian-beauty-software": FiHeart,
  "inventory-warehouse": FiPackage,
  "car-gallery-platform": FiTruck,
  "staff-tracking": FiUsers,
  "finance-cash-management": FiDollarSign,
  "api-integrations": FiLink,
  "landing-pages": FiTarget,
  "qr-menu": FiGrid,
  "desktop-bookkeeping": FiMonitor,
  "task-goal-tracking": FiCheckCircle,
  "pdf-invoice-automation": FiFileText,
  "customer-reminders": FiBell,
  "backup-file-organizer": FiHardDrive,
  "mobile-app-development": FiSmartphone,
  "mvp-development": FiZap,
  "saas-development": FiGrid,
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
