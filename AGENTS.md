# AGENTS.md

Proyecto **MAP** (Model Active Parameters). Lee esto antes de tocar nada.

## Reglas que no se negocian

- Al modelo se va **solo** por `runWithMap(mapId, input)` de `src/core/gateway.ts`.
  Nunca importes ni llames al SDK/proveedor del modelo directamente. La regla de
  ESLint `no-restricted-imports` lo impide; si la tocas, lo estás haciendo mal.
- Para añadir una capacidad nueva, **crea un map** en `src/core/maps/` y regístralo
  en `src/core/maps/index.ts`. No metas lógica nueva en la gateway.
- Una herramienta solo existe para una tarea si está en `tools.allow` de su map.
  No añadas herramientas sin declararlas en el allow-list.
- El scope, el presupuesto y el formato salen del map, no del prompt.

## Estructura

- `src/core/` — el motor. `gateway.ts` es la única puerta; `gates/` aplica scope,
  herramientas y presupuesto; `providers/` son adapters de modelo.
- `src/core/maps/` — la librería de maps. Aquí va el trabajo de producto.
- `examples/benchmark/` — compara multiagente vs MAP.

## Comandos

- `npm run typecheck` — tipos.
- `npm run lint` — incluye la regla anti-import directo del proveedor.
- `npm test` — suite con `node:test` (sin red ni clave: embedder local + doble de proveedor).
- `npm run mcp` — levanta el server MCP por stdio.
- `npm run benchmark` — compara multiagente vs MAP (requiere MAP_PROVIDER + API key).

## Verificación

Todo cambio pasa `npm run typecheck`, `npm run lint` y `npm test` antes de darse por hecho.
