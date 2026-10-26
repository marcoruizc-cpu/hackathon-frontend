const dateFormatter = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" });
const numberFormatter = new Intl.NumberFormat("es-PE");

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** "REPRODUCCION_MASIVA" -> "Reproduccion masiva" */
export function humanize(value: string): string {
  const text = value.replace(/_/g, " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
