import type { ReactNode } from "react";
import { describeError } from "../api/ApiError";

// Estados reutilizables: loading, error, vacio. Todos aceptan `className` para
// reservar altura y no mover el layout.

export function Spinner({ label = "Cargando…", className = "" }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`flex items-center justify-center gap-3 text-slate-300 ${className}`}>
      <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400 motion-reduce:animate-none" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  compact?: boolean;
}

export function ErrorState({ error, onRetry, retryLabel = "Reintentar", className = "", compact = false }: ErrorStateProps) {
  const info = describeError(error);
  const tone = info.locked ? "border-amber-500/40 bg-amber-500/10" : "border-rose-500/40 bg-rose-500/10";
  return (
    <div role="alert" className={`rounded-xl border ${tone} ${compact ? "p-3" : "p-6"} text-center ${className}`}>
      <p className="font-semibold text-slate-100">
        {info.locked ? "🔒 " : ""}
        {info.title}
      </p>
      <p className="mt-1 text-sm text-slate-300">{info.message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-3">
          {info.locked ? "Volver a comprobar" : retryLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children, className = "" }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-dashed border-slate-700 p-8 text-center ${className}`}>
      <p className="font-semibold text-slate-200">{title}</p>
      {children && <div className="mt-2 text-sm text-slate-400">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {actions}
    </header>
  );
}
