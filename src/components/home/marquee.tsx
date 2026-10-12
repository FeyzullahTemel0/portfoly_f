export function Marquee({ items }: { items: string[] }) {
  return (
    <div aria-hidden="true" className="overflow-hidden border-y border-border bg-surface py-4">
      <div className="animate-marquee flex w-max whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-10 pr-10">
            {items.map((item, index) => (
              <span key={`${copy}-${index}`} className="flex items-center gap-10 text-sm font-medium text-muted">
                {item}
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
