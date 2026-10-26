import { Link, useLocation } from "react-router-dom";

// 404 para cualquier ruta que no exista (dentro o fuera de la sesion).
export function NotFoundPage() {
  const location = useLocation();
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div aria-hidden="true" className="relative flex h-40 w-40 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-dashed border-slate-700 motion-safe:animate-[spin_18s_linear_infinite]" />
        <span className="absolute inset-6 rounded-full blur-md" style={{ background: "linear-gradient(135deg, rgb(6 182 212 / 0.3), rgb(139 92 246 / 0.3))" }} />
        <span className="relative text-5xl font-black tracking-tight text-slate-100">404</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-50">Esta ruta no aparece en el mapa</h1>
      <p className="max-w-md text-slate-400">
        No encontramos <code className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-slate-200">{location.pathname}</code>. Puede que el enlace esté roto o que la página se haya movido.
      </p>
      <div className="flex gap-2">
        <Link to="/dashboard" className="btn-primary">Ir al dashboard</Link>
        <button type="button" className="btn-secondary" onClick={() => window.history.back()}>Volver</button>
      </div>
    </section>
  );
}
