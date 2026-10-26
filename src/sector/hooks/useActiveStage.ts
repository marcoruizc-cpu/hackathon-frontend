import { useCallback, useEffect, useRef, useState } from "react";

// Detecta la etapa activa: la que cruza una linea al 65% del alto del viewport.
// Se usa 65% (y no 50%) para que en mobile la linea quede DEBAJO del visual sticky:
// asi la etapa activa siempre es la que el usuario esta leyendo, en desktop y mobile.
/** Fraccion del viewport donde se activa una etapa (debe coincidir con rootMargin). */
export const ACTIVATION_LINE = 0.65;

export function useActiveStage(count: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const nodesRef = useRef<(HTMLElement | null)[]>([]);

  const registerStage = useCallback((index: number) => (node: HTMLElement | null) => {
    nodesRef.current[index] = node;
  }, []);

  useEffect(() => {
    if (count === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isInteger(index)) setActiveIndex(index);
        }
      },
      { rootMargin: "-64% 0px -34% 0px", threshold: 0 }, // franja fina al 64-66% de la pantalla
    );
    nodesRef.current.slice(0, count).forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [count]);

  return { activeIndex, setActiveIndex, registerStage, nodesRef };
}
