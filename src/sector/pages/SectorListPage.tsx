import type { CSSProperties, MouseEvent } from "react";
import { EmptyState, ErrorState, PageHeader, Spinner } from "../../common/components/Feedback";
import { useTransitionNavigate } from "../../common/hooks/useTransitionNavigate";
import { CLIMATE_LABELS, sectorTransitionName } from "../components/storyTheme";
import type { SectorSummaryDto } from "../dto/sector.dto";
import { useSectors } from "../hooks/useSectors";

// "Resumen" de sectores. Abrir una historia usa View Transition API (con fallback).
export function SectorListPage() {
  const { data, error, loading, reload } = useSectors();
  const transitionNavigate = useTransitionNavigate();
  const sectors = data?.items ?? [];

  function openStory(event: MouseEvent<HTMLAnchorElement>, sector: SectorSummaryDto) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; // nueva pestana: comportamiento normal
    event.preventDefault();
    transitionNavigate(`/sectors/${sector.id}/story`, { state: { sector } });
  }

  return (
    <section>
      <PageHeader title="Sectores" subtitle="Elige un sector para recorrer su historia" />
      {!data && loading && <Spinner className="min-h-64" label="Cargando sectores…" />}
      {!data && !loading && error !== null && <ErrorState error={error} onRetry={reload} />}
      {data && sectors.length === 0 && <EmptyState title="Sin sectores">Este workspace no tiene sectores.</EmptyState>}

      {sectors.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => {
            const loadPct = sector.capacity > 0 ? Math.round((sector.currentLoad / sector.capacity) * 100) : 0;
            return (
              <li key={sector.id}>
                <a href={`/sectors/${sector.id}/story`} onClick={(event) => openStory(event, sector)} className="card group block overflow-hidden transition-colors hover:border-slate-600">
                  <div
                    className="vt-shared story-thumb"
                    data-scene={sector.climate.toLowerCase()}
                    style={{ "--vt": sectorTransitionName(sector.id) } as CSSProperties}
                    aria-hidden="true"
                  />
                  <div className="p-4">
                    <p className="text-xs text-slate-500">{sector.sectorCode} · {CLIMATE_LABELS[sector.climate]}</p>
                    <h2 className="text-lg font-semibold text-slate-50 group-hover:text-cyan-300">{sector.name}</h2>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <p className="text-slate-400">Estabilidad <span className="block text-slate-100">{sector.stabilityLevel}%</span></p>
                      <p className="text-slate-400">Carga <span className="block text-slate-100">{sector.currentLoad}/{sector.capacity} ({loadPct}%)</span></p>
                    </div>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
