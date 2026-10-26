import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

// Layout privado: barra superior + contenido. Para agregar una seccion nueva,
// basta con sumar un item a NAV_ITEMS y su ruta en app/router.tsx.
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tropels", label: "Tropeles" },
  { to: "/signals", label: "Señales" },
  { to: "/sectors", label: "Sectores" },
] as const;

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-cyan-500 focus:px-3 focus:py-2 focus:text-slate-950">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <NavLink to="/dashboard" className="flex shrink-0 items-center gap-2 font-bold text-slate-50">
            <span aria-hidden="true" className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_12px] shadow-cyan-400" />
            <span className="hidden sm:inline">TropelCare</span>
          </NavLink>
          <nav aria-label="Principal" className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${isActive ? "bg-slate-800 text-cyan-300" : "text-slate-300 hover:bg-slate-900 hover:text-slate-50"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            {user && (
              <span className="hidden text-right text-xs leading-tight text-slate-400 md:block">
                <span className="block text-slate-200">{user.displayName}</span>
                {user.teamCode}
              </span>
            )}
            <button type="button" onClick={logout} className="btn-secondary text-sm">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
