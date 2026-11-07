type Props = { query: string; lang: string; title: string; className?: string };

export function MapEmbed({ query, lang, title, className = "h-72" }: Props) {
  return (
    <iframe
      title={title}
      src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=${lang}&z=14&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={`w-full border-0 ${className}`}
    />
  );
}
