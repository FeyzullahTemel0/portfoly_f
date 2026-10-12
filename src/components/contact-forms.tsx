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
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";
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
        <input type="checkbox" name="noticeAcknowledged" className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
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
      className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-accent px-6 font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
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
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <label
              key={service.slug}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent/10"
            >
              <input
                type="checkbox"
                name="services"
                value={service.slug}
                defaultChecked={selectedServices.includes(service.slug)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {service.title}
            </label>
          ))}
        </div>
        <FieldError message={errors.services} />
      </fieldset>

      <fieldset>
        <legend className={labelClass}>{labels.size}</legend>
        <div className="grid gap-2 sm:grid-cols-4">
          {[...sizes.map((size, index) => ({ value: String(index), name: size.name, text: size.text })), { value: "unsure", name: labels.sizeUnsure, text: "" }].map(
            (option) => (
              <label
                key={option.value}
                className="cursor-pointer rounded-lg border border-border bg-background p-3 text-sm transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent/10"
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

export function ContactForms(props: Props) {
  const [tab, setTab] = useState<"quote" | "message">("quote");
  const { form } = props;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div role="tablist" className="mb-6 inline-flex rounded-lg border border-border bg-background p-1">
        {(["quote", "message"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === key ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {form.tabs[key]}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-bold tracking-normal">{tab === "quote" ? form.quote.title : form.message.title}</h2>
      <p className="mb-6 mt-1 text-sm text-muted">{tab === "quote" ? form.quote.text : form.message.text}</p>

      {tab === "quote" ? <QuoteForm {...props} /> : <MessageForm lang={props.lang} form={form} />}
    </div>
  );
}
