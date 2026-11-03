import Image from "next/image";
import { FiArrowUpRight } from "react-icons/fi";

export type AdContent = { sponsor: string; title: string; description: string; image: string };

// Görsel varsa görseli, yoksa başlık ve açıklamadan oluşan şık bir metin reklamını gösterir.
export function AdCardContent({ ad, sizes = "(min-width: 1024px) 600px, 100vw" }: { ad: AdContent; sizes?: string }) {
  if (ad.image) {
    return <Image src={ad.image} alt={ad.title || ad.sponsor} fill sizes={sizes} className="object-cover" unoptimized />;
  }
  return (
    <span className="absolute inset-0 flex items-center gap-3 bg-gradient-to-br from-[#0a2a8f] via-[#0a5cff] to-[#00a3d9] p-3 text-white sm:p-5">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[10px] font-semibold uppercase tracking-widest text-white/75">{ad.sponsor || "Sponsor"}</span>
        <span className="mt-0.5 block text-sm font-extrabold leading-tight sm:text-lg [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">{ad.title || ad.sponsor}</span>
        {ad.description && <span className="mt-1 hidden text-xs leading-snug text-white/85 sm:[display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">{ad.description}</span>}
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
        <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </span>
  );
}
