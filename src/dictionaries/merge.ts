type Plain = Record<string, unknown>;

function isPlain(value: unknown): value is Plain {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const blockedKeys = new Set(["__proto__", "constructor", "prototype"]);

export function mergeDeep<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (isPlain(base) && isPlain(override)) {
    const result: Plain = { ...base };
    for (const key of Object.keys(override)) {
      if (blockedKeys.has(key)) continue;
      result[key] = key in base ? mergeDeep(base[key], override[key]) : override[key];
    }
    return result as T;
  }
  if (typeof base === typeof override && Array.isArray(base) === Array.isArray(override)) {
    return override as T;
  }
  return base;
}