# TropelCare Control Room — Frontend

React 18 + TypeScript estricto + Vite + React Router + Tailwind CSS + Fetch API.
Sin librerías de UI, de caché de servidor, de infinite scroll ni de animación.

> Para la hackathon de One Piece lee **`docs/MAPEO_ONE_PIECE.md`**: es el mismo contrato con otros nombres.
> El orden de implementación está en **`docs/PASO_A_PASO.md`**.

---

## 1. Arranque rápido (5 comandos)

Requisitos: **Node 22+**, **Docker** (para PostgreSQL) y el backend del curso.

```bash
# Terminal 1 — Backend (carpeta backend/ del repo del curso)
docker compose up -d postgres           # PostgreSQL 16 en :5432 (user/pass/db: tropelcare)
npm ci && npm run build
npm run db:setup:prod                    # migra + siembra (solo la primera vez)
npm start                                # API en http://localhost:8080/api/v1  ·  Swagger en http://localhost:8080/docs

# Terminal 2 — Frontend (esta carpeta)
cp .env.example .env
npm install
npm run dev                              # http://localhost:5173
```

> El README del backend dice `cp .env.example .env`, pero ese archivo **no viene** en el zip.
> No hace falta: en desarrollo el backend usa valores por defecto (DB `tropelcare/tropelcare` en `localhost:5432`).

### Credenciales locales

El backend deriva la contraseña de cada equipo con un secreto. Con el secreto de desarrollo por defecto:

| Campo | Valor |
|---|---|
| Team code | `TEAM-001` |
| Email | `operator@tuckersoft.com` (también `operator2@` y `operator3@`) |
| Password | `a1Ylz2UwMw7-rv1poHMNb5NWvPJJjBHcIpDudjkGLEU` |

Para otros equipos (o si cambiaste `CREDENTIALS_SECRET`), expórtalas desde el backend:

```bash
npm run credentials:export -- ../credenciales.json   # el archivo NO debe existir antes
```

### ¿Cómo se accede al backend el día de la hackathon?

El TA entrega 5 datos. No se levanta nada localmente: solo se configura el `.env`.

```txt
VITE_API_BASE_URL=https://<backend-url>/api/v1     -> va en .env
API_DOCUMENTATION_URL=https://<backend-url>/docs   -> Swagger: contrato oficial (campos, enums, errores)
TEAM_CODE=TEAM-0XX                                  -> se escribe en el login
EMAIL=...                                           -> se escribe en el login
PASSWORD=...                                        -> se escribe en el login (NUNCA en el repo)
```

Todas las rutas (salvo login) llevan `Authorization: Bearer <token>`; el `httpClient` lo agrega solo.
CORS del backend acepta `http://localhost:5173`, `*.vercel.app` y `*.netlify.app`: **no cambies el puerto 5173**.

---

## 2. Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `:5173` |
| `npm run typecheck` | `tsc --noEmit` (debe salir sin errores) |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Sirve `dist/` en `:5173` |

## 3. Variables de entorno

| Variable | Obligatoria | Ejemplo |
|---|---|---|
| `VITE_API_BASE_URL` | Sí | `http://localhost:8080/api/v1` |
| `VITE_DEFAULT_TEAM_CODE` | No (rellena el login) | `TEAM-001` |
| `VITE_DEFAULT_EMAIL` | No (rellena el login) | `operator@tuckersoft.com` |

## 4. Deploy (Vercel o Netlify)

- **Vercel**: importar el repo → Framework *Vite* → variable `VITE_API_BASE_URL`. `vercel.json` ya reescribe todas las rutas a `index.html`.
- **Netlify**: build `npm run build`, publish `dist`, misma variable. `public/_redirects` ya hace el fallback SPA.

Así el deploy abre directo en cualquier ruta (`/signals/sig_001_0600`, `/sectors/x/story`, etc.).

---

## 5. Arquitectura por capas (feature-first)

Misma idea que un backend Spring organizado por dominio (`district/{controller,dto,entity,repository,service}`):
cada **feature** tiene sus propias capas y `common/` guarda lo compartido.

```txt
src/
├── app/                    # Composición: App.tsx + router.tsx (tabla de rutas)
├── common/                 # Compartido por todas las features
│   ├── api/                #   httpClient (fetch + token + errores) y ApiError
│   ├── components/         #   Layout, Feedback (loading/error/vacío), Modal, Pagination, Select, Search
│   ├── config/             #   env.ts (único lugar que lee import.meta.env)
│   ├── hooks/              #   useApiResource, useInfiniteScroll, useDebouncedValue, useTransitionNavigate…
│   ├── styles/             #   index.css (Tailwind + clases base)
│   └── utils/              #   format, params (lectura segura de URL), sessionCaches
├── auth/                   # CP1
├── dashboard/              # CP1
├── tropel/                 # CP2  Atlas paginado
├── signal/                 # CP3 + CP4  Feed infinito + detalle/PATCH
├── sector/                 # CP5  Sector Story Engine
└── notfound/               # Página 404
```

Dentro de cada feature:

| Carpeta | Equivale en Spring a | Responsabilidad |
|---|---|---|
| `dto/` | `dto/` + `entity/` | Tipos exactos del contrato y enums (`as const`) |
| `api/` | `repository/` | Llamadas HTTP; sin estado, sin UI |
| `hooks/` (y `store/`, `context/`) | `service/` | Lógica: estado, URL, cancelación, caché |
| `components/` | — | Piezas visuales reutilizables de la feature |
| `pages/` | `controller/` | Pantallas que conectan la ruta con hooks y componentes |

**Para agregar una feature nueva**: copia una carpeta (p. ej. `tropel/`), renombra, ajusta `dto/` según Swagger,
y registra la página en `app/router.tsx` y en `NAV_ITEMS` de `common/components/AppLayout.tsx`.

---

## 6. Decisiones técnicas importantes

**CP1 · Sesión.** Token + `expiresAt` en `localStorage`. Al recargar, `GET /auth/me` valida el token (estado `checking`).
Un 401 en cualquier request cierra la sesión (callback global del `httpClient`). Logout borra token y cachés en memoria.

**CP2 · Atlas.** La URL es la única fuente de verdad (`page,size,species,vitalState,sectorId,q,sort`); valores inválidos
se normalizan. Cada cambio aborta la request anterior con `AbortController` y la respuesta vieja se descarta.
Mientras carga, las filas anteriores se vuelven `invisible` (no se muestran resultados viejos y el layout no salta).
La búsqueda tiene debounce de 350 ms.

**CP3 · Feed.** `IntersectionObserver` propio sobre un *sentinel* (sin botón "Cargar más"). Dedup con `Set` de IDs,
un solo request en vuelo (`ref`), contador de *generación* + abort para descartar respuestas tras cambiar filtros.
Un error en una página posterior conserva lo cargado y ofrece reintentar esa página. El estado por filtro se guarda en
`feedStore` para restaurar páginas y scroll al volver desde otra sección.

**CP4 · Detalle.** El detalle es **ruta hija** (`/signals/:id`) pintada como panel encima del feed: el feed nunca se
desmonta, así que la posición se conserva. PATCH sin optimistic update: botones deshabilitados en vuelo, confirmación
`aria-live`, error con "Reintentar cambio" sin tocar el estado anterior. Al éxito se reconcilia el feed:
se reemplaza la señal o se retira si ya no coincide con el filtro de estado.

**CP5 · Story.** Visual `sticky` persistente (un solo nodo) controlado por variables CSS registradas con `@property`
(transicionan entre etapas). Escenas por clima hechas solo con gradientes CSS; `assetKey`/`colorToken` se mapean
localmente, narrativa y métricas vienen de la API. Etapa activa por `IntersectionObserver` (línea al 65 % del viewport,
igual en desktop y mobile). Barra de progreso con `animation-timeline` (view-timeline `--story`) dentro de
`@supports`, con fallback JS (`--progress`). View Transition API entre el resumen `/sectors` y la historia
(`document.startViewTransition` + `flushSync`, con fallback a navegación normal). `prefers-reduced-motion` apaga
animaciones, transiciones y view transitions. Teclado: Tab recorre etapas y stepper; ↑/↓, PageUp/PageDown, Home/End
saltan entre etapas. El texto nunca se oculta (opacidad mínima 0.72).

**Errores.** `ApiError` tipado (`status`, `code`, `retryAfterSeconds`). 429 muestra `Retry-After`; 423
(`LOG_POSE_REQUIRED` en One Piece) se muestra como "Zona bloqueada" con botón "Volver a comprobar".

**404.** Ruta comodín `*` con página propia. Los 404 de la API (ID inexistente o de otro equipo) muestran un estado de error.

## 7. Integrantes

| Nombre | Código |
|---|---|
| _completar_ | _completar_ |
| _completar_ | _completar_ |
| _completar_ | _completar_ |

Deploy: _completar link_
