import { useApiResource } from "../../common/hooks/useApiResource";
import { tropelApi } from "../api/tropelApi";
import type { TropelListQuery } from "../dto/tropel.dto";

// Paginacion REAL del servidor. Cada cambio de `queryKey` aborta la request
// anterior: una respuesta vieja nunca pisa a la nueva.
export function useTropelList(query: TropelListQuery, queryKey: string) {
  const resource = useApiResource(`tropels?${queryKey}`, (signal) => tropelApi.list(query, signal));
  const isStale = resource.dataKey !== `tropels?${queryKey}`;
  return { ...resource, isStale };
}

export function useTropelDetail(id: string) {
  return useApiResource(`tropel:${id}`, (signal) => tropelApi.detail(id, signal));
}
