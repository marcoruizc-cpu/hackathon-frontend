// Formato unico de error del backend:
// { error: "VALIDATION_ERROR", message, timestamp, path, details }
export interface ApiErrorBody {
  error: string;
  message: string;
  timestamp?: string;
  path?: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryAfterSeconds: number | null;
  readonly details: Record<string, unknown>;

  constructor(status: number, code: string, message: string, retryAfterSeconds: number | null = null, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isRateLimited(): boolean {
    return this.status === 429;
  }

  /** 423 = recurso bloqueado (en One Piece: LOG_POSE_REQUIRED hasta aprobar el CP3). */
  get isLocked(): boolean {
    return this.status === 423;
  }
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.error === "string" && typeof record.message === "string";
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export interface ErrorDescription {
  title: string;
  message: string;
  retryAfterSeconds: number | null;
  locked: boolean;
  notFound: boolean;
}

/** Traduce cualquier error a un texto entendible por el usuario. */
export function describeError(error: unknown): ErrorDescription {
  if (error instanceof ApiError) {
    const base = { retryAfterSeconds: error.retryAfterSeconds, locked: error.isLocked, notFound: error.isNotFound };
    switch (error.status) {
      case 0:
        return { ...base, title: "Sin conexión", message: "No se pudo contactar con el servidor. Revisa tu red o la URL de la API." };
      case 400:
        return { ...base, title: "Solicitud inválida", message: error.message };
      case 401:
        return { ...base, title: "Sesión no válida", message: "Tu sesión expiró o las credenciales no son correctas." };
      case 404:
        return { ...base, title: "No encontrado", message: "El recurso no existe o no pertenece a tu equipo." };
      case 423:
        return { ...base, title: "Zona bloqueada", message: `${error.message} (${error.code}). Se desbloquea cuando el TA apruebe el checkpoint previo.` };
      case 429:
        return {
          ...base,
          title: "Demasiadas solicitudes",
          message: error.retryAfterSeconds !== null ? `Límite alcanzado. Reintenta en ${error.retryAfterSeconds} s.` : "Límite alcanzado. Reintenta en unos segundos.",
        };
      default:
        return { ...base, title: "Error del servidor", message: `${error.message} (${error.code}).` };
    }
  }
  return {
    title: "Error inesperado",
    message: error instanceof Error ? error.message : "Ocurrió un error desconocido.",
    retryAfterSeconds: null,
    locked: false,
    notFound: false,
  };
}
