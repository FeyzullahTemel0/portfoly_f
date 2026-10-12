import Image from "next/image";
import type { PublicReference } from "@/lib/references";

export function ReferenceLogo({ reference }: { reference: PublicReference }) {
  if (reference.logoUrl) {
    return (
      <Image
        src={reference.logoUrl}
        alt={reference.name}
        width={160}
        height={80}
        className="h-16 w-auto max-w-full object-contain"
      />
    );
  }
  const initials = reference.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase())
    .join("");
  return (
    <span aria-label={reference.name} className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent/15 text-xl font-bold text-accent">
      {initials}
    </span>
  );
}
