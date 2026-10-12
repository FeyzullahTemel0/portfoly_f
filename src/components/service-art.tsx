import Image from "next/image";
import type { ReactNode } from "react";
import { FiCheck, FiFolder, FiGrid, FiSearch, FiSettings, FiShoppingBag } from "react-icons/fi";
import type { Locale } from "@/lib/locales";

type Props = { slug: string; image?: string; alt: string; className?: string; lang?: Locale };

const gradients: Record<string, string> = {
  "corporate-website": "from-cyan-500/25 to-teal-600/25",
  "shopier-ecommerce": "from-amber-400/30 to-rose-500/25",
  "booking-systems": "from-emerald-400/25 to-teal-500/25",
  "personal-blog": "from-sky-500/25 to-cyan-500/25",
  "custom-software": "from-slate-500/25 to-cyan-600/25",
  "admin-panel": "from-blue-500/25 to-cyan-400/25",
  "windows-desktop-apps": "from-sky-500/25 to-blue-700/25",
  "crm-panel": "from-orange-400/25 to-pink-500/25",
  "web-design-mockup": "from-cyan-500/25 to-teal-600/25",
  "advertising-design": "from-red-500/25 to-orange-400/25",
  "poster-design": "from-blue-600/25 to-sky-400/25",
  "digital-platform-design": "from-cyan-500/25 to-emerald-400/25",
};

const bar = "block rounded-full bg-foreground/15";
const card = "rounded-lg border border-border bg-background shadow-sm";
const lift = "transition-transform duration-500 ease-out group-hover:-translate-y-1.5";

function Window({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${card} overflow-hidden ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-border bg-surface px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
      </div>
      {children}
    </div>
  );
}

function Scene({ slug, lang }: { slug: string; lang: Locale }) {
  switch (slug) {
    case "corporate-website":
      return (
        <Window className={`w-[84%] ${lift}`}>
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3"><span className="text-[8px] font-black sm:text-[10px]">{lang === "tr" ? "MARKA ADINIZ" : "YOUR BRAND"}</span><div className="flex gap-2">{[0, 1, 2].map((item) => <span key={item} className="h-1 w-5 rounded-full bg-foreground/15 sm:w-7" />)}</div></div>
            <div className="mt-3 rounded-lg bg-gradient-to-br from-accent/25 via-teal-500/15 to-emerald-400/25 p-3 sm:mt-4 sm:p-5">
              <span className="block text-[6px] font-semibold uppercase text-accent sm:text-[8px]">{lang === "tr" ? "İŞİNİZİ DAHA YAKINDAN TANIYIN" : "GET TO KNOW YOUR BUSINESS"}</span>
              <span className="mt-1.5 block max-w-[70%] text-[10px] font-bold leading-tight sm:text-sm">{lang === "tr" ? "Markanızı anlatan web deneyimi" : "A website that tells your story"}</span>
              <span className={`${bar} mt-2 h-1 w-2/3`} />
              <span className="mt-2 inline-block h-3 w-12 rounded-sm bg-accent sm:h-4 sm:w-16" />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2].map((item) => <div key={item} className="rounded border border-border p-2"><span className="block size-3 rounded bg-accent/20" /><span className={`${bar} mt-1.5 h-1 w-full`} /><span className={`${bar} mt-1 h-1 w-2/3`} /></div>)}
            </div>
          </div>
        </Window>
      );
    case "shopier-ecommerce":
      return (
        <div className={`relative w-[78%] ${lift}`}>
          <div className="absolute -left-2 -top-5 z-10 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px] font-bold shadow-md sm:-left-4 sm:-top-6 sm:px-3 sm:text-xs">
            <FiShoppingBag className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            shopier
          </div>
          <div className="grid w-[88%] grid-cols-3 gap-2">
            {["group-hover:-translate-y-1", "group-hover:-translate-y-2", "group-hover:-translate-y-3"].map((hover) => (
              <div key={hover} className={`${card} p-2 transition-transform duration-500 ${hover}`}>
                <span className="block h-12 rounded bg-[#dce9e6]" />
                <span className={`${bar} mt-2 h-1.5 w-full`} />
                <span className="mt-1.5 block h-3 w-8 rounded bg-accent" />
              </div>
            ))}
          </div>
          <div className="absolute -bottom-4 right-[-2%] w-[34%] rounded-lg border border-border bg-background p-2 shadow-xl transition-transform duration-500 group-hover:-translate-y-1 sm:-bottom-5">
            <div className="flex items-center gap-1.5 border-b border-border pb-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-accent"><FiShoppingBag className="h-3 w-3" aria-hidden="true" /></span>
              <span className="text-[8px] font-semibold sm:text-[9px]">{lang === "tr" ? "Shopier satıcı" : "Shopier seller"}</span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded bg-surface px-1.5 py-1.5">
              <span className="text-[7px] text-muted sm:text-[8px]">{lang === "tr" ? "Yeni sipariş" : "New order"}</span>
              <FiCheck className="h-3 w-3 text-accent" aria-hidden="true" />
            </div>
          </div>
          <span className="absolute -right-1 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background shadow-lg sm:-right-2 sm:h-7 sm:w-7 sm:text-[10px]">3</span>
        </div>
      );
    case "booking-systems":
      return (
        <Window className={`w-[84%] ${lift}`}>
          <div className="grid grid-cols-[1.1fr_0.9fr] gap-3 p-3 sm:gap-4 sm:p-4">
            <div>
              <div className="flex items-center justify-between text-[8px] font-semibold sm:text-[10px]">
                <span>{lang === "tr" ? "Randevu takvimi" : "Booking calendar"}</span>
                <span className="text-accent">{lang === "tr" ? "Haziran" : "June"}</span>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[6px] text-muted sm:text-[8px]">
                {(lang === "tr" ? ["P", "S", "Ç", "P", "C", "C", "P"] : ["M", "T", "W", "T", "F", "S", "S"]).map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: 21 }).map((_, index) => <span key={index} className={`grid aspect-square place-items-center rounded text-[6px] sm:text-[8px] ${index === 10 ? "bg-accent font-bold text-accent-foreground" : index === 5 || index === 16 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-surface text-muted"}`}>{index + 1}</span>)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[7px] font-semibold sm:text-[9px]"><span>{lang === "tr" ? "Bugünkü randevular" : "Today's bookings"}</span><span className="text-muted">08</span></div>
              {[["09:30", "Ayşe K."], ["11:00", "Mert A."], ["14:30", "Deniz T."]].map(([time, name], index) => (
                <div key={time} className="rounded border border-border p-1.5 text-[6px] sm:p-2 sm:text-[8px]">
                  <span className="block font-semibold">{time} · {name}</span>
                  <span className={`mt-1 block h-1 w-2/3 rounded-full ${index === 1 ? "bg-emerald-500/60" : "bg-accent/50"}`} />
                </div>
              ))}
            </div>
          </div>
        </Window>
      );
    case "personal-blog":
      return (
        <Window className={`w-[84%] ${lift}`}>
          <div className="flex items-center justify-between border-b border-border px-3 py-2"><span className="text-[8px] font-black sm:text-[10px]">{lang === "tr" ? "UZMANLIK NOTLARI" : "FIELD NOTES"}</span><div className="flex gap-2">{[0, 1, 2].map((item) => <span key={item} className="h-1 w-5 rounded-full bg-foreground/15" />)}</div></div>
          <div className="grid grid-cols-[1fr_0.8fr] gap-3 p-3 sm:gap-4 sm:p-4">
            <div className="min-w-0">
              <span className="text-[6px] font-semibold text-accent sm:text-[8px]">{lang === "tr" ? "YENİ YAZI · 5 DK OKUMA" : "NEW ARTICLE · 5 MIN READ"}</span>
              <span className="mt-1.5 block text-[9px] font-bold leading-tight sm:text-xs">{lang === "tr" ? "Deneyiminizi paylaşmanın yeni yolları" : "New ways to share your experience"}</span>
              <span className={`${bar} mt-2 h-1 w-full`} />
              <span className={`${bar} mt-1 h-1 w-5/6`} />
              <span className={`${bar} mt-1 h-1 w-2/3`} />
              <span className="mt-2 inline-block h-3 w-12 rounded-sm bg-accent/80 sm:h-4 sm:w-16" />
            </div>
            <div className="aspect-[4/3] rounded-md bg-[linear-gradient(145deg,#0f766e_0%,#5eead4_48%,#f1f5f9_49%,#cbd5e1_100%)]" />
          </div>
        </Window>
      );
    case "custom-software":
      return (
        <Window className={`w-[84%] ${lift}`}>
          <div className="grid grid-cols-[0.65fr_1.35fr]">
            <div className="space-y-2 bg-surface p-2 text-[7px] text-muted sm:p-3 sm:text-[9px]">
              <span className="block rounded bg-accent/15 p-1.5 font-semibold text-accent">{lang === "tr" ? "İşlerim" : "My work"}</span>
              <span className="block p-1.5">{lang === "tr" ? "Müşteriler" : "Customers"}</span>
              <span className="block p-1.5">{lang === "tr" ? "Raporlar" : "Reports"}</span>
            </div>
            <div className="min-w-0 p-2.5 sm:p-4">
              <div className="flex items-center justify-between gap-2"><span className="truncate text-[8px] font-bold sm:text-[10px]">{lang === "tr" ? "Günlük iş takibi" : "Daily work tracker"}</span><FiSettings className="size-3 shrink-0 text-accent" /></div>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {(lang === "tr" ? ["Yeni", "Devam ediyor", "Bitti"] : ["New", "In progress", "Done"]).map((label, index) => <div key={label} className="rounded border border-border p-1.5"><span className="block truncate text-[6px] text-muted sm:text-[8px]">{label}</span><span className="mt-1 block text-[10px] font-bold sm:text-xs">{["12", "05", "28"][index]}</span></div>)}
              </div>
              <div className="mt-2 space-y-1.5 rounded border border-border p-2">
                {[0, 1, 2].map((row) => <div key={row} className="flex items-center gap-2 border-b border-border/70 pb-1.5 last:border-0 last:pb-0"><span className="h-1.5 w-1.5 rounded-full bg-accent" /><span className="h-1 flex-1 rounded-full bg-foreground/15" /><span className="h-1 w-5 rounded-full bg-emerald-500/50" /></div>)}
              </div>
            </div>
          </div>
        </Window>
      );
    case "admin-panel":
      return (
        <Window className={`w-[82%] ${lift}`}>
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between"><span className="text-[9px] font-bold sm:text-[11px]">{lang === "tr" ? "Site içerikleri" : "Website content"}</span><span className="rounded bg-accent px-2 py-1 text-[6px] font-semibold text-accent-foreground sm:text-[8px]">+ {lang === "tr" ? "Yeni ekle" : "Add new"}</span></div>
            <div className="mt-3 space-y-2">
              {(lang === "tr" ? ["Hakkımızda", "Hizmetlerimiz", "Yeni sezon duyurusu"] : ["About us", "Our services", "New season announcement"]).map((label, index) => (
                <div key={label} className="flex items-center gap-2 rounded border border-border p-2">
                  <span className={`size-6 shrink-0 rounded ${["bg-emerald-500/20", "bg-sky-500/20", "bg-amber-500/20"][index]}`} />
                  <span className="min-w-0 flex-1 truncate text-[7px] font-medium sm:text-[9px]">{label}</span>
                  <span className="shrink-0 text-[6px] text-emerald-600 sm:text-[8px]">{lang === "tr" ? "Yayında" : "Published"}</span>
                </div>
              ))}
            </div>
          </div>
        </Window>
      );
    case "windows-desktop-apps":
      return (
        <div className={`relative aspect-[16/10] w-[88%] overflow-hidden rounded-xl border border-white/30 bg-[#146c9d] shadow-2xl ${lift}`}>
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_68%_36%,rgba(89,190,219,0.9),transparent_34%),radial-gradient(ellipse_at_72%_88%,rgba(11,53,111,0.9),transparent_46%),linear-gradient(135deg,#075985,#2563a8_48%,#0f426d)]" />
          <div className="absolute left-2 top-2 grid gap-2 text-[6px] text-white sm:left-3 sm:top-3 sm:gap-3 sm:text-[8px]">
            <span className="flex w-8 flex-col items-center gap-1 sm:w-10"><FiGrid className="h-4 w-4 sm:h-5 sm:w-5" />{lang === "tr" ? "Bilgisayar" : "Computer"}</span>
            <span className="flex w-8 flex-col items-center gap-1 sm:w-10"><FiFolder className="h-4 w-4 text-amber-200 sm:h-5 sm:w-5" />{lang === "tr" ? "Belgeler" : "Documents"}</span>
          </div>
          <div className="absolute bottom-[9%] left-[16%] right-[5%] top-[9%] overflow-hidden rounded-md border border-slate-300 bg-white shadow-xl sm:left-[17%] sm:right-[7%] sm:top-[10%]">
            <div className="flex h-5 items-center justify-between bg-slate-100 px-2 text-[6px] text-slate-600 sm:h-7 sm:px-3 sm:text-[8px]">
              <span className="flex items-center gap-1"><span className="grid size-3 place-items-center rounded-sm bg-sky-700 text-[6px] text-white">T</span> {lang === "tr" ? "İş Takip" : "Work Tracker"}</span>
              <span className="flex gap-2 text-slate-500"><span>−</span><span>□</span><span>×</span></span>
            </div>
            <div className="flex h-[calc(100%-1.25rem)] sm:h-[calc(100%-1.75rem)]">
              <div className="w-[22%] space-y-2 bg-slate-800 p-2 text-[6px] text-slate-200 sm:space-y-3 sm:p-3 sm:text-[8px]">
                <span className="block rounded bg-sky-600 px-1 py-1">{lang === "tr" ? "Genel bakış" : "Overview"}</span>
                <span className="block">{lang === "tr" ? "Kayıtlar" : "Records"}</span>
                <span className="block">{lang === "tr" ? "Raporlar" : "Reports"}</span>
              </div>
              <div className="min-w-0 flex-1 bg-slate-50 p-2 sm:p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-bold text-slate-800 sm:text-[10px]">{lang === "tr" ? "Günlük iş özeti" : "Daily overview"}</span>
                  <FiSettings className="h-2.5 w-2.5 text-slate-400 sm:h-3 sm:w-3" />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 sm:mt-3 sm:gap-2">
                  {(lang === "tr" ? ["Yeni kayıt", "İşlemde", "Tamamlandı"] : ["New", "In progress", "Complete"]).map((label, index) => (
                    <div key={label} className="rounded border border-slate-200 bg-white p-1 sm:p-2">
                      <span className="block truncate text-[5px] text-slate-500 sm:text-[7px]">{label}</span>
                      <span className={`mt-1 block h-1 w-2/3 rounded-full ${index === 2 ? "bg-emerald-500" : "bg-sky-600"}`} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-1 sm:mt-3 sm:space-y-1.5">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center gap-1 border-b border-slate-200 pb-1 sm:gap-2">
                      <span className="h-1 w-[28%] rounded-full bg-slate-300" />
                      <span className="h-1 flex-1 rounded-full bg-slate-200" />
                      <span className={`h-1 w-5 rounded-full ${row === 1 ? "bg-amber-400" : "bg-emerald-400"}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex h-[7%] items-center justify-center gap-2 bg-slate-900/75 text-white sm:gap-3">
            <FiGrid className="h-2.5 w-2.5 text-sky-300 sm:h-3.5 sm:w-3.5" />
            <span className="flex h-[58%] w-[24%] items-center gap-1 rounded-sm bg-white/15 px-1 text-[5px] text-white/70 sm:text-[7px]"><FiSearch className="h-2 w-2 sm:h-2.5 sm:w-2.5" />{lang === "tr" ? "Ara" : "Search"}</span>
            <FiFolder className="h-2.5 w-2.5 text-amber-200 sm:h-3.5 sm:w-3.5" />
            <span className="size-2 rounded-sm bg-sky-400 sm:size-2.5" />
          </div>
        </div>
      );
    case "crm-panel":
      return (
        <Window className={`w-[86%] ${lift}`}>
          <div className="grid grid-cols-3 gap-2 p-2.5 sm:gap-3 sm:p-4">
            {(lang === "tr" ? ["Yeni talep", "Görüşüldü", "Teklif verildi"] : ["New enquiry", "Contacted", "Quoted"]).map((stage, column) => (
              <div key={stage} className="min-w-0 rounded-md bg-surface p-1.5 sm:p-2">
                <div className="flex items-center justify-between gap-1"><span className="truncate text-[6px] font-semibold sm:text-[8px]">{stage}</span><span className="text-[6px] text-muted">0{column + 2}</span></div>
                {Array.from({ length: column === 1 ? 2 : 1 }).map((_, row) => <div key={row} className="mt-2 rounded border border-border bg-background p-1.5"><span className={`mx-auto grid size-4 place-items-center rounded-full text-[6px] font-bold ${column === 2 ? "bg-emerald-500/20 text-emerald-700" : "bg-accent/15 text-accent"}`}>{["A", "M", "D"][column]}</span><span className="mt-1 block h-1 rounded-full bg-foreground/15" /><span className="mt-1 block h-1 w-2/3 rounded-full bg-foreground/10" /></div>)}
              </div>
            ))}
          </div>
        </Window>
      );
    case "web-design-mockup":
      return (
        <div className={`relative w-[74%] ${lift}`}>
          <div className={`${card} space-y-2 border-dashed p-3`}>
            <span className="block h-10 rounded border border-dashed border-foreground/30" />
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => <span key={i} className="h-7 rounded border border-dashed border-foreground/30" />)}
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 flex gap-1 rounded-full border border-border bg-background p-1.5 shadow-lg">
            {["bg-accent", "bg-teal-500", "bg-sky-500", "bg-amber-400"].map((c) => <span key={c} className={`h-4 w-4 rounded-full ${c}`} />)}
          </div>
        </div>
      );
    case "advertising-design":
      return (
        <div className={`relative w-[56%] ${lift}`}>
          <div className="aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-orange-400 p-4 shadow-xl">
            <span className="block h-2.5 w-2/3 rounded-full bg-white/90" />
            <span className="mt-2 block h-2 w-1/2 rounded-full bg-white/60" />
            <span className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-black text-red-500 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">%</span>
          </div>
          <span className="absolute -left-6 top-6 h-14 w-14 rotate-[-8deg] rounded-lg border border-border bg-background shadow-lg" />
        </div>
      );
    case "poster-design":
      return (
        <div className={`relative h-52 w-[82%] max-w-md ${lift}`}>
          <div aria-hidden="true" className="absolute bottom-[16%] right-[-4%] h-8 w-[48%] rotate-[-8deg] rounded-full bg-[#c98e6a] shadow-md sm:h-10" />
          <div className="absolute left-[27%] top-[3%] z-10 aspect-[0.7] h-[88%] -rotate-3 overflow-hidden rounded-sm bg-white p-2 shadow-xl ring-1 ring-black/10 sm:p-3">
            <span className="inline-flex rounded-sm bg-rose-600 px-1 py-0.5 text-[6px] font-bold text-white sm:text-[8px]">{lang === "tr" ? "YENİ SEZON" : "NEW SEASON"}</span>
            <span className="mt-2 block text-[11px] font-black leading-none text-slate-900 sm:mt-3 sm:text-base">{lang === "tr" ? <>BİZE ÖZEL<br />FIRSATLAR</> : <>MADE FOR<br />YOUR EVENT</>}</span>
            <span className="mt-2 block h-[34%] rounded-sm bg-[linear-gradient(145deg,#f4c37a_0%,#e87d56_48%,#164e63_49%,#0f3443_100%)] sm:mt-3" />
            <span className="mt-2 block h-1 w-4/5 rounded-full bg-slate-300 sm:mt-3 sm:h-1.5" />
            <span className="mt-1 block h-1 w-3/5 rounded-full bg-slate-200 sm:h-1.5" />
            <span className="mt-2 inline-flex rounded-sm bg-slate-900 px-1.5 py-1 text-[5px] font-semibold text-white sm:mt-3 sm:px-2 sm:text-[7px]">{lang === "tr" ? "BİZİ ZİYARET EDİN" : "JOIN US"}</span>
          </div>
          <span aria-hidden="true" className="absolute bottom-[34%] left-[51%] z-20 h-5 w-9 rotate-[-18deg] rounded-full bg-[#e1ac84] shadow-sm sm:h-6 sm:w-12" />
          <span aria-hidden="true" className="absolute bottom-[9%] right-[8%] h-5 w-[40%] rotate-[-8deg] rounded-full bg-[#a96f52] sm:h-6" />
        </div>
      );
    case "digital-platform-design":
      return (
        <div className={`${card} w-[72%] overflow-hidden ${lift}`}>
          <div className="relative h-16 bg-[linear-gradient(115deg,#0f766e,#22c55e_55%,#f59e0b)] p-2 sm:h-20 sm:p-3"><span className="text-[7px] font-bold text-white sm:text-[9px]">{lang === "tr" ? "MARKA KAPAK TASARIMI" : "BRAND COVER DESIGN"}</span><span className="absolute bottom-2 right-3 h-5 w-1/3 rounded bg-white/30 sm:bottom-3 sm:h-6" /></div>
          <div className="relative px-3 pb-3 pt-7 sm:pt-8">
            <span className="absolute -top-5 left-3 grid size-10 place-items-center rounded-full border-2 border-background bg-accent text-xs font-black text-accent-foreground transition-transform duration-500 group-hover:rotate-12">T</span>
            <span className="block text-[8px] font-bold sm:text-[10px]">{lang === "tr" ? "Marka adınız" : "Your brand"}</span>
            <span className="mt-1 block text-[6px] text-muted sm:text-[8px]">{lang === "tr" ? "Profil ve paylaşım tasarımları" : "Profile and post visuals"}</span>
            <div className="mt-2 grid grid-cols-3 gap-1.5">{["bg-rose-400/70", "bg-amber-400/70", "bg-teal-500/70"].map((color) => <span key={color} className={`aspect-square rounded-sm ${color}`} />)}</div>
          </div>
        </div>
      );
    default:
      return <Window className={`w-[60%] ${lift}`}><span className="block h-16" /></Window>;
  }
}

// `image` verilirse (siteImages.services) çizim yerine o görsel gösterilir.
export function ServiceArt({ slug, image, alt, className = "", lang = "tr" }: Props) {
  return (
    <div
      className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br ${
        gradients[slug] ?? "from-accent/20 to-teal-500/20"
      } ${className}`}
    >
      {image ? (
        <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 400px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <>
          <div aria-hidden="true" className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]" />
          <div role="img" aria-label={alt} className="relative flex w-full items-center justify-center">
            <Scene slug={slug} lang={lang} />
          </div>
          <span className="absolute bottom-2 right-3 rounded-full border border-border bg-background/90 px-2 py-1 text-[8px] font-medium text-muted backdrop-blur sm:text-[9px]">
            {lang === "tr" ? "Görsel konsept" : "Visual concept"}
          </span>
        </>
      )}
    </div>
  );
}
