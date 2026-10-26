import { Link } from "react-router-dom";
import { EmptyState, ErrorState, PageHeader, Spinner } from "../../common/components/Feedback";
import { formatDate, formatNumber } from "../../common/utils/format";
import { KpiCard } from "../components/KpiCard";
import { SeverityBars } from "../components/SeverityBars";
import { useDashboardSummary } from "../hooks/useDashboardSummary";

export function DashboardPage() {
  const { data, error, loading, reload } = useDashboardSummary();

  return (
    <section>
      <PageHeader
        title="Dashboard"
        subtitle={data ? `Actualizado ${formatDate(data.generatedAt)}` : "Indicadores del workspace"}
        actions={
          <button type="button" className="btn-secondary" onClick={reload} disabled={loading}>
            {loading ? "Actualizando…" : "Actualizar"}
          </button>
        }
      />

      {!data && loading && <Spinner label="Cargando indicadores…" className="min-h-64" />}
      {!data && error !== null && !loading && <ErrorState error={error} onRetry={reload} />}
      {data && error !== null && <ErrorState error={error} onRetry={reload} compact className="mb-4" />}

      {data && data.totalTropels === 0 && data.openSignals === 0 && (
        <EmptyState title="Sin datos todavía">Este workspace aún no tiene Tropeles ni Señales.</EmptyState>
      )}

      {data && (data.totalTropels > 0 || data.openSignals > 0) && (
        <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Tropeles" value={formatNumber(data.totalTropels)} hint="Total del workspace" />
            <KpiCard label="Tropeles críticos" value={formatNumber(data.criticalTropels)} accent="rose" />
            <KpiCard label="Señales abiertas" value={formatNumber(data.openSignals)} hint="Recibidas + en proceso" accent="amber" />
            <KpiCard label="Estabilidad media" value={`${data.sectorStabilityAvg.toFixed(1)}%`} hint="Promedio de sectores" accent="emerald" />
          </div>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <article className="card p-5">
              <h2 className="mb-4 font-semibold text-slate-100">Señales abiertas por severidad</h2>
              <SeverityBars data={data.signalsBySeverity} />
            </article>
            <article className="card flex flex-col gap-3 p-5">
              <h2 className="font-semibold text-slate-100">Accesos rápidos</h2>
              <Link className="btn-secondary justify-start" to="/tropels?vitalState=CRITICO">Ver Tropeles críticos</Link>
              <Link className="btn-secondary justify-start" to="/signals?severity=CRITICO">Señales críticas</Link>
              <Link className="btn-secondary justify-start" to="/sectors">Historias de sectores</Link>
            </article>
          </div>
        </div>
      )}
    </section>
  );
}
