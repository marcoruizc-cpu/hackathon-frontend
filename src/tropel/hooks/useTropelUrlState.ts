import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { readEnum, readEnumOr, readNonNegativeInt, readNumberIn, readText, toSearchParams } from "../../common/utils/params";
import { DEFAULT_TROPEL_QUERY, PAGE_SIZES, SPECIES, TROPEL_SORTS, VITAL_STATES, type TropelListQuery } from "../dto/tropel.dto";

// La URL es la UNICA fuente de verdad del estado de la tabla:
// recargar o compartir el link reconstruye exactamente la misma vista.

function parse(params: URLSearchParams): TropelListQuery {
  return {
    page: readNonNegativeInt(params, "page", 0),
    size: readNumberIn(params, "size", PAGE_SIZES, DEFAULT_TROPEL_QUERY.size),
    species: readEnum(params, "species", SPECIES),
    vitalState: readEnum(params, "vitalState", VITAL_STATES),
    sectorId: readText(params, "sectorId", 64),
    q: readText(params, "q", 80),
    sort: readEnumOr(params, "sort", TROPEL_SORTS, DEFAULT_TROPEL_QUERY.sort),
  };
}

function serialize(query: TropelListQuery): URLSearchParams {
  return toSearchParams({ ...query }, { ...DEFAULT_TROPEL_QUERY });
}

export function useTropelUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parse(searchParams), [searchParams]);
  const canonical = useMemo(() => serialize(query).toString(), [query]);

  // Si alguien pega una URL con valores invalidos, se normaliza sin crear historial.
  useEffect(() => {
    if (canonical !== searchParams.toString()) setSearchParams(new URLSearchParams(canonical), { replace: true });
  }, [canonical, searchParams, setSearchParams]);

  /** Cambios de filtro/orden/tamano vuelven a la pagina 0. */
  const update = useCallback(
    (patch: Partial<TropelListQuery>, options: { replace?: boolean } = {}) => {
      const next: TropelListQuery = { ...query, ...patch };
      if (!("page" in patch)) next.page = 0;
      setSearchParams(serialize(next), { replace: options.replace ?? false });
    },
    [query, setSearchParams],
  );

  const reset = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams]);

  return { query, queryKey: canonical, update, reset };
}
