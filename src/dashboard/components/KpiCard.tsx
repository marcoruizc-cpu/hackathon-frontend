interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: "cyan" | "rose" | "amber" | "emerald";
}

const ACCENTS: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  cyan: "text-cyan-300",
  rose: "text-rose-300",
  amber: "text-amber-300",
  emerald: "text-emerald-300",
};

export function KpiCard({ label, value, hint, accent = "cyan" }: KpiCardProps) {
  return (
    <article className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${ACCENTS[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </article>
  );
}
