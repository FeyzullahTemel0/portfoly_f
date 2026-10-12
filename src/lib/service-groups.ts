import type { Dictionary } from "@/dictionaries/tr";

export type ServiceGroup = {
  key: string;
  heading: string;
  items: Dictionary["services"]["items"];
};

// Hizmetleri sözlükteki `group` alanına göre başlıklar altında toplar; boş gruplar atlanır.
export function groupServices(services: Dictionary["services"]): ServiceGroup[] {
  return (["software", "design"] as const)
    .map((key) => ({
      key,
      heading: services.groups[key],
      items: services.items.filter((item) => (item.group || "software") === key),
    }))
    .filter((group) => group.items.length > 0);
}
