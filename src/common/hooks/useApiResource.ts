import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "../api/ApiError";

// Hook generico para GETs simples (dashboard, detalle, listas).
// - Cada cambio de `key` aborta la request anterior (AbortController) y descarta su respuesta.
// - Mantiene la data previa mientras carga la siguiente: el layout no salta.
// - key = null => no ejecuta nada.
// - initialData: valor cacheado para pintar al instante mientras se revalida.

export interface ResourceState<T> {
  data: T | null;
  error: unknown;
  loading: boolean;
  /** key a la que pertenece `data` (sirve para saber si la data es "vieja"). */
  dataKey: string | null;
}

export interface ApiResource<T> extends ResourceState<T> {
  reload: () => void;
  setData: (updater: (current: T | null) => T | null) => void;
}

export function useApiResource<T>(key: string | null, fetcher: (signal: AbortSignal) => Promise<T>, initialData: T | null = null): ApiResource<T> {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [state, setState] = useState<ResourceState<T>>(() => ({
    data: initialData,
    error: null,
    loading: key !== null,
    dataKey: initialData !== null ? key : null,
  }));
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return; // respuesta obsoleta: se descarta
        setState({ data, error: null, loading: false, dataKey: key });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) return;
        setState((prev) => ({ ...prev, error, loading: false }));
      });

    return () => controller.abort();
  }, [key, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback((updater: (current: T | null) => T | null) => {
    setState((prev) => ({ ...prev, data: updater(prev.data) }));
  }, []);

  return { ...state, reload, setData };
}
