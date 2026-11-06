import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/locales";

export const dynamic = "force-dynamic";

export default async function ProjectsRedirect({ params }: PageProps<"/[lang]/projects">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  redirect(`/${lang}/references`);
}
