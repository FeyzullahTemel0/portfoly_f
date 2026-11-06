import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import { isOwnImageUrl } from "@/lib/storage";

function safeHref(value: unknown): string {
  if (typeof value !== "string") return "";
  if (/^https:\/\//i.test(value) || /^mailto:/i.test(value) || /^tel:/i.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "";
}

function renderText(node: JSONContent, key: string): ReactNode {
  let value: ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") value = <strong key={`${key}-b`}>{value}</strong>;
    else if (mark.type === "italic") value = <em key={`${key}-i`}>{value}</em>;
    else if (mark.type === "strike") value = <s key={`${key}-s`}>{value}</s>;
    else if (mark.type === "code") value = <code key={`${key}-c`} className="rounded bg-foreground/5 px-1.5 py-0.5 text-[0.9em]">{value}</code>;
    else if (mark.type === "link") {
      const href = safeHref(mark.attrs?.href);
      if (href.startsWith("/")) value = <Link key={`${key}-l`} href={href} className="text-accent underline underline-offset-4">{value}</Link>;
      else if (href) value = <a key={`${key}-l`} href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">{value}</a>;
    }
  }
  return value;
}

function renderNode(node: JSONContent, index: number): ReactNode {
  const key = `${node.type ?? "node"}-${index}`;
  const children = (node.content ?? []).map((child, childIndex) => renderNode(child, childIndex));
  switch (node.type) {
    case "doc": return <>{children}</>;
    case "paragraph": return <p key={key}>{children}</p>;
    case "heading": {
      const level = Number(node.attrs?.level);
      if (level === 2) return <h2 key={key}>{children}</h2>;
      if (level === 3) return <h3 key={key}>{children}</h3>;
      return <h2 key={key}>{children}</h2>;
    }
    case "bulletList": return <ul key={key}>{children}</ul>;
    case "orderedList": return <ol key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock": return <pre key={key}><code>{children}</code></pre>;
    case "horizontalRule": return <hr key={key} />;
    case "hardBreak": return <br key={key} />;
    case "text": return renderText(node, key);
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      if (!isOwnImageUrl(src)) return null;
      const width = Number(node.attrs?.width) || 1600;
      const height = Number(node.attrs?.height) || 1000;
      const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "Makale görseli";
      const align = node.attrs?.align === "left" || node.attrs?.align === "right" ? node.attrs.align : "center";
      return (
        <figure key={key} className={`article-image article-image--${align}`}>
          <Image src={src} alt={alt} width={width} height={height} sizes="(min-width: 1024px) 760px, 100vw" className="h-auto max-w-full rounded-xl" />
          {typeof node.attrs?.title === "string" && node.attrs.title && <figcaption>{node.attrs.title}</figcaption>}
        </figure>
      );
    }
    default: return <>{children}</>;
  }
}

export function ArticleBody({ body }: { body: JSONContent }) {
  return <div className="article-body">{renderNode(body, 0)}</div>;
}
