import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { readEnum, readText, toSearchParams } from "../../common/utils/params";
import { SEVERITIES, SIGNAL_STATUSES, SIGNAL_TYPES, type SignalFeedFilters } from "../dto/signal.dto";

// Filtros del feed persistidos en la URL.
export function useSignalFeedUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<SignalFeedFilters>(
    () => ({
      signalType: readEnum(searchParams, "signalType", SIGNAL_TYPES),
      severity: readEnum(searchParams, "severity", SEVERITIES),
      status: readEnum(searchParams, "status", SIGNAL_STATUSES),
      q: readText(searchParams, "q", 80),
    }),
    [searchParams],
  );

  // Clave canonica: q se compara sin espacios extremos porque asi viaja al backend.
  const filterKey = useMemo(() => toSearchParams({ ...filters, q: filters.q.trim() }).toString(), [filters]);

  const update = useCallback(
    (patch: Partial<SignalFeedFilters>, options: { replace?: boolean } = {}) => {
      setSearchParams(toSearchParams({ ...filters, ...patch }), { replace: options.replace ?? false });
    },
    [filters, setSearchParams],
  );

  const reset = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams]);

  return { filters, filterKey, update, reset };
}
