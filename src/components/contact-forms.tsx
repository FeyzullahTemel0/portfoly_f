"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Dictionary } from "@/dictionaries/tr";
import type { Locale } from "@/lib/locales";
import { submitMessage, submitQuote, type FormState } from "@/app/[lang]/contact/actions";

type Props = {
  lang: Locale;
  form: Dictionary["contactForm"];
  services: { slug: string; title: string }[];
  sizes: { name: string; text: string }[];
  initialService?: string;
  initialPackage?: string;
};

const inputClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30 sm:text-sm";
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

function Consent({ lang, form, error }: { lang: Locale; form: Props["form"]; error?: string }) {
  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-muted">
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
      className="button-primary inline-flex h-14 w-full items-center justify-center rounded-xl px-8 font-semibold transition disabled:opacity-60 sm:h-12 sm:w-auto"
    >
      {pending ? sending : label}
    </button>
  );
}

function Success({ message }: { message: string }) {
  return (
    <div role="status" className="rounded-xl border border-accent/40 bg-background p-6 text-center">
      <p className="text-lg font-semibold text-accent">✓</p>
      <p className="mt-2">{message}</p>
    </div>
  );
}

function QuoteForm({ lang, form, services, sizes, initialService, initialPackage }: Props) {
  const [state, action, pending] = useActionState(submitQuote.bind(null, lang), initialState);
  const labels = form.quote;
  const values = state.values ?? {};
  const selectedServices = (values.services as string[] | undefined) ?? (initialService ? [initialService] : []);
  const errors = state.errors ?? {};

  if (state.ok) return <Success message={state.message ?? form.success.quote} />;

  return (
    <form action={action} className="relative space-y-6" noValidate>
      <Honeypot />
      <input type="hidden" name="package" value={initialPackage ?? ""} />

      <fieldset>
        <legend className={labelClass}>{labels.services}</legend>
        <p className="mb-3 text-xs text-muted">{labels.servicesHint}</p>
        <div className="flex flex-wrap gap-2">
          {services.map((service) => (
            <label
              key={service.slug}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-accent active:scale-95 has-[:checked]:border-accent has-[:checked]:bg-accent/15 has-[:checked]:font-semibold has-[:checked]:text-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
            >
              <input
                type="checkbox"
                name="services"
                value={service.slug}
                defaultChecked={selectedServices.includes(service.slug)}
                className="sr-only"
              />
              {service.title}
            </label>
          ))}
        </div>
        <FieldError message={errors.services} />
      </fieldset>

      <fieldset>
        <legend className={labelClass}>{labels.size}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[...sizes.map((size, index) => ({ value: String(index), name: size.name, text: size.text })), { value: "unsure", name: labels.sizeUnsure, text: "" }].map(
            (option) => (
              <label
                key={option.value}
                className="cursor-pointer rounded-xl border border-border bg-background p-3 text-sm transition-colors hover:border-accent active:scale-[0.98] has-[:checked]:border-accent has-[:checked]:bg-accent/15"
              >
                <input
                  type="radio"
                  name="size"
                  value={option.value}
                  defaultChecked={(values.size ?? "unsure") === option.value}
                  className="sr-only"
                />
                <span className="block font-medium">{option.name}</span>
                {option.text && <span className="mt-0.5 block text-xs text-muted">{option.text}</span>}
              </label>
            ),
          )}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className={labelClass}>{labels.name}</label>
          <input id="q-name" name="name" defaultValue={values.name as string} autoComplete="name" className={inputClass} />
          <FieldError message={errors.name} />
        </div>
        <div>
          <label htmlFor="q-email" className={labelClass}>{labels.email}</label>
          <input id="q-email" name="email" type="email" defaultValue={values.email as string} autoComplete="email" className={inputClass} />
          <FieldError message={errors.email} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-phone" className={labelClass}>{labels.phone}</label>
          <input id="q-phone" name="phone" type="tel" defaultValue={values.phone as string} autoComplete="tel" className={inputClass} />
          <FieldError message={errors.phone} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-details" className={labelClass}>{labels.details}</label>
          <textarea id="q-details" name="details" rows={5} defaultValue={values.details as string} className={inputClass} />
        </div>
      </div>

      <Consent lang={lang} form={form} error={errors.consent} />
      {state.message && <p role="alert" className="text-sm text-red-500">{state.message}</p>}
      <SubmitButton pending={pending} label={labels.submit} sending={form.sending} />
    </form>
  );
}

function MessageForm({ lang, form }: Pick<Props, "lang" | "form">) {
  const [state, action, pending] = useActionState(submitMessage.bind(null, lang), initialState);
  const labels = form.message;
  const values = state.values ?? {};
  const errors = state.errors ?? {};

  if (state.ok) return <Success message={state.message ?? form.success.message} />;

  return (
    <form action={action} className="relative space-y-6" noValidate>
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="m-name" className={labelClass}>{labels.name}</label>
          <input id="m-name" name="name" defaultValue={values.name as string} autoComplete="name" className={inputClass} />
          <FieldError message={errors.name} />
        </div>
        <div>
          <label htmlFor="m-email" className={labelClass}>{labels.email}</label>
          <input id="m-email" name="email" type="email" defaultValue={values.email as string} autoComplete="email" className={inputClass} />
          <FieldError message={errors.email} />
        </div>
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
          <textarea id="m-message" name="message" rows={5} defaultValue={values.message as string} className={inputClass} />
          <FieldError message={errors.message} />
        </div>
      </div>

      <Consent lang={lang} form={form} error={errors.consent} />
      {state.message && <p role="alert" className="text-sm text-red-500">{state.message}</p>}
      <SubmitButton pending={pending} label={labels.submit} sending={form.sending} />
    </form>
  );
}

function Panel({ open, onToggle, title, text, children, id }: { open: boolean; onToggle: () => void; title: string; text: string; children: React.ReactNode; id: string }) {
  return (
    <section className={`overflow-hidden rounded-2xl border bg-surface transition-colors ${open ? "border-accent/60 shadow-lg shadow-accent/10" : "border-border"}`}>
      <h2>
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 p-5 text-start sm:p-6"
        >
          <span>
            <span className="block text-lg font-bold sm:text-xl">{title}</span>
            <span className="mt-1 block text-sm font-normal text-muted">{text}</span>
          </span>
          <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-xl leading-none transition-transform duration-300 ${open ? "rotate-45 border-accent text-accent" : ""}`}>+</span>
        </button>
      </h2>
      <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="border-t border-border p-5 sm:p-6" inert={!open}>{children}</div>
        </div>
      </div>
    </section>
  );
}

export function ContactForms(props: Props) {
  const [open, setOpen] = useState<"quote" | "message" | null>("quote");
  const { form } = props;

  return (
    <div className="space-y-4">
      <Panel id="quote" open={open === "quote"} onToggle={() => setOpen(open === "quote" ? null : "quote")} title={form.quote.title} text={form.quote.text}>
        <QuoteForm {...props} />
      </Panel>
      <Panel id="message" open={open === "message"} onToggle={() => setOpen(open === "message" ? null : "message")} title={form.message.title} text={form.message.text}>
        <MessageForm lang={props.lang} form={form} />
      </Panel>
    </div>
  );
}
