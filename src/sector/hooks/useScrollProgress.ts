import { useEffect, useState, type RefObject } from "react";
import { clamp } from "../../common/utils/format";

// Progreso del recorrido (0..1) dentro del track de la historia.
// Misma formula que el rango "contain" del view-timeline CSS, asi el texto "Recorrido NN%"
// coincide con la barra. Tambien es el FALLBACK de la barra cuando no hay
// Scroll-driven Animations (o con reduced-motion).
export function useScrollProgress(trackRef: RefObject<HTMLElement>, enabled: boolean): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const node = trackRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      setProgress(scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 1);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [trackRef, enabled]);

  return progress;
}
