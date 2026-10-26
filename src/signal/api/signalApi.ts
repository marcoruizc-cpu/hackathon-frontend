import { request } from "../../common/api/httpClient";
import type { MutableSignalStatus, SignalDto, SignalFeedQuery, SignalFeedResponseDto } from "../dto/signal.dto";

export const signalApi = {
  feed: (query: SignalFeedQuery, signal?: AbortSignal) =>
    request<SignalFeedResponseDto>("/signals/feed", {
      signal,
      query: {
        cursor: query.cursor,
        limit: query.limit,
        signalType: query.signalType,
        severity: query.severity,
        status: query.status,
        q: query.q.trim(),
      },
    }),
  detail: (id: string, signal?: AbortSignal) => request<SignalDto>(`/signals/${encodeURIComponent(id)}`, { signal }),
  updateStatus: (id: string, status: MutableSignalStatus) =>
    request<SignalDto>(`/signals/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } }),
};
