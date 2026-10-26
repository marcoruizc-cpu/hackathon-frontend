import { useCallback } from "react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { ErrorState, Spinner } from "../../common/components/Feedback";
import { Modal } from "../../common/components/Modal";
import { useApiResource } from "../../common/hooks/useApiResource";
import { formatDate, humanize } from "../../common/utils/format";
import { signalApi } from "../api/signalApi";
import { SeverityBadge, StatusBadge } from "../components/SignalBadges";
import { MUTABLE_SIGNAL_STATUSES, type SignalDto } from "../dto/signal.dto";
import { useSignalStatusMutation } from "../hooks/useSignalStatusMutation";
import type { SignalFeedOutletContext } from "./SignalFeedPage";

export function SignalDetailPanel() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { onSignalUpdated } = useOutletContext<SignalFeedOutletContext>();

  const resource = useApiResource(`signal:${id}`, (abort) => signalApi.detail(id, abort));
  const signal = resource.data?.id === id ? resource.data : null;

  const handleUpdated = useCallback(
    (updated: SignalDto) => {
      resource.setData(() => updated);
      onSignalUpdated(updated); // reflejar en el feed al volver
    },
    [resource.setData, onSignalUpdated],
  );
  const mutation = useSignalStatusMutation(id, handleUpdated);

  const close = useCallback(() => {
    const fromFeed = (location.state as { fromFeed?: boolean } | null)?.fromFeed === true;
    if (fromFeed) navigate(-1); // vuelve a la misma entrada del historial => misma posicion
    else navigate({ pathname: "/signals", search: location.search });
  }, [location.state, location.search, navigate]);

  return (
    <Modal titleId="signal-detail-title" onClose={close}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-slate-500">{id}</p>
          <h2 id="signal-detail-title" className="text-xl font-bold text-slate-50">
            {signal ? humanize(signal.signalType) : "Detalle de señal"}
          </h2>
        </div>
        <button type="button" className="btn-secondary" onClick={close} aria-label="Cerrar detalle">✕</button>
      </div>

      {!signal && resource.loading && <Spinner label="Cargando señal…" className="min-h-40" />}
      {!signal && !resource.loading && resource.error !== null && <ErrorState error={resource.error} onRetry={resource.reload} />}

      {signal && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <SeverityBadge value={signal.severity} />
            <StatusBadge value={signal.status} />
          </div>
          <p className="text-slate-200">{signal.rawContent}</p>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="label">Tropel</dt><dd className="text-slate-200">{signal.tropel.name}</dd></div>
            <div><dt className="label">Especie</dt><dd className="text-slate-200">{humanize(signal.tropel.species)}</dd></div>
            <div><dt className="label">Creada</dt><dd className="text-slate-300">{formatDate(signal.createdAt)}</dd></div>
            <div><dt className="label">Actualizada</dt><dd className="text-slate-300">{formatDate(signal.updatedAt)}</dd></div>
          </dl>

          <section aria-labelledby="status-actions" className="card p-4">
            <h3 id="status-actions" className="mb-3 font-semibold text-slate-100">Atender señal</h3>
            <div className="flex flex-wrap gap-2">
              {MUTABLE_SIGNAL_STATUSES.map((status) => {
                const isCurrent = signal.status === status;
                const isPending = mutation.pending === status;
                return (
                  <button
                    key={status}
                    type="button"
                    className={status === "ATENDIDA" ? "btn-primary" : "btn-secondary"}
                    disabled={mutation.pending !== null || isCurrent}
                    aria-busy={isPending}
                    onClick={() => void mutation.mutate(status)}
                  >
                    {isPending ? "Guardando…" : isCurrent ? `${humanize(status)} ✓` : `Marcar ${humanize(status).toLowerCase()}`}
                  </button>
                );
              })}
            </div>

            <div aria-live="polite" className="mt-3 min-h-6 text-sm">
              {mutation.success && (
                <p role="status" className="text-emerald-300">✓ Estado actualizado a {humanize(mutation.success.status)}.</p>
              )}
            </div>
            {mutation.error !== null && (
              <ErrorState error={mutation.error} onRetry={mutation.retry} retryLabel="Reintentar cambio" compact className="mt-2 text-left" />
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}
