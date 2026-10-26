import { useCallback, useRef, useState } from "react";
import { signalApi } from "../api/signalApi";
import type { MutableSignalStatus, SignalDto } from "../dto/signal.dto";

// PATCH de estado SIN actualizacion optimista:
// - pending bloquea la accion mientras la request esta en vuelo.
// - si falla, el estado anterior se conserva y se ofrece reintentar el mismo cambio.
export interface StatusMutationState {
  pending: MutableSignalStatus | null;
  lastAttempt: MutableSignalStatus | null;
  error: unknown;
  success: SignalDto | null;
}

const IDLE: StatusMutationState = { pending: null, lastAttempt: null, error: null, success: null };

export function useSignalStatusMutation(signalId: string, onSuccess: (updated: SignalDto) => void) {
  const [state, setState] = useState<StatusMutationState>(IDLE);
  const inFlight = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const mutate = useCallback(
    async (status: MutableSignalStatus) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setState({ pending: status, lastAttempt: status, error: null, success: null });
      try {
        const updated = await signalApi.updateStatus(signalId, status);
        onSuccessRef.current(updated);
        setState({ pending: null, lastAttempt: status, error: null, success: updated });
      } catch (error) {
        setState({ pending: null, lastAttempt: status, error, success: null });
      } finally {
        inFlight.current = false;
      }
    },
    [signalId],
  );

  const retry = useCallback(() => {
    if (state.lastAttempt) void mutate(state.lastAttempt);
  }, [mutate, state.lastAttempt]);

  return { ...state, mutate, retry };
}
