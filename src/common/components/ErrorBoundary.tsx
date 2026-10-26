import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

// Captura errores de render para que la app nunca quede en blanco.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Error de render", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-50">Algo se rompió en la consola</h1>
        <p className="text-slate-400">{this.state.error.message}</p>
        <button type="button" className="btn-primary" onClick={() => window.location.assign("/dashboard")}>
          Volver al dashboard
        </button>
      </main>
    );
  }
}
