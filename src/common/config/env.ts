// Unico lugar donde se leen variables de entorno.
function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export const env = {
  apiBaseUrl: trimSlash(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1"),
  defaultTeamCode: import.meta.env.VITE_DEFAULT_TEAM_CODE ?? "",
  defaultEmail: import.meta.env.VITE_DEFAULT_EMAIL ?? "",
} as const;
