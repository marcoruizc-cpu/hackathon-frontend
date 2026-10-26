import { request } from "../../common/api/httpClient";
import type { DashboardSummaryDto } from "../dto/dashboard.dto";

export const dashboardApi = {
  summary: (signal?: AbortSignal) => request<DashboardSummaryDto>("/dashboard/summary", { signal }),
};
