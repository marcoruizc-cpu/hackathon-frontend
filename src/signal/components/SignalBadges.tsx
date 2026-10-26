import { humanize } from "../../common/utils/format";
import type { Severity, SignalStatus } from "../dto/signal.dto";

const SEVERITY_STYLES: Record<Severity, string> = {
  LEVE: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  MODERADO: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  GRAVE: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  CRITICO: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

const STATUS_STYLES: Record<SignalStatus, string> = {
  RECIBIDA: "bg-slate-500/15 text-slate-200 ring-slate-500/30",
  PROCESANDO: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  ATENDIDA: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
};

const base = "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1";

export function SeverityBadge({ value }: { value: Severity }) {
  return <span className={`${base} ${SEVERITY_STYLES[value]}`}>{humanize(value)}</span>;
}

export function StatusBadge({ value }: { value: SignalStatus }) {
  return <span className={`${base} ${STATUS_STYLES[value]}`}>{humanize(value)}</span>;
}
