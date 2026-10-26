# Mapeo TropelCare → One Piece

La API de One Piece tiene **la misma forma** que la de TropelCare: login + dashboard, una lista paginada,
un feed cursor-based con PATCH de estado, y un scrollytelling por etapas. Solo cambian nombres, campos y enums,
y aparece un "candado" (Log Pose).

> **Primero abre Swagger (`/docs`)** y copia los DTOs reales. Esta tabla es la equivalencia esperada;
> los nombres exactos de campos/enums/sorts salen de Swagger, no de aquí.

## 1. Equivalencia de endpoints

| One Piece | Uso | TropelCare (este repo) | Feature/carpeta a adaptar |
|---|---|---|---|
| `POST /auth/login` | Login `teamCode,email,password` | igual | `auth/` (sin cambios) |
| `GET /auth/me` | Restaurar sesión | igual | `auth/` (sin cambios) |
| `GET /dashboard/summary` | Indicadores de la tripulación | igual (otros campos) | `dashboard/dto` + `DashboardPage` |
| `GET /log-pose` | Estado del Log Pose | — (nuevo) | nueva `logpose/` (ver §3) |
| `GET /crews` | Tripulaciones piratas | `GET /sectors` como lista para filtros | `sector/hooks/useSectors` → `crew/` |
| `GET /wanted` | Carteles paginados | `GET /tropels` | `tropel/` → `wanted/` |
| `GET /wanted/{id}` | Detalle de cartel | `GET /tropels/{id}` | `TropelDetailPage` |
| `GET /news/feed` 🔒 | Noticias, cursor-based | `GET /signals/feed` | `signal/` → `news/` |
| `GET /news/{id}` 🔒 | Detalle de noticia | `GET /signals/{id}` | `SignalDetailPanel` |
| `PATCH /news/{id}/status` 🔒 | Verificar noticia | `PATCH /signals/{id}/status` | `useSignalStatusMutation` |
| `GET /sagas` 🔒 | Sagas disponibles | `GET /sectors` | `SectorListPage` |
| `GET /sagas/{id}/story` 🔒 | Historia visual | `GET /sectors/{id}/story` | `SectorStoryPage` |

🔒 = "Grand Line": responden **`423 LOG_POSE_REQUIRED`** hasta que el TA apruebe el CP3.

## 2. Pasos de reemplazo (≈ 20–30 min si el contrato es igual)

1. **Copiar y renombrar carpetas** (o renombrar en el IDE con *Refactor → Rename*, que actualiza imports):
   `tropel/ → wanted/`, `signal/ → news/`, `sector/ → saga/`.
2. **`api/*.ts`**: cambiar solo las rutas (`/tropels` → `/wanted`, `/signals/feed` → `/news/feed`, `/sectors` → `/sagas`…).
3. **`dto/*.ts`**: pegar los tipos de Swagger. Actualizar los arrays `as const` de enums
   (`SPECIES`, `VITAL_STATES`, `SIGNAL_TYPES`, `SEVERITIES`, `SIGNAL_STATUSES`, `MUTABLE_SIGNAL_STATUSES`, `TROPEL_SORTS`, `CLIMATES`).
   Al cambiar un enum, TypeScript marca en rojo todos los `Record<Enum, …>` (badges, labels): rellenarlos.
4. **Filtros de la lista** (`useTropelUrlState` + `TropelFilters`): renombrar parámetros
   (p. ej. `sectorId` → `crewId`, con opciones desde `GET /crews`). La lógica de URL/abort/paginación no cambia.
5. **Feed**: renombrar filtros (`signalType/severity/status`) a los de noticias. `matchesFilters` en
   `news/store/feedStore.ts` debe comparar el campo que cambia el PATCH (estado de verificación).
6. **Story**: `parseAssetKey` y `[data-scene="…"]` en `story.css` → nombres de las sagas/escenarios de Swagger.
   `COLOR_TOKENS` → la paleta que indique el enunciado. **Nada de imágenes ni logos oficiales**: solo CSS.
7. **Textos**: `NAV_ITEMS` (AppLayout), títulos de páginas, `<title>` de `index.html`, regex del team code en `LoginPage`
   si cambia el formato.
8. `npm run typecheck` hasta que no haya errores → `npm run build`.

## 3. El candado del Log Pose (423)

Ya está soportado de forma genérica:

- `ApiError.isLocked` es `true` con status 423.
- `ErrorState` lo muestra como **"🔒 Zona bloqueada"** con el botón **"Volver a comprobar"** (que reintenta).

Para mostrar el estado en la barra superior, crear `src/logpose/` con el mismo patrón (adaptar el DTO a Swagger):

```ts
// logpose/dto/logPose.dto.ts  (EJEMPLO: copiar campos reales de Swagger)
export interface LogPoseDto { unlocked: boolean; /* … */ }

// logpose/api/logPoseApi.ts
export const logPoseApi = { get: (signal?: AbortSignal) => request<LogPoseDto>("/log-pose", { signal }) };

// logpose/hooks/useLogPose.ts
export const useLogPose = () => useApiResource("log-pose", (s) => logPoseApi.get(s));
```

Y en `AppLayout`, marcar con 🔒 los links de Noticias/Sagas mientras `!data?.unlocked`, con un botón que llame `reload()`.
No hace falta polling: se re-consulta al montar el layout y al pulsar "Volver a comprobar".

## 4. Lo que NO se toca (ya resuelve los criterios de evaluación)

- `common/api/httpClient.ts` (token, query sin vacíos, errores tipados, abort).
- `common/hooks/useApiResource.ts` (abort de requests viejas).
- `common/hooks/useInfiniteScroll.ts`, `signal/hooks/useSignalFeed.ts` (dedup, 1 en vuelo, generación, error parcial).
- `common/hooks/useTransitionNavigate.ts`, `sector/hooks/useActiveStage.ts`, `useScrollProgress.ts`.
- Ruta hija para el detalle del feed (conserva posición), `NotFoundPage`, `vercel.json`, `public/_redirects`.

## 5. Recordatorio de reglas ("fijas" del TA)

No usar: Material UI, Ant Design, Chakra, Mantine, NextUI/HeroUI, DaisyUI, dashboards completos · React Query, SWR,
TanStack Query, RTK Query · librerías de caché de servidor, estado en URL o infinite scroll · GSAP, Motion/Framer Motion,
Scrollama, AOS, Lenis · cargar el dataset completo para simular paginación · copiar templates · imágenes/logos oficiales.

Sí: infinite scroll real, página 404, animaciones con CSS Scroll-driven Animations
(referencia: https://scroll-driven-animations.style/).
