import type { CSSProperties } from "react";
import type { Climate, StoryStageDto } from "../dto/sector.dto";

// Mapa LOCAL de identificadores -> visual. El backend solo manda ids (assetKey, colorToken);
// toda la narrativa y las metricas siguen viniendo de la API.

export const COLOR_TOKENS: Record<string, string> = {
  emerald: "#10b981",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  amber: "#f59e0b",
  rose: "#f43f5e",
  indigo: "#6366f1",
  lime: "#84cc16",
  sky: "#0ea5e9",
};

export function colorFor(token: string): string {
  return COLOR_TOKENS[token] ?? "#22d3ee";
}

export const CLIMATE_LABELS: Record<Climate, string> = {
  PIXEL_FOREST: "Bosque de píxeles",
  NEON_CAVE: "Cueva de neón",
  CLOUD_AQUARIUM: "Acuario de nubes",
  RETRO_ARCADE: "Arcade retro",
};

/** "pixel_forest-stage-3" -> { scene: "pixel_forest", stage: 3 } */
export function parseAssetKey(assetKey: string, fallbackClimate: Climate): { scene: string; stage: number } {
  const match = /^([a-z_]+)-stage-(\d+)$/.exec(assetKey);
  if (!match || !match[1] || !match[2]) return { scene: fallbackClimate.toLowerCase(), stage: 1 };
  return { scene: match[1], stage: Number(match[2]) };
}

/** Variables CSS que alimentan la escena: cambiar de etapa = cambiar variables => transicion CSS. */
export function stageStyle(stage: StoryStageDto): CSSProperties {
  return {
    "--accent": colorFor(stage.colorToken),
    "--stability": String(stage.metrics.stability),
    "--energy": String(stage.metrics.energy),
    "--alerts": String(stage.metrics.alerts),
    "--stage": String(stage.order),
  } as CSSProperties;
}

/** Nombre de View Transition compartido entre la tarjeta del resumen y la cabecera de la historia. */
export function sectorTransitionName(sectorId: string): string {
  return `sector-${sectorId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}
