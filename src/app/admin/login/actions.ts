"use server";

import { redirect } from "next/navigation";
import { startSession, verifyPassword } from "@/lib/auth";
import { getCredentials } from "@/lib/admin-account";
import { recordSecurityEvent } from "@/lib/access-log";
import { getClientIp, hashIp, isRateLimited, recordAttempt, shouldReportRateLimit } from "@/lib/request";

export type LoginState = { error?: string; email?: string };

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const key = `login:${hashIp(await getClientIp())}`;

  if (isRateLimited(key, MAX_FAILURES)) {
    if (shouldReportRateLimit(key, WINDOW_MS)) await recordSecurityEvent("login_rate_limited");
    return { error: "Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.", email };
  }

  const credentials = await getCredentials();
  if (!credentials || !process.env.AUTH_SECRET) {
    console.error("Admin login configuration is incomplete.");
    return { error: "Yönetici girişi şu anda kullanılamaz. Lütfen daha sonra tekrar deneyin." };
  }
  const adminEmail = credentials.email;
  const adminHash = credentials.hash;

  // Şifre kontrolü e-posta yanlış olsa da çalışır; böylece yanıt süresi bilgi sızdırmaz.
  const passwordOk = verifyPassword(password, adminHash);
  if (email !== adminEmail || !passwordOk) {
    recordAttempt(key, WINDOW_MS);
    await recordSecurityEvent("login_failed");
    return { error: "E-posta veya şifre hatalı.", email };
  }

  await recordSecurityEvent("login_success");
  await startSession(email);
  redirect("/admin");
}
