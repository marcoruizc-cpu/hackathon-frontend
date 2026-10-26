import type { SignalType } from "../../signal/dto/signal.dto";

export const CLIMATES = ["PIXEL_FOREST", "NEON_CAVE", "CLOUD_AQUARIUM", "RETRO_ARCADE"] as const;
export type Climate = (typeof CLIMATES)[number];

export interface SectorSummaryDto {
  id: string;
  sectorCode: string;
  name: string;
  climate: Climate;
  capacity: number;
  currentLoad: number;
  stabilityLevel: number;
}

export interface SectorListResponseDto {
  items: SectorSummaryDto[];
}

export interface StoryMetricsDto {
  /** 0-100 */
  stability: number;
  /** 0-100 */
  energy: number;
  /** >= 0 */
  alerts: number;
}

export interface StoryStageDto {
  id: string;
  order: number;
  title: string;
  narrative: string;
  dominantEvent: SignalType;
  metrics: StoryMetricsDto;
  /** Identificador (no URL), ej: "pixel_forest-stage-1" */
  assetKey: string;
  /** emerald | violet | cyan | amber | rose | indigo | lime | sky */
  colorToken: string;
  /** posicion de la etapa (order/7), NO el scroll del usuario */
  progress: number;
}

export interface SectorStoryDto {
  sector: { id: string; name: string; climate: Climate };
  stages: StoryStageDto[];
}
