import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError, describeError } from "../../common/api/ApiError";
import { env } from "../../common/config/env";
import { useAuth } from "../context/AuthContext";

const TEAM_CODE_PATTERN = /^TEAM-\d{3}$/;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [teamCode, setTeamCode] = useState(env.defaultTeamCode);
  const [email, setEmail] = useState(env.defaultEmail);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const normalizedTeam = teamCode.trim().toUpperCase();
    if (!TEAM_CODE_PATTERN.test(normalizedTeam)) {
      setError("El código de equipo debe tener el formato TEAM-001.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login({ teamCode: normalizedTeam, email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) {
        setError("Credenciales inválidas. Revisa equipo, email y contraseña.");
      } else {
        const info = describeError(err);
        setError(`${info.title}: ${info.message}`);
      }
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <span aria-hidden="true" className="h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_16px] shadow-cyan-400" />
          <div>
            <h1 className="text-xl font-bold text-slate-50">TropelCare Control Room</h1>
            <p className="text-sm text-slate-400">Ingresa con las credenciales de tu equipo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="teamCode" className="label">Código de equipo</label>
            <input id="teamCode" className="field uppercase" value={teamCode} onChange={(e) => setTeamCode(e.target.value)} placeholder="TEAM-001" autoComplete="organization" required />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@tuckersoft.com" autoComplete="username" required />
          </div>
          <div>
            <label htmlFor="password" className="label">Contraseña</label>
            <input id="password" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          </div>

          <p role="alert" aria-live="assertive" className="min-h-5 text-sm text-rose-300">
            {error}
          </p>

          <button type="submit" className="btn-primary w-full" disabled={submitting || !teamCode || !email || !password}>
            {submitting ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
}
