import { env } from "../config/env";
import { ApiError, isAbortError, isApiErrorBody } from "./ApiError";

// Cliente HTTP unico (equivalente a un RestTemplate/WebClient en Spring).
// - Agrega el token Bearer.
// - Omite filtros vacios en la query (el backend los trata igual que omitidos).
// - Convierte errores HTTP en ApiError tipados.
// - Respeta AbortSignal para cancelar requests obsoletas.

export type QueryValue = string | number | boolean | null | undefined;
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
  /** false para endpoints publicos (login). */
  auth?: boolean;
}

interface HttpClientHooks {
  getToken: () => string | null;
  onUnauthorized: () => void;
}

let hooks: HttpClientHooks = {
  getToken: () => null,
  onUnauthorized: () => undefined,
};

export function configureHttpClient(next: HttpClientHooks): void {
  hooks = next;
}

export function buildQuery(query: Record<string, QueryValue> | undefined): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

function parseRetryAfter(response: Response): number | null {
  const raw = response.headers.get("Retry-After");
  if (!raw) return null;
  const seconds = Number(raw);
  return Number.isFinite(seconds) ? seconds : null;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", query, body, signal, auth = true } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = hooks.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${env.apiBaseUrl}${path}${buildQuery(query)}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ApiError(0, "NETWORK_ERROR", "No se pudo conectar con el servidor");
  }

  if (!response.ok) {
    let parsed: unknown = null;
    try {
      parsed = await response.json();
    } catch {
      parsed = null;
    }
    const code = isApiErrorBody(parsed) ? parsed.error : `HTTP_${response.status}`;
    const message = isApiErrorBody(parsed) ? parsed.message : response.statusText || "Error de servidor";
    const details = isApiErrorBody(parsed) && parsed.details ? parsed.details : {};
    if (response.status === 401 && auth) hooks.onUnauthorized();
    throw new ApiError(response.status, code, message, parseRetryAfter(response), details);
  }

  return (await response.json()) as T;
}
