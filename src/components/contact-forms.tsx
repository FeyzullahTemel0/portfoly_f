"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FiArrowRight, FiCheck, FiMail, FiPhone, FiSend, FiUser } from "react-icons/fi";
import type { Dictionary } from "@/dictionaries/tr";
import type { Locale } from "@/lib/locales";
import { submitMessage, submitQuote, type FormState } from "@/app/[lang]/contact/actions";

type FormLabels = Dictionary["contactForm"];

type QuoteProps = {
  lang: Locale;
  form: FormLabels;
  services: { slug: string; title: string }[];
  sizes: { name: string; text: string }[];
  ui: { contactStep: string; badges: string[] };
  initialService?: string;
  initialPackage?: string;
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/30 sm:text-sm";
const iconInputClass = `${inputClass} ps-11`;
const labelClass = "mb-1.5 block text-sm font-medium";
const initialState: FormState = { ok: false };

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p role="alert" className="mt-1 text-xs text-red-500">
      {message}
    </p>
  ) : null;
}

function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function IconField({
  id,
  name,
  label,
  icon: Icon,
  type = "text",
  defaultValue,
  autoComplete,
  error,
  autoFocus,
  className = "",
}: {
  id: string;
  name: string;
  label: string;
  icon: React.ElementType;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  error?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input id={id} name={name} type={type} defaultValue={defaultValue} autoComplete={autoComplete} autoFocus={autoFocus} className={iconInputClass} />
      </div>
      <FieldError message={error} />
    </div>
  );
}

function Consent({ lang, form, error }: { lang: Locale; form: FormLabels; error?: string }) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-muted">
        <input type="checkbox" name="noticeAcknowledged" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]" />
        <span>
          {form.consent.before}
          <Link href={`/${lang}/legal/kvkk`} target="_blank" className="font-medium text-accent hover:underline">
            {form.consent.link}
          </Link>
          {form.consent.after}
        </span>
      </label>
      <FieldError message={error} />
    </div>
  );
}

function SubmitButton({ pending, label, sending }: { pending: boolean; label: string; sending: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="button-primary group inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl px-8 text-base font-semibold transition disabled:opacity-60"
    >
      {pending ? sending : label}
      {!pending && <FiArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />}
    </button>
  );
}

function Success({ message }: { message: string }) {
  return (
    <div role="status" className="rounded-3xl border border-accent/40 bg-surface p-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-accent-foreground shadow-lg shadow-accent/30">
        <FiCheck className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="mt-4 text-lg font-semibold">{message}</p>
    </div>
  );
}

function StepTitle({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-3 text-base font-bold">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-extrabold text-accent-foreground">
        {index}
      </span>
      {children}
    </span>
  );
}

export function QuoteForm({ lang, form, services, sizes, ui, initialService, initialPackage }: QuoteProps) {
  const [state, action, pending] = useActionState(submitQuote.bind(null, lang), initialState);
  const labels = form.quote;
  const values = state.values ?? {};
  const selectedServices = (values.services as string[] | undefined) ?? (initialService ? [initialService] : []);
  const errors = state.errors ?? {};

  if (state.ok) return <Success message={state.message ?? form.success.quote} />;

  const sizeOptions = [
    ...sizes.map((size, index) => ({ value: String(index), name: size.name, text: size.text })),
    { value: "unsure", name: labels.sizeUnsure, text: "" },
  ];

  return (
    <form action={action} className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-accent/5" noValidate>
      <Honeypot />
      <input type="hidden" name="package" value={initialPackage ?? ""} />
      <div aria-hidden="true" className="h-1 bg-gradient-to-r from-accent to-accent-2" />

      <div className="border-b border-border p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{labels.title}</h2>
        <p className="mt-2 text-muted">{labels.text}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {ui.badges.map((badge) => (
            <li key={badge} className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <FiCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {badge}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-8 p-6 sm:p-8">
        <fieldset>
          <legend className="mb-1 w-full"><StepTitle index={1}>{labels.services}</StepTitle></legend>
          <p className="mb-4 ms-10 text-xs text-muted">{labels.servicesHint}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {services.map((service) => (
              <label
                key={service.slug}
                className="group flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all hover:border-accent/70 active:scale-[0.99] has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
              >
                <input type="checkbox" name="services" value={service.slug} defaultChecked={selectedServices.includes(service.slug)} className="sr-only" />
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border text-transparent transition-colors group-has-[:checked]:border-accent group-has-[:checked]:bg-accent group-has-[:checked]:text-accent-foreground">
                  <FiCheck className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="font-medium">{service.title}</span>
              </label>
            ))}
          </div>
          <FieldError message={errors.services} />
        </fieldset>

        <fieldset>
          <legend className="mb-4 w-full"><StepTitle index={2}>{labels.size}</StepTitle></legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sizeOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer flex-col justify-center rounded-xl border border-border bg-background p-3 text-sm transition-all hover:border-accent/70 active:scale-[0.98] has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
              >
                <input type="radio" name="size" value={option.value} defaultChecked={(values.size ?? "unsure") === option.value} className="sr-only" />
                <span className="block font-semibold">{option.name}</span>
                {option.text && <span className="mt-0.5 block text-xs text-muted">{option.text}</span>}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <p className="mb-4"><StepTitle index={3}>{ui.contactStep}</StepTitle></p>
          <div className="grid gap-4 sm:grid-cols-2">
            <IconField id="q-name" name="name" label={labels.name} icon={FiUser} defaultValue={values.name as string} autoComplete="name" error={errors.name} />
            <IconField id="q-email" name="email" label={labels.email} icon={FiMail} type="email" defaultValue={values.email as string} autoComplete="email" error={errors.email} />
            <IconField id="q-phone" name="phone" label={labels.phone} icon={FiPhone} type="tel" defaultValue={values.phone as string} autoComplete="tel" error={errors.phone} className="sm:col-span-2" />
            <div className="sm:col-span-2">
              <label htmlFor="q-details" className={labelClass}>{labels.details}</label>
              <textarea id="q-details" name="details" rows={5} defaultValue={values.details as string} className={inputClass} />
            </div>
          </div>
        </div>

        <Consent lang={lang} form={form} error={errors.consent} />
        {state.message && <p role="alert" className="text-sm text-red-500">{state.message}</p>}
        <SubmitButton pending={pending} label={labels.submit} sending={form.sending} />
      </div>
    </form>
  );
}

export function MessageForm({ lang, form }: { lang: Locale; form: FormLabels }) {
  const [state, action, pending] = useActionState(submitMessage.bind(null, lang), initialState);
  const labels = form.message;
  const values = state.values ?? {};
  const errors = state.errors ?? {};

  if (state.ok) return <Success message={state.message ?? form.success.message} />;

  return (
    <form action={action} className="relative space-y-5" noValidate>
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <IconField id="m-name" name="name" label={labels.name} icon={FiUser} defaultValue={values.name as string} autoComplete="name" error={errors.name} autoFocus />
        <IconField id="m-email" name="email" label={labels.email} icon={FiMail} type="email" defaultValue={values.email as string} autoComplete="email" error={errors.email} />
        <div className="sm:col-span-2">
          <label htmlFor="m-kind" className={labelClass}>{labels.kind}</label>
          <select id="m-kind" name="kind" defaultValue={(values.kind as string) ?? "0"} className={inputClass}>
            {labels.kinds.map((kind, index) => (
              <option key={kind} value={index}>{kind}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="m-message" className={labelClass}>{labels.message}</label>
          <textarea id="m-message" name="message" rows={6} defaultValue={values.message as string} className={inputClass} />
          <FieldError message={errors.message} />
        </div>
      </div>

      <Consent lang={lang} form={form} error={errors.consent} />
      {state.message && <p role="alert" className="text-sm text-red-500">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="button-primary inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl px-8 text-base font-semibold transition disabled:opacity-60"
      >
        {pending ? form.sending : labels.submit}
        {!pending && <FiSend className="h-5 w-5 rtl:-scale-x-100" aria-hidden="true" />}
      </button>
    </form>
  );
}
