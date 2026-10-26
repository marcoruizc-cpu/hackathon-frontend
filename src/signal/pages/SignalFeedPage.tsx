import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { EmptyState, ErrorState, PageHeader, Spinner } from "../../common/components/Feedback";
import { useInfiniteScroll } from "../../common/hooks/useInfiniteScroll";
import { formatNumber } from "../../common/utils/format";
import { SignalCard } from "../components/SignalCard";
import { SignalFilters } from "../components/SignalFilters";
import type { SignalDto } from "../dto/signal.dto";
import { useSignalFeed } from "../hooks/useSignalFeed";
import { useSignalFeedUrlState } from "../hooks/useSignalFeedUrlState";
import { feedStore } from "../store/feedStore";

/** Contexto que el detalle (ruta hija /signals/:id) recibe via <Outlet>. */
export interface SignalFeedOutletContext {
  onSignalUpdated: (signal: SignalDto) => void;
}

export function SignalFeedPage() {
  const location = useLocation();
  const { filters, filterKey, update, reset } = useSignalFeedUrlState();
  const { state, loadMore, retry, applyUpdatedSignal } = useSignalFeed(filters, filterKey);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ---- Infinite scroll automatico (sin boton "cargar mas") ----
  useInfiniteScroll(sentinelRef, {
    enabled: state.initialized && state.hasMore && state.phase === "idle",
    onReach: loadMore,
    resetKey: `${filterKey}|${state.items.length}`,
  });

  // ---- Conservar posicion de scroll ----
  // El detalle es un panel sobre el feed (ruta hija), asi que el feed NUNCA se desmonta al abrirlo.
  // Ademas se guarda scrollY por filtro para restaurarlo si el usuario va a otra seccion y vuelve.
  const scrollYRef = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const lastKeyRef = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (lastKeyRef.current === null || lastKeyRef.current === filterKey) {
      // Al montar (o volver desde otra seccion): restaurar la posicion guardada para estos filtros.
      const saved = feedStore.get(filterKey);
      if (saved && saved.state.initialized) window.scrollTo(0, saved.scrollY);
    } else {
      // Cambio de filtros: lista nueva, se empieza arriba.
      window.scrollTo(0, 0);
    }
    lastKeyRef.current = filterKey;
    scrollYRef.current = window.scrollY;
    return () => feedStore.saveScroll(filterKey, scrollYRef.current);
  }, [filterKey]);

  const outletContext = useMemo<SignalFeedOutletContext>(() => ({ onSignalUpdated: applyUpdatedSignal }), [applyUpdatedSignal]);

  const { items, phase, initialized, hasMore, totalEstimate, error } = state;
  const firstLoad = !initialized || (phase === "loading" && items.length === 0);
  const firstError = phase === "error" && items.length === 0;
  const isEmpty = initialized && phase === "idle" && items.length === 0 && !hasMore;

  return (
    <section>
      <PageHeader
        title="Feed de Señales"
        subtitle={totalEstimate !== null ? `${formatNumber(items.length)} cargadas de ~${formatNumber(totalEstimate)}` : "Cursor-based · carga automática"}
      />
      <SignalFilters filters={filters} onChange={update} onReset={reset} />

      {firstError ? (
        <ErrorState error={error} onRetry={retry} className="min-h-48" />
      ) : firstLoad ? (
        <Spinner label="Cargando señales…" className="min-h-48" />
      ) : isEmpty ? (
        <EmptyState title="Sin señales">
          <p>No hay señales para estos filtros.</p>
          <button type="button" className="btn-secondary mt-3" onClick={reset}>Limpiar filtros</button>
        </EmptyState>
      ) : (
        <ul className="space-y-3" aria-label="Señales">
          {items.map((signal) => (
            <SignalCard key={signal.id} signal={signal} search={location.search} />
          ))}
        </ul>
      )}

      {/* Pie del feed: sentinel + estados de paginas posteriores */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      <div className="flex min-h-24 items-center justify-center py-6">
        {items.length > 0 && phase === "loading" && <Spinner label="Cargando más señales…" />}
        {items.length > 0 && phase === "error" && (
          <ErrorState error={error} onRetry={retry} retryLabel="Reintentar esta página" compact className="w-full max-w-md" />
        )}
        {items.length > 0 && phase === "idle" && !hasMore && (
          <p className="text-sm text-slate-500">— Fin del feed · {formatNumber(items.length)} señales —</p>
        )}
      </div>

      <Outlet context={outletContext} />
    </section>
  );
}
