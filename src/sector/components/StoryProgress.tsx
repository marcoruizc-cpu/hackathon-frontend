import type { CSSProperties } from "react";
import type { StoryStageDto } from "../dto/sector.dto";
import { colorFor } from "./storyTheme";

interface StoryProgressProps {
  stages: StoryStageDto[];
  activeIndex: number;
  progress: number; // 0..1 del recorrido real del usuario
  onSelect: (index: number) => void;
}

// Barra de progreso + stepper navegable por teclado (Tab + Enter/Espacio).
export function StoryProgress({ stages, activeIndex, progress, onSelect }: StoryProgressProps) {
  const percent = Math.round(progress * 100);
  return (
    <div className="story-progress">
      <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
        <span>
          Etapa <strong className="text-slate-50">{activeIndex + 1}</strong> de {stages.length}
        </span>
        <span aria-live="off">Recorrido {percent}%</span>
      </div>
      <div
        className="story-progress-track"
        role="progressbar"
        aria-label="Progreso del recorrido"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        {/* --progress = fallback JS. Con soporte, la animacion scroll-driven toma el control. */}
        <div className="story-progress-bar" style={{ "--progress": String(progress) } as CSSProperties} />
      </div>
      <ol className="mt-2 flex justify-between gap-1" aria-label="Etapas de la historia">
        {stages.map((stage, index) => (
          <li key={stage.id} className="flex-1">
            <button
              type="button"
              className={`story-step ${index === activeIndex ? "is-active" : ""} ${index < activeIndex ? "is-done" : ""}`}
              style={{ "--accent": colorFor(stage.colorToken) } as CSSProperties}
              aria-current={index === activeIndex ? "step" : undefined}
              aria-label={`Ir a la etapa ${index + 1}: ${stage.title}`}
              onClick={() => onSelect(index)}
            >
              <span aria-hidden="true">{index + 1}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
