import { FiActivity, FiCloud, FiDatabase, FiMonitor } from "react-icons/fi";
import type { Locale } from "@/lib/locales";

const copy = {
  tr: {
    eyebrow: "ARAYÜZ KONSEPTİ",
    title: "İşinize göre tasarlanan, modern bir masaüstü deneyimi.",
    description: "Uygulama ekranları kodlamadan önce görsel olarak tasarlanır. Aşağıdaki çalışma, projeye özel arayüzün nasıl ele alınabileceğini gösteren bir konsepttir.",
    app: "Operasyon Merkezi",
    navigation: ["Genel Bakış", "İş Kayıtları", "Raporlar", "Ayarlar"],
    greeting: "Günaydın, çalışma alanınız hazır.",
    metrics: ["Açık kayıt", "Bugün tamamlanan", "Bekleyen işlem"],
    records: "Son İşlemler",
    table: ["Bakım planı", "Stok sayımı", "Müşteri kaydı"],
    statuses: ["İşlemde", "Tamamlandı", "Yeni"],
    report: "Haftalık İş Özeti",
    storage: "Veri altyapısı",
    local: "Yerel veya bulut",
    frameworks: "İhtiyaca göre teknoloji seçimi",
    note: "Arayüz konseptidir; teslim edilmiş müşteri projesi değildir.",
  },
  en: {
    eyebrow: "INTERFACE CONCEPT",
    title: "A modern desktop experience, designed around your work.",
    description: "Application screens are designed visually before development. This concept illustrates how a custom interface for your project could take shape.",
    app: "Operations Center",
    navigation: ["Overview", "Work records", "Reports", "Settings"],
    greeting: "Good morning, your workspace is ready.",
    metrics: ["Open records", "Completed today", "Pending tasks"],
    records: "Recent Activity",
    table: ["Maintenance plan", "Stock count", "Customer record"],
    statuses: ["In progress", "Completed", "New"],
    report: "Weekly Summary",
    storage: "Data setup",
    local: "Local or cloud",
    frameworks: "Technology chosen for your needs",
    note: "Interface concept only; not a completed client project.",
  },
  de: {
    eyebrow: "INTERFACE-KONZEPT",
    title: "Eine moderne Desktop-Anwendung, passend zu Ihren Abläufen.",
    description: "Die Anwendungsoberflächen werden vor der Entwicklung visuell entworfen. Dieses Konzept zeigt beispielhaft eine mögliche individuelle Gestaltung.",
    app: "Betriebszentrale",
    navigation: ["Übersicht", "Vorgänge", "Berichte", "Einstellungen"],
    greeting: "Guten Morgen, Ihr Arbeitsbereich ist bereit.",
    metrics: ["Offene Vorgänge", "Heute erledigt", "Ausstehend"],
    records: "Letzte Vorgänge",
    table: ["Wartungsplan", "Inventur", "Kundendatensatz"],
    statuses: ["In Bearbeitung", "Erledigt", "Neu"],
    report: "Wochenübersicht",
    storage: "Datenspeicherung",
    local: "Lokal oder Cloud",
    frameworks: "Technologie passend zum Bedarf",
    note: "Interface-Konzept, kein abgeschlossenes Kundenprojekt.",
  },
  fr: {
    eyebrow: "CONCEPT D’INTERFACE",
    title: "Une application de bureau moderne, pensée pour votre activité.",
    description: "Les écrans sont conçus visuellement avant le développement. Ce concept illustre une interface qui pourrait être adaptée à votre projet.",
    app: "Centre des opérations",
    navigation: ["Vue d’ensemble", "Dossiers", "Rapports", "Paramètres"],
    greeting: "Bonjour, votre espace de travail est prêt.",
    metrics: ["Dossiers ouverts", "Terminés aujourd’hui", "En attente"],
    records: "Activité récente",
    table: ["Plan de maintenance", "Inventaire", "Fiche client"],
    statuses: ["En cours", "Terminé", "Nouveau"],
    report: "Bilan hebdomadaire",
    storage: "Stockage des données",
    local: "Local ou cloud",
    frameworks: "Technologie choisie selon vos besoins",
    note: "Concept d’interface, pas un projet client livré.",
  },
  ar: {
    eyebrow: "تصور للواجهة",
    title: "تجربة تطبيق مكتبي حديثة تناسب طريقة عملكم.",
    description: "نصمم شاشات التطبيق بصريًا قبل بدء البرمجة. يوضح هذا النموذج تصورًا أوليًا لواجهة يمكن تخصيصها لمشروعكم.",
    app: "مركز العمليات",
    navigation: ["نظرة عامة", "سجلات العمل", "التقارير", "الإعدادات"],
    greeting: "صباح الخير، مساحة العمل جاهزة.",
    metrics: ["سجلات مفتوحة", "مكتمل اليوم", "قيد الانتظار"],
    records: "أحدث الأنشطة",
    table: ["خطة الصيانة", "جرد المخزون", "سجل العميل"],
    statuses: ["قيد التنفيذ", "مكتمل", "جديد"],
    report: "ملخص الأسبوع",
    storage: "تخزين البيانات",
    local: "محلي أو سحابي",
    frameworks: "اختيار التقنية وفق احتياجاتكم",
    note: "تصور للواجهة وليس مشروعًا منجزًا لعميل.",
  },
} satisfies Record<Locale, {
  eyebrow: string;
  title: string;
  description: string;
  app: string;
  navigation: string[];
  greeting: string;
  metrics: string[];
  records: string;
  table: string[];
  statuses: string[];
  report: string;
  storage: string;
  local: string;
  frameworks: string;
  note: string;
}>;

export function DesktopSoftwareShowcase({ lang }: { lang: Locale }) {
  const text = copy[lang];

  return (
    <section aria-labelledby="desktop-showcase-title" className="border-y border-border bg-surface/60 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-accent">{text.eyebrow}</p>
          <h2 id="desktop-showcase-title" className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{text.title}</h2>
          <p className="mt-4 leading-7 text-muted">{text.description}</p>
          <div className="mt-6 flex flex-wrap gap-2" aria-label={text.frameworks}>
            {["Python", "CustomTkinter", "PySide6"].map((technology) => (
              <span key={technology} className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold">{technology}</span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">{text.frameworks}. {text.note}</p>
        </div>

        <div className="min-w-0">
          <div className="group overflow-hidden rounded-xl border border-border bg-background shadow-2xl transition-transform duration-500 hover:-translate-y-1">
            <div className="flex h-10 items-center justify-between border-b border-border bg-background px-3 sm:px-4">
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-md bg-accent text-accent-foreground"><FiMonitor aria-hidden="true" /></span>
                <span className="text-xs font-semibold">{text.app}</span>
              </div>
              <div className="flex gap-1.5" aria-hidden="true"><span className="size-2 rounded-full bg-amber-400" /><span className="size-2 rounded-full bg-emerald-500" /><span className="size-2 rounded-full bg-rose-400" /></div>
            </div>
            <div className="grid min-h-64 grid-cols-[92px_minmax(0,1fr)] sm:grid-cols-[132px_minmax(0,1fr)]">
              <div className="space-y-1 border-r border-border bg-surface/70 p-2 sm:p-3">
                {text.navigation.map((label, itemIndex) => (
                  <div key={label} className={`truncate rounded-md px-2 py-2 text-[9px] sm:px-2.5 sm:text-[11px] ${itemIndex === 0 ? "bg-accent/15 font-semibold text-accent" : "text-muted"}`}>
                    {label}
                  </div>
                ))}
              </div>
              <div className="min-w-0 p-3 sm:p-5">
                <p className="truncate text-[10px] font-semibold text-muted sm:text-xs">{text.greeting}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
                  {text.metrics.map((label, metricIndex) => (
                    <div key={label} className="min-w-0 rounded-md border border-border p-2 sm:p-3">
                      <span className="block truncate text-[7px] text-muted sm:text-[9px]">{label}</span>
                      <span className="mt-1 block text-sm font-bold sm:text-lg">{["24", "08", "03"][metricIndex]}</span>
                      <span className="mt-1 block h-1 w-3/4 rounded-full bg-accent/50" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-border p-2.5 sm:mt-4 sm:p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[9px] font-semibold sm:text-[11px]">{text.records}</span>
                    <FiActivity className="size-3 shrink-0 text-accent" aria-hidden="true" />
                  </div>
                  <div className="mt-2 space-y-2">
                    {text.table.map((record, rowIndex) => (
                      <div key={record} className="flex min-w-0 items-center gap-2 border-t border-border/70 pt-2 text-[7px] sm:text-[9px]">
                        <span className="min-w-0 flex-1 truncate">{record}</span>
                        <span className={`shrink-0 rounded px-1.5 py-0.5 ${rowIndex === 0 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : rowIndex === 1 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-sky-500/15 text-sky-700 dark:text-sky-300"}`}>{text.statuses[rowIndex]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-background p-3 sm:p-4">
              <div className="flex items-center gap-2 text-accent"><FiDatabase aria-hidden="true" /><span className="text-[10px] font-semibold text-foreground sm:text-xs">{text.storage}</span></div>
              <p className="mt-2 text-xs text-muted">{text.local}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-3 sm:p-4">
              <div className="flex items-center gap-2 text-emerald-600"><FiCloud aria-hidden="true" /><span className="text-[10px] font-semibold text-foreground sm:text-xs">{text.report}</span></div>
              <div className="mt-2 flex h-5 items-end gap-1" aria-hidden="true">
                {[45, 75, 55, 100, 68, 84, 60].map((height, barIndex) => (
                  <span key={barIndex} className="flex-1 rounded-t-sm bg-emerald-500/70 transition-all duration-500 group-hover:bg-accent" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}