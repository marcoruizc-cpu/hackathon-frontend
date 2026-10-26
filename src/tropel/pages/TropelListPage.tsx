import { EmptyState, ErrorState, PageHeader, Spinner } from "../../common/components/Feedback";
import { Pagination } from "../../common/components/Pagination";
import { formatNumber } from "../../common/utils/format";
import { useSectors } from "../../sector/hooks/useSectors";
import { TropelFilters } from "../components/TropelFilters";
import { TropelTable } from "../components/TropelTable";
import { useTropelList } from "../hooks/useTropelList";
import { useTropelUrlState } from "../hooks/useTropelUrlState";

export function TropelListPage() {
  const { query, queryKey, update, reset } = useTropelUrlState();
  const { data, error, loading, isStale, reload } = useTropelList(query, queryKey);
  const sectors = useSectors();

  const rows = data?.content ?? [];
  const outOfRange = data !== null && !isStale && data.totalPages > 0 && query.page >= data.totalPages;

  return (
    <section>
      <PageHeader
        title="Atlas de Tropeles"
        subtitle={data ? `${formatNumber(data.totalElements)} resultados · página ${data.currentPage + 1} de ${Math.max(1, data.totalPages)}` : "Paginación del servidor"}
      />

      <TropelFilters query={query} sectors={sectors.data?.items ?? []} onChange={update} onReset={reset} />

      {/* Contenedor de altura minima fija: loading/error/vacio no mueven el layout. */}
      <div className="card relative min-h-[560px]" aria-busy={loading}>
        {/* Las filas de una request anterior NUNCA se muestran: se vuelven invisibles
            (conservan su altura para que el layout no salte) hasta que llega la respuesta vigente. */}
        {data && rows.length > 0 && !outOfRange && (
          <div className={isStale ? "invisible" : ""} aria-hidden={isStale}>
            <TropelTable rows={rows} />
          </div>
        )}

        {!loading && !error && data && !isStale && rows.length === 0 && !outOfRange && (
          <EmptyState title="Sin resultados" className="absolute inset-4 flex flex-col items-center justify-center">
            <p>Ningún Tropel coincide con los filtros.</p>
            <button type="button" className="btn-secondary mt-3" onClick={reset}>Limpiar filtros</button>
          </EmptyState>
        )}

        {!loading && outOfRange && (
          <EmptyState title="Página fuera de rango" className="absolute inset-4 flex flex-col items-center justify-center">
            <button type="button" className="btn-secondary mt-3" onClick={() => update({ page: 0 })}>Ir a la primera página</button>
          </EmptyState>
        )}

        {!loading && error !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 p-4">
            <ErrorState error={error} onRetry={reload} className="w-full max-w-md bg-slate-900" />
          </div>
        )}

        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center pt-24">
            <Spinner label={data ? "Actualizando…" : "Cargando Tropeles…"} className="rounded-full bg-slate-900/90 px-4 py-2 ring-1 ring-slate-700" />
          </div>
        )}
      </div>

      <div className="mt-4 min-h-11">
        {data && (
          <Pagination page={query.page} totalPages={data.totalPages} disabled={loading} onChange={(page) => update({ page })} />
        )}
      </div>
    </section>
  );
}
