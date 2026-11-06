import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/locales";

export default async function ProjectDetailRedirect({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  void slug;
  redirect(`/${lang}/references`);
}
