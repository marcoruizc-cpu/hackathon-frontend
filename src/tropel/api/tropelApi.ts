import { request } from "../../common/api/httpClient";
import type { PageDto, TropelDto, TropelListQuery } from "../dto/tropel.dto";

export const tropelApi = {
  list: (query: TropelListQuery, signal?: AbortSignal) =>
    request<PageDto<TropelDto>>("/tropels", {
      signal,
      query: {
        page: query.page,
        size: query.size,
        sort: query.sort,
        species: query.species,
        vitalState: query.vitalState,
        sectorId: query.sectorId,
        q: query.q.trim(),
      },
    }),
  detail: (id: string, signal?: AbortSignal) => request<TropelDto>(`/tropels/${encodeURIComponent(id)}`, { signal }),
};
