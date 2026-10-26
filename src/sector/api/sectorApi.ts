import { request } from "../../common/api/httpClient";
import type { SectorListResponseDto, SectorStoryDto } from "../dto/sector.dto";

export const sectorApi = {
  list: (signal?: AbortSignal) => request<SectorListResponseDto>("/sectors", { signal }),
  story: (id: string, signal?: AbortSignal) => request<SectorStoryDto>(`/sectors/${encodeURIComponent(id)}/story`, { signal }),
};
