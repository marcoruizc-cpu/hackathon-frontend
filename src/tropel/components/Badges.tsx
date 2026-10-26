import { humanize } from "../../common/utils/format";
import type { VitalState } from "../dto/tropel.dto";

const VITAL_COLORS: Record<VitalState, string> = {
  ESTABLE: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  HAMBRIENTO: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  AGITADO: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  MUTANDO: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  CRITICO: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

export function VitalStateBadge({ value }: { value: VitalState }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${VITAL_COLORS[value]}`}>{humanize(value)}</span>;
}

/** Barra 0-100 reutilizable (energia, caos, estabilidad). */
export function Meter({ value, label, color = "bg-cyan-400" }: { value: number; label: string; color?: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <span className="flex items-center gap-2" title={`${label}: ${value}`}>
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800" role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <span className={`block h-full ${color}`} style={{ width: `${safe}%` }} />
      </span>
      <span className="w-7 text-right text-xs tabular-nums text-slate-300">{value}</span>
    </span>
  );
}
