import Image from "next/image";

export function BrandMark() {
  return (
    <span aria-hidden="true" className="relative inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-md border border-border bg-[#f5f4ed]">
      <Image
        src="/temeloji-logo.jpeg"
        alt=""
        width={1024}
        height={1024}
        sizes="72px"
        className="absolute left-1/2 top-[-0.75rem] h-[4.5rem] w-[4.5rem] max-w-none -translate-x-1/2 object-cover"
      />
    </span>
  );
}

export function BrandImage({ className = "", loading = "lazy" }: { className?: string; loading?: "eager" | "lazy" }) {
  return (
    <Image
      src="/temeloji-logo.jpeg"
      alt="Temeloji Dijital"
      width={1024}
      height={1024}
      sizes="160px"
      loading={loading}
      className={`h-32 w-32 object-contain ${className}`}
    />
  );
}