import { useApiResource } from "../../common/hooks/useApiResource";
import { registerSessionCache } from "../../common/utils/sessionCaches";
import { sectorApi } from "../api/sectorApi";
import type { SectorListResponseDto } from "../dto/sector.dto";

// Ultima lista de sectores en memoria: el resumen se pinta al instante al volver
// de una historia (necesario para que la View Transition tenga a que elemento animar).
let cachedSectors: SectorListResponseDto | null = null;
registerSessionCache(() => {
  cachedSectors = null;
});

export function useSectors() {
  return useApiResource(
    "sectors",
    async (signal) => {
      const response = await sectorApi.list(signal);
      cachedSectors = response;
      return response;
    },
    cachedSectors,
  );
}

export function useSectorStory(id: string) {
  return useApiResource(`story:${id}`, (signal) => sectorApi.story(id, signal));
}
