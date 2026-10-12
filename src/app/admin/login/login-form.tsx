"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-accent";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">E-posta</label>
        <input id="email" name="email" type="email" required autoComplete="username" defaultValue={state.email} className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Şifre</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-accent px-6 font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
