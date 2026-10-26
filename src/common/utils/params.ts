// Helpers para leer la URL de forma segura: cualquier valor invalido cae al default.

export function readEnum<T extends string>(params: URLSearchParams, key: string, allowed: readonly T[]): T | "" {
  const raw = params.get(key);
  return raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : "";
}

export function readEnumOr<T extends string>(params: URLSearchParams, key: string, allowed: readonly T[], fallback: T): T {
  const value = readEnum(params, key, allowed);
  return value === "" ? fallback : value;
}

export function readNumberIn<T extends number>(params: URLSearchParams, key: string, allowed: readonly T[], fallback: T): T {
  const raw = Number(params.get(key));
  return (allowed as readonly number[]).includes(raw) ? (raw as T) : fallback;
}

export function readNonNegativeInt(params: URLSearchParams, key: string, fallback = 0): number {
  const raw = params.get(key);
  if (raw === null || !/^\d+$/.test(raw)) return fallback;
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : fallback;
}

export function readText(params: URLSearchParams, key: string, maxLength = 80): string {
  return (params.get(key) ?? "").slice(0, maxLength);
}

/** Construye URLSearchParams omitiendo vacios y valores por defecto (URL limpia y compartible). */
export function toSearchParams(values: Record<string, string | number>, defaults: Record<string, string | number> = {}): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === "" || defaults[key] === value) continue;
    params.set(key, String(value));
  }
  return params;
}
