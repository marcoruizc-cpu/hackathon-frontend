import { useEffect, useRef, type RefObject } from "react";

// Infinite scroll propio con IntersectionObserver (sin librerias).
// `resetKey` debe cambiar cuando llegan items nuevos: se recrea el observer y,
// si el sentinel sigue visible (lista corta), vuelve a disparar.

interface Options {
  enabled: boolean;
  onReach: () => void;
  resetKey: string | number;
  rootMargin?: string;
}

export function useInfiniteScroll(sentinelRef: RefObject<Element>, { enabled, onReach, resetKey, rootMargin = "600px 0px" }: Options): void {
  const onReachRef = useRef(onReach);
  onReachRef.current = onReach;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!enabled || !node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onReachRef.current();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [sentinelRef, enabled, resetKey, rootMargin]);
}
