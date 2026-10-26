import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ApiError, isAbortError } from "../../common/api/ApiError";
import { configureHttpClient } from "../../common/api/httpClient";
import { clearSessionCaches } from "../../common/utils/sessionCaches";
import { authApi } from "../api/authApi";
import type { LoginRequestDto, UserDto } from "../dto/auth.dto";
import { sessionStore } from "../storage/sessionStorage";

// Capa "service" de auth: estado global de sesion.
// checking      -> validando token guardado con GET /auth/me
// authenticated -> sesion valida
// anonymous     -> sin sesion
// error         -> no se pudo validar (red caida): se ofrece reintentar sin borrar el token
export type AuthStatus = "checking" | "authenticated" | "anonymous" | "error";

interface AuthContextValue {
  status: AuthStatus;
  user: UserDto | null;
  restoreError: unknown;
  login: (credentials: LoginRequestDto) => Promise<void>;
  logout: () => void;
  retryRestore: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const tokenRef = useRef<string | null>(sessionStore.read()?.token ?? null);
  const [status, setStatus] = useState<AuthStatus>(tokenRef.current ? "checking" : "anonymous");
  const [user, setUser] = useState<UserDto | null>(null);
  const [restoreError, setRestoreError] = useState<unknown>(null);
  const [restoreNonce, setRestoreNonce] = useState(0);

  const logout = useCallback(() => {
    tokenRef.current = null;
    sessionStore.clear();
    clearSessionCaches();
    setUser(null);
    setStatus("anonymous");
  }, []);

  // Se configura durante el render para que ninguna request salga sin token.
  configureHttpClient({ getToken: () => tokenRef.current, onUnauthorized: logout });

  // Restauracion de sesion al recargar.
  useEffect(() => {
    if (!tokenRef.current) return;
    const controller = new AbortController();
    setStatus("checking");
    authApi
      .me(controller.signal)
      .then((me) => {
        setUser(me);
        setStatus("authenticated");
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        if (error instanceof ApiError && error.isUnauthorized) {
          logout();
          return;
        }
        setRestoreError(error);
        setStatus("error");
      });
    return () => controller.abort();
  }, [restoreNonce, logout]);

  const login = useCallback(async (credentials: LoginRequestDto) => {
    const response = await authApi.login(credentials);
    tokenRef.current = response.token;
    sessionStore.write({ token: response.token, expiresAt: response.expiresAt });
    clearSessionCaches();
    setUser(response.user);
    setRestoreError(null);
    setStatus("authenticated");
  }, []);

  const retryRestore = useCallback(() => setRestoreNonce((n) => n + 1), []);

  const value = useMemo(() => ({ status, user, restoreError, login, logout, retryRestore }), [status, user, restoreError, login, logout, retryRestore]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
