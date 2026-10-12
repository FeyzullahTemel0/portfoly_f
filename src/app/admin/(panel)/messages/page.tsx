import { AdminHeader, DbError } from "@/components/admin/page-header";
import { formatDate } from "@/lib/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Message } from "@/models/message";
import { MessageActions } from "./message-actions";

export default async function MessagesPage() {
  await requireAdmin();

  let messages: { id: string; name: string; email: string; kind: string; message: string; read: boolean; createdAt: string }[] = [];
  let failed = false;
  try {
    await connectDb();
    const docs = await Message.find().sort({ createdAt: -1 }).limit(200).lean();
    messages = docs.map((m) => ({
      id: String(m._id),
      name: m.name,
      email: m.email,
      kind: m.kind,
      message: m.message,
      read: m.read,
      createdAt: m.createdAt.toISOString(),
    }));
  } catch {
    failed = true;
  }

  return (
    <>
      <AdminHeader title="Mesajlar" text="Dilek, öneri ve görüş formundan gelen mesajlar." />
      {failed && <DbError />}
      {!failed && messages.length === 0 && <p className="text-sm text-muted">Henüz mesaj yok.</p>}

      <ul className="space-y-4">
        {messages.map((message) => (
          <li
            key={message.id}
            className={`rounded-xl border bg-surface p-5 ${message.read ? "border-border" : "border-accent"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">
                  {message.name}
                  {!message.read && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">Yeni</span>}
                </p>
                <p className="text-xs text-muted">{message.email} · {formatDate(message.createdAt)}</p>
              </div>
              {message.kind && <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-accent">{message.kind}</span>}
            </div>
            <p className="mt-3 whitespace-pre-wrap leading-7">{message.message}</p>
            <div className="mt-4">
              <MessageActions id={message.id} read={message.read} email={message.email} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
