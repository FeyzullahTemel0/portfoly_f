export const statusLabels: Record<string, string> = {
  new: "Yeni",
  contacted: "Görüşüldü",
  quoted: "Teklif verildi",
  won: "Kazanıldı",
  lost: "Kaybedildi",
};

export const statusClasses: Record<string, string> = {
  new: "bg-accent/15 text-accent",
  contacted: "bg-amber-500/15 text-amber-500",
  quoted: "bg-violet-500/15 text-violet-500",
  won: "bg-emerald-500/15 text-emerald-500",
  lost: "bg-red-500/15 text-red-500",
};

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
