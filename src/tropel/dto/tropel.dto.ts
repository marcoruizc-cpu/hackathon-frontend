export const SPECIES = ["BLOBITO", "CHISPA", "GRUNON", "DORMILON", "GLITCHY"] as const;
export type Species = (typeof SPECIES)[number];

export const VITAL_STATES = ["ESTABLE", "HAMBRIENTO", "AGITADO", "MUTANDO", "CRITICO"] as const;
export type VitalState = (typeof VITAL_STATES)[number];

export const PAGE_SIZES = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export const TROPEL_SORTS = ["updatedAt,desc", "name,asc", "chaosIndex,desc"] as const;
export type TropelSort = (typeof TROPEL_SORTS)[number];

export const SORT_LABELS: Record<TropelSort, string> = {
  "updatedAt,desc": "Actualizados recientemente",
  "name,asc": "Nombre (A-Z)",
  "chaosIndex,desc": "Mayor caos",
};

export interface TropelDto {
  id: string;
  name: string;
  species: Species;
  vitalState: VitalState;
  energyLevel: number;
  chaosIndex: number;
  mutationStage: number;
  guardianName: string;
  sector: { id: string; name: string; sectorCode: string };
  createdAt: string;
  updatedAt: string;
}

/** Respuesta paginada estilo Spring (page empieza en 0). */
export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface TropelListQuery {
  page: number;
  size: PageSize;
  species: Species | "";
  vitalState: VitalState | "";
  sectorId: string;
  q: string;
  sort: TropelSort;
}

export const DEFAULT_TROPEL_QUERY: TropelListQuery = {
  page: 0,
  size: 20,
  species: "",
  vitalState: "",
  sectorId: "",
  q: "",
  sort: "updatedAt,desc",
};
