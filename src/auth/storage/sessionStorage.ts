// Persistencia de la sesion en localStorage (sobrevive a recargas).
const KEY = "tropelcare.session";

export interface StoredSession {
  token: string;
  expiresAt: string;
}

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.token === "string" && typeof record.expiresAt === "string";
}

export const sessionStore = {
  read(): StoredSession | null {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!isStoredSession(parsed)) return null;
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        window.localStorage.removeItem(KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },
  write(session: StoredSession): void {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(session));
    } catch {
      /* almacenamiento no disponible: la sesion vive solo en memoria */
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  },
};
