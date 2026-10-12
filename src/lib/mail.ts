import "server-only";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

type Notification = { subject: string; lines: [string, string][] };

// RESEND_API_KEY tanımlı değilse bildirim sessizce atlanır; talepler yine veritabanına kaydedilir.
export async function sendNotification(to: string, { subject, lines }: Notification) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return;

  const html = lines
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value).replace(/\n/g, "<br>")}</p>`)
    .join("");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || "Temeloji Dijital <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
  } catch (error) {
    console.error("Bildirim e-postası gönderilemedi:", error);
  }
}
