// Registro de caches en memoria que deben borrarse al cerrar sesion
// (evita que un equipo vea datos de la sesion anterior).
const clearers = new Set<() => void>();

export function registerSessionCache(clear: () => void): void {
  clearers.add(clear);
}

export function clearSessionCaches(): void {
  clearers.forEach((clear) => clear());
}
