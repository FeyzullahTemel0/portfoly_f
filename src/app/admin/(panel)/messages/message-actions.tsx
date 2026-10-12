"use client";

import { useTransition } from "react";
import { FiCheck, FiMail, FiTrash2 } from "react-icons/fi";
import { deleteMessage, setMessageRead } from "../actions";

export function MessageActions({ id, read, email }: { id: string; read: boolean; email: string }) {
  const [pending, startTransition] = useTransition();
  const buttonClass =
    "inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-wrap gap-2">
      <a href={`mailto:${email}`} className={`${buttonClass} hover:border-accent hover:text-accent`}>
        <FiMail className="h-4 w-4" aria-hidden="true" /> Yanıtla
      </a>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(async () => void (await setMessageRead(id, !read)))}
        className={`${buttonClass} hover:border-accent hover:text-accent`}
      >
        <FiCheck className="h-4 w-4" aria-hidden="true" /> {read ? "Okunmadı yap" : "Okundu yap"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Bu mesaj kalıcı olarak silinecek. Emin misiniz?")) {
            startTransition(async () => void (await deleteMessage(id)));
          }
        }}
        className={`${buttonClass} text-red-500 hover:border-red-500`}
      >
        <FiTrash2 className="h-4 w-4" aria-hidden="true" /> Sil
      </button>
    </div>
  );
}
