import type { Dictionary } from "@/dictionaries/tr";
import { getCatalogCategory, serviceCategories, type ServiceCategory } from "@/lib/service-catalog";

export type ServiceGroup = {
  key: ServiceCategory;
  heading: string;
  items: Dictionary["services"]["items"];
};

// Hizmetleri web, otomasyon ve e-ticaret katalog kategorilerine ayırır.
export function groupServices(services: Dictionary["services"]): ServiceGroup[] {
  return serviceCategories
    .map((key) => ({
      key,
      heading: services.groups[key],
      items: services.items.filter((item) => ((item as { catalogCategory?: ServiceCategory }).catalogCategory ?? getCatalogCategory(item.slug)) === key),
    }))
    .filter((group) => group.items.length > 0);
}
