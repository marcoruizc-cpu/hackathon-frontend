# Paso a paso de la implementación

Orden en que se construyó el frontend. Sirve como guía si mañana toca rehacer una parte desde cero
(cada paso indica los archivos clave). Tiempos pensados para 2 horas con 3 personas.

## 0. Preparación (todos, 10 min)

1. Abrir Swagger (`<backend>/docs`) y confirmar rutas, DTOs, enums y errores.
2. `cp .env.example .env` y poner `VITE_API_BASE_URL`.
3. `npm install && npm run dev` → login con las credenciales del TA.
4. Repartir: **A** = auth/layout/dashboard/deploy · **B** = lista paginada + feed · **C** = story.

## 1. Base común (`common/`)

1. `config/env.ts`: única lectura de `import.meta.env`.
2. `api/ApiError.ts`: error tipado (`status`, `code`, `retryAfterSeconds`) y `describeError()` → texto para el usuario.
3. `api/httpClient.ts`: `request<T>()` con token Bearer, query sin vacíos, `AbortSignal`, y callback global de 401.
4. `hooks/useApiResource.ts`: GET genérico. **Clave**: `AbortController` por `key`; respuesta abortada = descartada.
5. `components/Feedback.tsx`: `Spinner`, `ErrorState` (con reintentar), `EmptyState`, `PageHeader`.

## 2. CP1 — Encender la consola (`auth/`, `dashboard/`)

1. `auth/dto` + `auth/api`: `login()` y `me()`.
2. `auth/storage/sessionStorage.ts`: guardar `{token, expiresAt}`.
3. `auth/context/AuthContext.tsx`: estados `checking | authenticated | anonymous | error`; al montar llama `/auth/me`.
4. `auth/components/PrivateRoute.tsx`: sin sesión → `/login` guardando `from`.
5. `LoginPage`: valida `TEAM-000`, deshabilita el botón en vuelo, muestra errores (401/429).
6. `DashboardPage`: KPIs + barras CSS; loading / error / vacío.
7. ✅ Validar: abrir `/dashboard` sin sesión → login → recargar → salir.

## 3. CP2 — Lista paginada (`tropel/`)

1. `dto`: DTO + enums `as const` + `DEFAULT_TROPEL_QUERY`.
2. `hooks/useTropelUrlState.ts`: **la URL es el estado**. Parsear con defaults, normalizar inválidos, `update()` vuelve a página 0.
3. `hooks/useTropelList.ts`: `useApiResource` con key = query canónica → abort automático. `isStale` = data de otra key.
4. `TropelFilters` (search con debounce + selects), `TropelTable`, `Pagination`.
5. Contenedor con `min-h` fijo; filas viejas `invisible` mientras carga → layout estable, sin resultados viejos.
6. ✅ Validar: cambiar filtros rápido, cambiar orden durante una request (Network: la anterior aparece *canceled*), copiar URL.

## 4. CP3 — Feed infinito (`signal/`)

1. `store/feedStore.ts`: estado por combinación de filtros + `reconcile()` para PATCH.
2. `hooks/useSignalFeed.ts`:
   - `loadMore()` sale si hay request en vuelo o `!hasMore` (**una sola carga**).
   - `generationRef` + abort al cambiar filtros (**respuestas viejas descartadas**).
   - Dedup con `Set` de IDs.
   - Error: `phase = "error"` **sin borrar** items.
3. `common/hooks/useInfiniteScroll.ts`: `IntersectionObserver` sobre un sentinel; se recrea cuando cambian los items.
4. `SignalFeedPage`: filtros en URL, lista, pie con "cargando más" / error con reintento / fin de lista.
5. ✅ Validar: scroll rápido (Network: nunca dos `/feed` a la vez), cambiar filtro en vuelo, error en página 3.

## 5. CP4 — Atender una señal

1. Ruta hija `/signals/:id` dentro de `/signals` (router.tsx) → el feed no se desmonta = **misma posición**.
2. `common/components/Modal.tsx`: Escape, foco atrapado, bloqueo de scroll sin mover `scrollY`.
3. `hooks/useSignalStatusMutation.ts`: `pending` deshabilita botones; error conserva estado previo y permite reintentar.
4. `SignalDetailPanel`: al éxito → `setData(updated)` + `onSignalUpdated(updated)` (Outlet context) → `reconcile`.
5. ✅ Validar: abrir desde página avanzada, cambiar estado, volver (misma posición, estado reflejado), forzar error.

## 6. CP5 — Story Engine (`sector/`)

1. `SectorListPage` (resumen) → click = `useTransitionNavigate()` (View Transition + `flushSync`, fallback normal).
   Elemento compartido con `view-transition-name` vía `--vt`. Se pasa el sector en `location.state` para pintar la cabecera al instante.
2. `SectorStoryPage`: track con `view-timeline-name: --story`; grid de visual sticky + lista de etapas.
3. `useActiveStage`: `IntersectionObserver` con franja al 65 % → etapa activa.
4. `StoryVisual`: un solo `<figure>` persistente; la etapa activa cambia **variables CSS** (`--accent`, `--stability`,
   `--energy`, `--stage`) registradas con `@property` → transiciones. Métricas impresas = etapa activa.
5. `StoryProgress`: barra (`animation-timeline: --story` en `@supports`, fallback JS `--progress`) + stepper de botones.
6. Teclado: etapas con `tabIndex=0`; ↑/↓/PageUp/PageDown/Home/End mueven el foco y desplazan.
7. `story.css`: todo el movimiento dentro de `prefers-reduced-motion: no-preference`; en `reduce` todo estático.
8. ✅ Validar: recorrer en desktop, DevTools mobile, *Rendering → prefers-reduced-motion: reduce*, solo teclado.

## 7. 404 y deploy

1. `<Route path="*" element={<NotFoundPage />} />`.
2. `vercel.json` / `public/_redirects` para abrir cualquier ruta directo.
3. `npm run typecheck && npm run build` → deploy → probar una ruta profunda recargando.

## Checklist final antes de entregar

- [ ] `npm run typecheck` y `npm run build` sin errores; ningún `any` en respuestas de API.
- [ ] Ninguna librería prohibida en `package.json`.
- [ ] Network: sin cargas simultáneas del feed, requests viejas *canceled*, sin IDs repetidos.
- [ ] Reduced motion activado: nada se mueve y todo el contenido se ve.
- [ ] README con integrantes, comandos, variables, link del deploy y decisiones.
