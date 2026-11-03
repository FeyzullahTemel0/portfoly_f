import Image from "next/image";

// Küçük alanlarda (mobil üst bar, yükleme, yönetim paneli) kare RX amblemi kullanılır.
export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-flex shrink-0 overflow-hidden rounded-xl ring-1 ring-accent/40 ${className}`}>
      <Image src="/rovax-mini-logo.jpeg" alt="" fill sizes="96px" className="object-cover" />
    </span>
  );
}

// Geniş logo dosyasındaki amblem ve yazı bölgesi, bozulma olmadan yakınlaştırılarak kırpılır.
export function BrandImage({ className = "h-12", loading = "lazy", label = "Rovax Software" }: { className?: string; loading?: "eager" | "lazy"; label?: string }) {
  return (
    <span role="img" aria-label={label} className={`relative block aspect-[4.06/1] shrink-0 overflow-hidden rounded-xl bg-[#050a18] ring-1 ring-accent/30 ${className}`}>
      <Image
        src="/rovax-logo.jpeg"
        alt=""
        fill
        sizes="(min-width: 1024px) 640px, 480px"
        loading={loading}
        className="pointer-events-none select-none object-cover"
        style={{ transform: "scale(1.47)", transformOrigin: "49.5% 50%" }}
      />
    </span>
  );
}
