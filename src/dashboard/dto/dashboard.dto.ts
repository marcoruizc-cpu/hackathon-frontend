import type { Severity } from "../../signal/dto/signal.dto";

export interface DashboardSummaryDto {
  totalTropels: number;
  criticalTropels: number;
  openSignals: number;
  sectorStabilityAvg: number;
  signalsBySeverity: Record<Severity, number>;
  generatedAt: string;
}
