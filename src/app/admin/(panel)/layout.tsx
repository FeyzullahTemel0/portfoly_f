import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Message } from "@/models/message";
import { Quote } from "@/models/quote";
import { AdminShell } from "./admin-shell";

async function getCounts() {
  try {
    await connectDb();
    const [quotes, messages] = await Promise.all([
      Quote.countDocuments({ status: "new" }),
      Message.countDocuments({ read: false }),
    ]);
    return { quotes, messages };
  } catch {
    return { quotes: 0, messages: 0 };
  }
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const email = await requireAdmin();
  const counts = await getCounts();
  return (
    <AdminShell email={email} counts={counts}>
      {children}
    </AdminShell>
  );
}
