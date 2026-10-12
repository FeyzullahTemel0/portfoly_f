import type { ReactNode } from "react";

export function AdminHeader({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-muted">{text}</p>}
      </div>
      {children}
    </div>
  );
}

export function DbError() {
  return (
    <p role="alert" className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
      Veritabanına bağlanılamadı. .env.local içindeki MONGODB_URI değerini ve Atlas Network Access (IP) ayarını kontrol edin.
    </p>
  );
}
