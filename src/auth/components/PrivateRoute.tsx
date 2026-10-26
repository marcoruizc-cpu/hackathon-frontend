import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ErrorState, Spinner } from "../../common/components/Feedback";
import { useAuth } from "../context/AuthContext";

// Guard de rutas privadas. Guarda la ruta pedida para volver tras el login.
export function PrivateRoute() {
  const { status, restoreError, retryRestore } = useAuth();
  const location = useLocation();

  if (status === "checking") return <Spinner label="Restaurando sesión…" className="min-h-screen" />;
  if (status === "error") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
        <ErrorState error={restoreError} onRetry={retryRestore} className="w-full" />
      </main>
    );
  }
  if (status === "anonymous") return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  return <Outlet />;
}

/** Evita mostrar el login a alguien que ya tiene sesion. */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  if (status === "checking") return <Spinner label="Restaurando sesión…" className="min-h-screen" />;
  if (status === "authenticated") return <Navigate to={from} replace />;
  return <Outlet />;
}
