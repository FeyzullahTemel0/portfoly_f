"use client";

import { useId } from "react";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
type JsonObject = { [key: string]: Json };

type Context = { labels: Record<string, string>; templates: Record<string, Json>; hiddenRootKeys?: string[] };
type NodeProps = { value: Json; onChange: (value: Json) => void; name: string; path: string[]; ctx: Context; depth: number };

const multilineKeys = new Set(["text", "summary", "intro", "description", "note", "homeText", "paragraphs", "story"]);
const titleKeys = ["title", "name", "heading", "role", "school", "service", "slug", "serviceSlug"];

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent";
const iconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted";

function isObject(value: Json): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function humanize(key: string) {
  const spaced = key.replace(/([A-Z])/g, " $1").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Yeni öğe eklerken mevcut bir öğenin yapısını boş değerlerle kopyalar.
function blank(sample: Json): Json {
  if (Array.isArray(sample)) return [];
  if (isObject(sample)) return Object.fromEntries(Object.entries(sample).map(([k, v]) => [k, blank(v)]));
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  return "";
}

function itemTitle(item: Json, index: number) {
  if (isObject(item)) {
    for (const key of titleKeys) {
      const candidate = item[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate;
    }
  }
  return `Öğe ${index + 1}`;
}

function TextField({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-muted">{label}</label>
      {multiline ? (
        <textarea id={id} value={value} rows={Math.min(8, Math.max(3, Math.ceil(value.length / 70)))} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      ) : (
        <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}

function ItemControls({ index, length, onMove, onRemove }: { index: number; length: number; onMove: (to: number) => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" className={iconButton} aria-label="Yukarı taşı" disabled={index === 0} onClick={() => onMove(index - 1)}>
        <FiArrowUp className="h-4 w-4" />
      </button>
      <button type="button" className={iconButton} aria-label="Aşağı taşı" disabled={index === length - 1} onClick={() => onMove(index + 1)}>
        <FiArrowDown className="h-4 w-4" />
      </button>
      <button type="button" className={`${iconButton} hover:!border-red-500 hover:!text-red-500`} aria-label="Sil" onClick={onRemove}>
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function ArrayField({ value, onChange, name, path, ctx, depth }: Omit<NodeProps, "value"> & { value: Json[] }) {
  const label = ctx.labels[name] ?? humanize(name);
  const template = value.length > 0 ? blank(value[0]) : ctx.templates[path.join(".")];
  const canAdd = template !== undefined;

  function move(from: number, to: number) {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">{label}</p>
      {value.length === 0 && <p className="text-xs text-muted">Bu liste boş.</p>}

      {value.map((item, index) => {
        const controls = (
          <ItemControls index={index} length={value.length} onMove={(to) => move(index, to)} onRemove={() => onChange(value.filter((_, i) => i !== index))} />
        );
        const update = (next: Json) => onChange(value.map((existing, i) => (i === index ? next : existing)));

        if (typeof item !== "object" || item === null) {
          return (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                {typeof item === "string" ? (
                  <TextField label={`${index + 1}`} value={item} onChange={update} multiline={multilineKeys.has(name) || item.length > 90} />
                ) : (
                  <Node value={item} onChange={update} name={`${index + 1}`} path={path} ctx={ctx} depth={depth + 1} />
                )}
              </div>
              <div className="pt-5">{controls}</div>
            </div>
          );
        }

        return (
          <details key={index} className="group rounded-lg border border-border bg-background/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2">
              <span className="text-sm font-medium">
                <span className="mr-2 text-accent">{index + 1}.</span>
                {itemTitle(item, index)}
              </span>
              <span onClick={(event) => event.preventDefault()}>{controls}</span>
            </summary>
            <div className="border-t border-border p-3">
              <Node value={item} onChange={update} name={`${index + 1}`} path={path} ctx={ctx} depth={depth + 1} />
            </div>
          </details>
        );
      })}

      {canAdd && (
        <button
          type="button"
          onClick={() => onChange([...value, template as Json])}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-dashed border-border px-3 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <FiPlus className="h-4 w-4" aria-hidden="true" /> Yeni ekle
        </button>
      )}
    </div>
  );
}

export function Node({ value, onChange, name, path, ctx, depth }: NodeProps) {
  if (typeof value === "string") {
    return <TextField label={ctx.labels[name] ?? humanize(name)} value={value} onChange={onChange} multiline={multilineKeys.has(name) || value.length > 90 || value.includes("\n")} />;
  }

  if (typeof value === "number") {
    return (
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">{ctx.labels[name] ?? humanize(name)}</label>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputClass} />
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
        {ctx.labels[name] ?? humanize(name)}
      </label>
    );
  }

  if (Array.isArray(value)) {
    return <ArrayField value={value} onChange={onChange} name={name} path={path} ctx={ctx} depth={depth} />;
  }

  if (isObject(value)) {
    const fields = (
      <div className="space-y-4">
        {Object.entries(value).filter(([key]) => depth !== 0 || !ctx.hiddenRootKeys?.includes(key)).map(([key, child]) => (
          <Node
            key={key}
            value={child}
            name={key}
            path={[...path, key]}
            ctx={ctx}
            depth={depth + 1}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
      </div>
    );
    if (depth === 0 || /^\d+$/.test(name)) return fields;
    return (
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-2 text-sm font-semibold">{ctx.labels[name] ?? humanize(name)}</legend>
        {fields}
      </fieldset>
    );
  }

  return null;
}
