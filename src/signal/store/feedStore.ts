import { registerSessionCache } from "../../common/utils/sessionCaches";
import type { SignalDto, SignalFeedFilters } from "../dto/signal.dto";

// Cache en memoria (propio, sin librerias) del feed por combinacion de filtros.
// Permite volver al feed desde otra seccion y recuperar paginas + posicion de scroll.

export type FeedPhase = "idle" | "loading" | "error";

export interface FeedState {
  items: SignalDto[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number | null;
  phase: FeedPhase;
  error: unknown;
  /** true cuando ya llego (o fallo) la primera pagina */
  initialized: boolean;
}

export const INITIAL_FEED_STATE: FeedState = {
  items: [],
  nextCursor: null,
  hasMore: true,
  totalEstimate: null,
  phase: "idle",
  error: null,
  initialized: false,
};

interface Entry {
  filters: SignalFeedFilters;
  state: FeedState;
  scrollY: number;
}

const MAX_ENTRIES = 8;
const entries = new Map<string, Entry>();

export const feedStore = {
  get(key: string): Entry | undefined {
    return entries.get(key);
  },
  save(key: string, filters: SignalFeedFilters, state: FeedState): void {
    const previous = entries.get(key);
    entries.delete(key); // re-insertar = mas reciente
    entries.set(key, { filters, state, scrollY: previous?.scrollY ?? 0 });
    while (entries.size > MAX_ENTRIES) {
      const oldest = entries.keys().next().value;
      if (oldest === undefined) break;
      entries.delete(oldest);
    }
  },
  saveScroll(key: string, scrollY: number): void {
    const entry = entries.get(key);
    if (entry) entry.scrollY = scrollY;
  },
  /** Aplica una senal actualizada (PATCH) a TODOS los feeds cacheados. */
  applyUpdatedSignal(updated: SignalDto): void {
    for (const entry of entries.values()) {
      entry.state = reconcile(entry.state, entry.filters, updated);
    }
  },
  clear(): void {
    entries.clear();
  },
};

registerSessionCache(() => feedStore.clear());

/** La senal sigue en el feed solo si aun coincide con el filtro de estado activo. */
export function matchesFilters(signal: SignalDto, filters: SignalFeedFilters): boolean {
  if (filters.status && signal.status !== filters.status) return false;
  if (filters.severity && signal.severity !== filters.severity) return false;
  if (filters.signalType && signal.signalType !== filters.signalType) return false;
  return true;
}

export function reconcile(state: FeedState, filters: SignalFeedFilters, updated: SignalDto): FeedState {
  const index = state.items.findIndex((item) => item.id === updated.id);
  if (index === -1) return state;
  if (matchesFilters(updated, filters)) {
    const items = state.items.slice();
    items[index] = updated;
    return { ...state, items };
  }
  return {
    ...state,
    items: state.items.filter((item) => item.id !== updated.id),
    totalEstimate: state.totalEstimate === null ? null : Math.max(0, state.totalEstimate - 1),
  };
}
