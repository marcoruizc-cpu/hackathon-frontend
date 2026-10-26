import { humanize } from "../../common/utils/format";
import type { Climate, StoryStageDto } from "../dto/sector.dto";
import { parseAssetKey, stageStyle } from "./storyTheme";

const MAX_ALERT_DOTS = 24;

interface StoryVisualProps {
  stage: StoryStageDto;
  climate: Climate;
  total: number;
}

// Visual PERSISTENTE: un solo nodo que no se desmonta; al cambiar la etapa activa solo
// cambian data-attributes y variables CSS, y la escena transiciona (sin video/canvas/GIF).
export function StoryVisual({ stage, climate, total }: StoryVisualProps) {
  const { scene, stage: assetStage } = parseAssetKey(stage.assetKey, climate);
  const dots = Math.min(stage.metrics.alerts, MAX_ALERT_DOTS);

  return (
    <figure
      className="story-visual"
      data-scene={scene}
      data-asset-stage={assetStage}
      data-asset-key={stage.assetKey}
      style={stageStyle(stage)}
      aria-labelledby="story-visual-caption"
    >
      <div className="scene-sky" aria-hidden="true" />
      <div className="scene-far" aria-hidden="true" />
      <div className="scene-near" aria-hidden="true" />
      <div className="scene-core" aria-hidden="true">
        <div className="scene-ring" />
        <div className="scene-orb" />
        <ul className="scene-alerts">
          {Array.from({ length: dots }, (_, i) => (
            <li key={i} style={{ transform: `rotate(${(360 / Math.max(1, dots)) * i}deg)` }} />
          ))}
        </ul>
      </div>

      <figcaption id="story-visual-caption" className="scene-panel">
        <p className="text-xs uppercase tracking-widest text-white/70">
          Etapa {stage.order + 1} / {total} · {humanize(stage.dominantEvent)}
        </p>
        <p className="scene-title mt-1 text-lg font-bold text-white">{stage.title}</p>
        {/* Metricas de la etapa ACTIVA (vienen de la API, no son los KPIs actuales). */}
        <dl className="mt-3 grid grid-cols-3 gap-2 text-center" aria-live="polite">
          <div className="scene-metric">
            <dt>Estabilidad</dt>
            <dd>{stage.metrics.stability}%</dd>
          </div>
          <div className="scene-metric">
            <dt>Energía</dt>
            <dd>{stage.metrics.energy}%</dd>
          </div>
          <div className="scene-metric">
            <dt>Alertas</dt>
            <dd>{stage.metrics.alerts}</dd>
          </div>
        </dl>
      </figcaption>
    </figure>
  );
}
