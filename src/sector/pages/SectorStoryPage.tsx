import { useCallback, useLayoutEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ErrorState, Spinner } from "../../common/components/Feedback";
import { usePrefersReducedMotion } from "../../common/hooks/usePrefersReducedMotion";
import { useTransitionNavigate } from "../../common/hooks/useTransitionNavigate";
import { StoryProgress } from "../components/StoryProgress";
import { StoryStage } from "../components/StoryStage";
import { StoryVisual } from "../components/StoryVisual";
import { CLIMATE_LABELS, sectorTransitionName } from "../components/storyTheme";
import type { SectorSummaryDto } from "../dto/sector.dto";
import { ACTIVATION_LINE, useActiveStage } from "../hooks/useActiveStage";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { useSectorStory } from "../hooks/useSectors";

// Sector Story Engine: scrollytelling 100% basado en GET /sectors/:id/story.
export function SectorStoryPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const preview = (location.state as { sector?: SectorSummaryDto } | null)?.sector;
  const { data, error, loading, reload } = useSectorStory(id);
  const story = data?.sector.id === id ? data : null;
  const stages = useMemo(() => (story ? [...story.stages].sort((a, b) => a.order - b.order) : []), [story]);

  const { activeIndex, setActiveIndex, registerStage, nodesRef } = useActiveStage(stages.length);
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(trackRef, stages.length > 0);
  const reducedMotion = usePrefersReducedMotion();
  const transitionNavigate = useTransitionNavigate();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    setActiveIndex(0);
  }, [id, setActiveIndex]);

  const scrollToStage = useCallback(
    (index: number) => {
      const node = nodesRef.current[index];
      if (!node) return;
      // Coloca la etapa sobre la linea de activacion (65% del viewport, ver useActiveStage).
      const rect = node.getBoundingClientRect();
      const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight * ACTIVATION_LINE;
      window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? "auto" : "smooth" });
      setActiveIndex(index);
    },
    [nodesRef, reducedMotion, setActiveIndex],
  );

  const goTo = useCallback(
    (index: number) => {
      const node = nodesRef.current[index];
      if (!node) return;
      node.focus({ preventScroll: true });
      scrollToStage(index);
    },
    [nodesRef, scrollToStage],
  );

  const onKeyNavigate = useCallback(
    (event: KeyboardEvent<HTMLElement>, index: number) => {
      const last = stages.length - 1;
      const target =
        event.key === "ArrowDown" || event.key === "PageDown" || event.key === "j" ? Math.min(last, index + 1)
        : event.key === "ArrowUp" || event.key === "PageUp" || event.key === "k" ? Math.max(0, index - 1)
        : event.key === "Home" ? 0
        : event.key === "End" ? last
        : null;
      if (target === null) return;
      event.preventDefault();
      goTo(target);
    },
    [goTo, stages.length],
  );

  function back(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    transitionNavigate("/sectors");
  }

  const name = story?.sector.name ?? preview?.name ?? "Sector";
  const climate = story?.sector.climate ?? preview?.climate ?? null;
  const activeStage = stages[activeIndex] ?? stages[0] ?? null;

  return (
    <article className="story-root" aria-labelledby="story-title">
      <header className="mb-6">
        <a href="/sectors" onClick={back} className="text-sm text-cyan-300 hover:underline">← Volver a sectores</a>
        <div
          className="vt-shared story-hero mt-3"
          data-scene={climate ? climate.toLowerCase() : undefined}
          style={{ "--vt": sectorTransitionName(id) } as CSSProperties}
        >
          <div className="relative z-10 p-6">
            <p className="text-xs uppercase tracking-widest text-white/70">{climate ? CLIMATE_LABELS[climate] : "Historia del sector"}</p>
            <h1 id="story-title" className="text-3xl font-bold text-white sm:text-4xl">{name}</h1>
            <p className="mt-1 text-sm text-white/80">Desplázate (o usa Tab / ↑ ↓) para recorrer las {stages.length || 8} etapas.</p>
          </div>
        </div>
      </header>

      {!story && loading && <Spinner label="Cargando historia…" className="min-h-[50vh]" />}
      {!story && !loading && error !== null && <ErrorState error={error} onRetry={reload} />}

      {story && activeStage && climate && (
        <div ref={trackRef} className="story-track">
          <StoryProgress stages={stages} activeIndex={activeIndex} progress={progress} onSelect={goTo} />

          <div className="story-layout">
            <div className="story-visual-slot">
              <StoryVisual stage={activeStage} climate={climate} total={stages.length} />
            </div>

            <ol className="story-stages" aria-label="Narrativa por etapas">
              {stages.map((stage, index) => (
                <StoryStage
                  key={stage.id}
                  stage={stage}
                  index={index}
                  total={stages.length}
                  active={index === activeIndex}
                  registerRef={registerStage(index)}
                  onFocusStage={scrollToStage}
                  onKeyNavigate={onKeyNavigate}
                />
              ))}
            </ol>
          </div>
          <div className="h-[35vh]" aria-hidden="true" />
        </div>
      )}
    </article>
  );
}
