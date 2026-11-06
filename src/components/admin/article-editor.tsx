"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image as TiptapImage } from "@tiptap/extension-image";
import type { JSONContent } from "@tiptap/core";
import { FiAlignCenter, FiAlignLeft, FiAlignRight, FiBold, FiCode, FiEdit3, FiHash, FiImage, FiItalic, FiLink, FiList, FiMessageSquare, FiMinus, FiType, FiUnderline } from "react-icons/fi";
import { uploadImage } from "@/components/admin/upload";

const toolbar = "flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted transition hover:border-accent hover:text-accent disabled:opacity-40";
const ArticleImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") || "center",
        renderHTML: (attributes) => ({ "data-align": attributes.align }),
      },
    };
  },
});

const imageExtension = ArticleImage.configure({
  inline: false,
  allowBase64: false,
  resize: { enabled: true, directions: ["bottom-right"], minWidth: 120, minHeight: 80, alwaysPreserveAspectRatio: true },
});

export function ArticleEditor({ value, onChange, direction }: { value: JSONContent; onChange: (value: JSONContent) => void; direction: "ltr" | "rtl" }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [imageMetaOpen, setImageMetaOpen] = useState(false);
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, imageExtension],
    content: value,
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
    editorProps: { attributes: { class: "article-editor min-h-[24rem] outline-none", dir: direction } },
  });

  async function addImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;
    setUploading(true);
    setMessage("");
    try {
      const bitmap = await createImageBitmap(file);
      const width = bitmap.width;
      const height = bitmap.height;
      bitmap.close();
      const stored = await uploadImage(file, "rovax/articles");
      editor.chain().focus().setImage({ src: stored.url, alt: file.name.replace(/\.[^.]+$/, ""), title: "", width, height }).run();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Görsel eklenemedi.");
    } finally {
      setUploading(false);
    }
  }

  function applyLink() {
    if (!editor) return;
    const value = linkValue.trim();
    if (!value) return;
    const href = /^https?:\/\//i.test(value) || value.startsWith("/") ? value : `https://${value}`;
    editor.chain().focus().setLink({ href, target: "_blank", rel: "noopener noreferrer" }).run();
    setLinkOpen(false);
    setLinkValue("");
  }

  if (!editor) return <div className="min-h-96 animate-pulse rounded-lg border border-border bg-background" />;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="sticky top-16 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-surface/95 p-2 backdrop-blur">
        <button type="button" className={toolbar} aria-label="Kalın" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><FiBold /></button>
        <button type="button" className={toolbar} aria-label="İtalik" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><FiItalic /></button>
        <button type="button" className={toolbar} aria-label="Altı çizili" aria-pressed={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><FiUnderline /></button>
        <span className="mx-1 h-6 w-px bg-border" />
        <button type="button" className={toolbar} aria-label="Başlık 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><FiType /></button>
        <button type="button" className={toolbar} aria-label="Başlık 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><span className="text-xs font-bold">H3</span></button>
        <button type="button" className={toolbar} aria-label="Madde işaretli liste" aria-pressed={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><FiList /></button>
        <button type="button" className={toolbar} aria-label="Numaralı liste" aria-pressed={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><FiHash /></button>
        <button type="button" className={toolbar} aria-label="Alıntı" onClick={() => editor.chain().focus().toggleBlockquote().run()}><FiMessageSquare /></button>
        <button type="button" className={toolbar} aria-label="Kod bloğu" onClick={() => editor.chain().focus().toggleCodeBlock().run()}><FiCode /></button>
        <button type="button" className={toolbar} aria-label="Ayırıcı çizgi" onClick={() => editor.chain().focus().setHorizontalRule().run()}><FiMinus /></button>
        <span className="mx-1 h-6 w-px bg-border" />
        <label className={`${toolbar} cursor-pointer ${uploading ? "pointer-events-none opacity-50" : ""}`} title={uploading ? "Yükleniyor" : "Metne görsel ekle"}>
              {uploading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" /> : <FiImage />}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="sr-only" onChange={addImage} disabled={uploading} />
        </label>
        <button type="button" className={toolbar} aria-label="Bağlantı ekle" onClick={() => setLinkOpen((open) => !open)}><FiLink /></button>
            {editor.isActive("image") && <><span className="mx-1 h-6 w-px bg-border" /><button type="button" className={toolbar} aria-label="Görseli sola hizala" onClick={() => editor.chain().focus().updateAttributes("image", { align: "left" }).run()}><FiAlignLeft /></button><button type="button" className={toolbar} aria-label="Görseli ortala" onClick={() => editor.chain().focus().updateAttributes("image", { align: "center" }).run()}><FiAlignCenter /></button><button type="button" className={toolbar} aria-label="Görseli sağa hizala" onClick={() => editor.chain().focus().updateAttributes("image", { align: "right" }).run()}><FiAlignRight /></button><button type="button" className={toolbar} aria-label="Görsel açıklamasını düzenle" onClick={() => { const attrs = editor.getAttributes("image"); setImageAlt(attrs.alt ?? ""); setImageCaption(attrs.title ?? ""); setImageMetaOpen((open) => !open); }}><FiEdit3 /></button></>}
      </div>
      {linkOpen && (
        <div className="flex gap-2 border-b border-border p-3">
          <input aria-label="Bağlantı adresi" value={linkValue} onChange={(event) => setLinkValue(event.target.value)} placeholder="https://..." className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <button type="button" onClick={applyLink} className="rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground">Ekle</button>
          <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className="rounded-lg border border-border px-3 text-sm">Kaldır</button>
        </div>
      )}
      {imageMetaOpen && editor.isActive("image") && (
        <div className="grid gap-2 border-b border-border bg-background p-3 sm:grid-cols-[1fr_1fr_auto]">
          <input aria-label="Görsel alt metni" maxLength={250} value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Görselde ne var? (alt metin)" className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          <input aria-label="Görsel altyazısı" maxLength={250} value={imageCaption} onChange={(event) => setImageCaption(event.target.value)} placeholder="Altyazı (isteğe bağlı)" className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          <button type="button" onClick={() => { editor.chain().focus().updateAttributes("image", { alt: imageAlt, title: imageCaption }).run(); setImageMetaOpen(false); }} className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground">Uygula</button>
        </div>
      )}
      <div className="p-4 sm:p-6"><EditorContent editor={editor} /></div>
      {message && <p role="alert" className="border-t border-border px-4 py-2 text-sm text-red-500">{message}</p>}
    </div>
  );
}
