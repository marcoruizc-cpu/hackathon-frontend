import { formatNumber, humanize } from "../../common/utils/format";
import { SEVERITIES, type Severity } from "../../signal/dto/signal.dto";

const COLORS: Record<Severity, string> = {
  LEVE: "bg-sky-400",
  MODERADO: "bg-amber-400",
  GRAVE: "bg-orange-500",
  CRITICO: "bg-rose-500",
};

// Barras horizontales con CSS puro (sin librerias de graficos).
export function SeverityBars({ data }: { data: Record<Severity, number> }) {
  const max = Math.max(1, ...SEVERITIES.map((s) => data[s]));
  return (
    <ul className="space-y-3">
      {SEVERITIES.map((severity) => {
        const value = data[severity];
        return (
          <li key={severity} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-3 text-sm">
            <span className="text-slate-300">{humanize(severity)}</span>
            <span className="h-3 overflow-hidden rounded-full bg-slate-800" role="presentation">
              <span className={`block h-full rounded-full ${COLORS[severity]} transition-[width] duration-500`} style={{ width: `${(value / max) * 100}%` }} />
            </span>
            <span className="text-right tabular-nums text-slate-200">{formatNumber(value)}</span>
          </li>
        );
      })}
    </ul>
  );
}
