import { useApiResource } from "../../common/hooks/useApiResource";
import { dashboardApi } from "../api/dashboardApi";

export function useDashboardSummary() {
  return useApiResource("dashboard-summary", (signal) => dashboardApi.summary(signal));
}
