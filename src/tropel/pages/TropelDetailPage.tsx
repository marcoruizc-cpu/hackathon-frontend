import { Link, useLocation, useParams } from "react-router-dom";
import { ErrorState, PageHeader, Spinner } from "../../common/components/Feedback";
import { formatDate, humanize } from "../../common/utils/format";
import { Meter, VitalStateBadge } from "../components/Badges";
import { useTropelDetail } from "../hooks/useTropelList";

export function TropelDetailPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const backTo = (location.state as { backTo?: string } | null)?.backTo ?? "/tropels";
  const { data, error, loading, reload } = useTropelDetail(id);
  const tropel = data?.id === id ? data : null;

  return (
    <section className="mx-auto max-w-3xl">
      <Link to={backTo} className="mb-4 inline-block text-sm text-cyan-300 hover:underline">← Volver al Atlas</Link>
      {loading && !tropel && <Spinner className="min-h-64" />}
      {!loading && error !== null && <ErrorState error={error} onRetry={reload} />}
      {tropel && (
        <>
          <PageHeader title={tropel.name} subtitle={`${humanize(tropel.species)} · guardián ${tropel.guardianName}`} actions={<VitalStateBadge value={tropel.vitalState} />} />
          <dl className="card grid gap-4 p-6 sm:grid-cols-2">
            <div><dt className="label">Energía</dt><dd><Meter value={tropel.energyLevel} label="Energía" /></dd></div>
            <div><dt className="label">Índice de caos</dt><dd><Meter value={tropel.chaosIndex} label="Caos" color="bg-violet-400" /></dd></div>
            <div><dt className="label">Etapa de mutación</dt><dd className="text-slate-200">{tropel.mutationStage}</dd></div>
            <div><dt className="label">Sector</dt><dd className="text-slate-200">{tropel.sector.sectorCode} · {tropel.sector.name}</dd></div>
            <div><dt className="label">Creado</dt><dd className="text-slate-300">{formatDate(tropel.createdAt)}</dd></div>
            <div><dt className="label">Actualizado</dt><dd className="text-slate-300">{formatDate(tropel.updatedAt)}</dd></div>
          </dl>
        </>
      )}
    </section>
  );
}
