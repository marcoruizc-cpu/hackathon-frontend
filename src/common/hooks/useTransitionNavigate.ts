import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate, type NavigateOptions, type To } from "react-router-dom";
import { prefersReducedMotion } from "./usePrefersReducedMotion";

// View Transition API con fallback:
// - Si el navegador la soporta y no hay reduced-motion => document.startViewTransition.
// - Si no => navegacion normal (funciona igual, solo sin animacion).

interface ViewTransitionLike {
  finished: Promise<void>;
}
type StartViewTransition = (update: () => void) => ViewTransitionLike;

export function getStartViewTransition(): StartViewTransition | null {
  const candidate = (document as unknown as { startViewTransition?: StartViewTransition }).startViewTransition;
  return typeof candidate === "function" ? candidate.bind(document) : null;
}

export function supportsViewTransitions(): boolean {
  return getStartViewTransition() !== null;
}

export function useTransitionNavigate(): (to: To, options?: NavigateOptions) => void {
  const navigate = useNavigate();
  return useCallback(
    (to: To, options?: NavigateOptions) => {
      const start = getStartViewTransition();
      if (!start || prefersReducedMotion()) {
        navigate(to, options);
        return;
      }
      start(() => {
        flushSync(() => navigate(to, options));
      });
    },
    [navigate],
  );
}
