import type { Species } from "../../tropel/dto/tropel.dto";

export const SIGNAL_TYPES = ["HAMBRE", "ABANDONO", "MUTACION", "FUGA", "CONFLICTO", "REPRODUCCION_MASIVA", "SENAL_CORRUPTA"] as const;
export type SignalType = (typeof SIGNAL_TYPES)[number];

export const SEVERITIES = ["LEVE", "MODERADO", "GRAVE", "CRITICO"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SIGNAL_STATUSES = ["RECIBIDA", "PROCESANDO", "ATENDIDA"] as const;
export type SignalStatus = (typeof SIGNAL_STATUSES)[number];

/** Estados que acepta PATCH /signals/{id}/status */
export const MUTABLE_SIGNAL_STATUSES = ["PROCESANDO", "ATENDIDA"] as const;
export type MutableSignalStatus = (typeof MUTABLE_SIGNAL_STATUSES)[number];

export interface SignalDto {
  id: string;
  signalType: SignalType;
  severity: Severity;
  status: SignalStatus;
  rawContent: string;
  tropel: { id: string; name: string; species: Species };
  createdAt: string;
  updatedAt: string;
}

export interface SignalFeedResponseDto {
  items: SignalDto[];
  nextCursor: string | null;
  hasMore: boolean;
  totalEstimate: number;
}

export interface SignalFeedFilters {
  signalType: SignalType | "";
  severity: Severity | "";
  status: SignalStatus | "";
  q: string;
}

export interface SignalFeedQuery extends SignalFeedFilters {
  cursor: string | null;
  limit: number;
}
