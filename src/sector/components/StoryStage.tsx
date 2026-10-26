import type { CSSProperties, KeyboardEvent } from "react";
import { humanize } from "../../common/utils/format";
import type { StoryStageDto } from "../dto/sector.dto";
import { colorFor } from "./storyTheme";

interface StoryStageProps {
  stage: StoryStageDto;
  index: number;
  total: number;
  active: boolean;
  registerRef: (node: HTMLElement | null) => void;
  onFocusStage: (index: number) => void;
  onKeyNavigate: (event: KeyboardEvent<HTMLElement>, index: number) => void;
}

// Cada etapa es un <article> enfocable: el contenido SIEMPRE esta en el DOM y visible,
// la animacion solo realza la etapa activa (nunca oculta texto).
export function StoryStage({ stage, index, total, active, registerRef, onFocusStage, onKeyNavigate }: StoryStageProps) {
  return (
    <li className="story-stage-slot">
      <article
        ref={registerRef}
        data-index={index}
        tabIndex={0}
        aria-current={active ? "step" : undefined}
        aria-labelledby={`stage-title-${stage.id}`}
        className={`story-stage ${active ? "is-active" : ""}`}
        style={{ "--accent": colorFor(stage.colorToken) } as CSSProperties}
        onFocus={(event) => {
          // Solo con teclado (no al hacer click): centra la etapa enfocada y la activa.
          if (event.currentTarget.matches(":focus-visible")) onFocusStage(index);
        }}
        onKeyDown={(event) => onKeyNavigate(event, index)}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
          Etapa {index + 1} de {total} · {humanize(stage.dominantEvent)}
        </p>
        <h2 id={`stage-title-${stage.id}`} className="mt-2 text-2xl font-bold text-slate-50">
          {stage.title}
        </h2>
        <p className="mt-3 leading-relaxed text-slate-300">{stage.narrative}</p>
        <p className="mt-4 text-xs text-slate-500">
          Estabilidad {stage.metrics.stability}% · Energía {stage.metrics.energy}% · Alertas {stage.metrics.alerts}
        </p>
      </article>
    </li>
  );
}
