import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "../../common/api/ApiError";
import { signalApi } from "../api/signalApi";
import type { SignalDto, SignalFeedFilters } from "../dto/signal.dto";
import { INITIAL_FEED_STATE, feedStore, reconcile, type FeedState } from "../store/feedStore";

const PAGE_LIMIT = 15;

// Feed cursor-based con todas las garantias del checkpoint:
// - Dedup por ID (Set) al anexar cada pagina.
// - UNA sola carga en vuelo (inFlightRef).
// - Requests obsoletas: AbortController + contador de "generacion" (si cambian los filtros,
//   cualquier respuesta vieja se descarta aunque llegue tarde).
// - Error en paginas posteriores: conserva los items ya cargados y permite reintentar.
// - Estado guardado en feedStore para restaurar paginas/posicion al volver.

function restore(key: string): FeedState {
  const entry = feedStore.get(key);
  if (!entry) return INITIAL_FEED_STATE;
  // Si la request en vuelo se aborto al desmontar, se vuelve a "idle".
  return entry.state.phase === "loading" ? { ...entry.state, phase: "idle" } : entry.state;
}

export function useSignalFeed(filters: SignalFeedFilters, filterKey: string) {
  const [state, setState] = useState<FeedState>(() => restore(filterKey));
  const stateRef = useRef(state);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const keyRef = useRef(filterKey);
  const inFlightRef = useRef<AbortController | null>(null);
  const generationRef = useRef(0);

  const commit = useCallback((next: FeedState) => {
    stateRef.current = next;
    feedStore.save(keyRef.current, filtersRef.current, next);
    setState(next);
  }, []);

  const loadMore = useCallback(() => {
    const current = stateRef.current;
    if (inFlightRef.current || !current.hasMore) return;

    const generation = generationRef.current;
    const controller = new AbortController();
    inFlightRef.current = controller;
    commit({ ...current, phase: "loading", error: null });

    signalApi
      .feed({ ...filtersRef.current, cursor: current.nextCursor, limit: PAGE_LIMIT }, controller.signal)
      .then((page) => {
        if (generation !== generationRef.current) return; // filtros cambiaron: respuesta obsoleta
        const base = stateRef.current;
        const seen = new Set(base.items.map((item) => item.id));
        const fresh: SignalDto[] = [];
        for (const item of page.items) {
          if (seen.has(item.id)) continue;
          seen.add(item.id);
          fresh.push(item);
        }
        commit({
          items: [...base.items, ...fresh],
          nextCursor: page.nextCursor,
          hasMore: page.hasMore && page.nextCursor !== null,
          totalEstimate: page.totalEstimate,
          phase: "idle",
          error: null,
          initialized: true,
        });
      })
      .catch((error: unknown) => {
        if (generation !== generationRef.current || isAbortError(error)) return;
        commit({ ...stateRef.current, phase: "error", error, initialized: true });
      })
      .finally(() => {
        if (inFlightRef.current === controller) inFlightRef.current = null;
      });
  }, [commit]);

  // Cambio real de filtros => cursor reiniciado (o estado cacheado de esos filtros).
  useEffect(() => {
    keyRef.current = filterKey;
    generationRef.current += 1;
    inFlightRef.current?.abort();
    inFlightRef.current = null;

    const restored = restore(filterKey);
    stateRef.current = restored;
    setState(restored);
    if (!restored.initialized) loadMore();

    return () => {
      generationRef.current += 1;
      inFlightRef.current?.abort();
      inFlightRef.current = null;
    };
  }, [filterKey, loadMore]);

  /** Reconciliar el resultado de un PATCH con el feed (actualiza o retira la senal). */
  const applyUpdatedSignal = useCallback(
    (updated: SignalDto) => {
      feedStore.applyUpdatedSignal(updated);
      commit(reconcile(stateRef.current, filtersRef.current, updated));
    },
    [commit],
  );

  return { state, loadMore, retry: loadMore, applyUpdatedSignal };
}
