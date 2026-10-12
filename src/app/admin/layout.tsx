import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Yönetim Paneli | Temeloji Dijital",
  robots: { index: false, follow: false },
  icons: { icon: "/temeloji-logo.jpeg" },
};

// Sayfa açılmadan önce kayıtlı temayı uygulayarak renk titremesini önler.
const themeScript = `try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){}`;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
