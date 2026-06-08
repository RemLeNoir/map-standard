# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: MAP — Model Active Parameters

MAP is a **declarative layer** that constrains how a model is used per task: retrieval scope, allowed tools, output format, and budget. It is not an agent and does not reason. The standard itself is the contract (`map.schema.json` + `defineMap`), the gateway (`runWithMap`), the gates (scope · tools · budget), the resolver/log, and the default map library. Everything else (providers, embedders, retrievers) is **reference plumbing** meant to be swappable.

The README and AGENTS.md are in Spanish; preserve that language when editing user-facing prose and docstrings unless instructed otherwise.

## Commands

- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint, including the no-direct-provider-import rule.
- `npm test` — runs `node --import tsx --test tests/*.test.ts`. No network, no API key (uses local embedder + provider double from [tests/fakes.ts](tests/fakes.ts)).
- Single test file: `node --import tsx --test tests/gateway.test.ts`.
- `npm run mcp` — starts the MCP server over stdio ([src/mcp/server.ts](src/mcp/server.ts)) with tools `resolve_map` and `scoped_search`.
- `npm run benchmark` — runs [examples/benchmark/run.ts](examples/benchmark/run.ts), comparing a naive multi-agent flow vs `runWithMap`. Requires `MAP_PROVIDER` + the matching API key.

All changes must pass `npm run typecheck`, `npm run lint`, and `npm test` before being considered done.

## Architecture

### Single door: `runWithMap`

[src/core/gateway.ts](src/core/gateway.ts) is the **only** path to the model. It resolves the map, applies gates by construction, calls the provider, and logs the run. Do not add new logic here for new capabilities — instead, define a new map.

Flow inside `runWithMap`:
1. `resolveMap(mapId)` — validate against the schema.
2. If `tools.allow` includes `scoped_search`: `gateTool` (hard check) → `getRetriever().search(input, applyScope(map))`.
3. `capContext` — trims chunks to fit `budget.maxRetrievalChunks` / token budget.
4. `getProvider().complete(...)` with the system prompt built from the map (task, output format, source-citation rule, missing-data policy).
5. `log(...)` writes a `MapRuntimeLog` entry.

### The map is the product

[src/core/maps/](src/core/maps/) holds **task archetypes**, not domain verticals (`qa_documental`, `clasificar`, `extraccion_estructura`, `resumir_con_fuentes`). Users point a map at their data by editing two fields: `ragScope.include/exclude` and `budget`. Adding a capability = a new map file registered in [src/core/maps/index.ts](src/core/maps/index.ts).

### Gates enforce the map by code, not by prompt

- [src/core/gates/scope.ts](src/core/gates/scope.ts) — converts `ragScope` into a retriever filter.
- [src/core/gates/tools.ts](src/core/gates/tools.ts) — `gateTool` throws `ToolBlockedError` if a tool is not in `tools.allow`.
- [src/core/gates/budget.ts](src/core/gates/budget.ts) — `capContext` trims chunks; `assertLoopAllowed` blocks agentic loops unless permitted.

### Pluggable interfaces (project-side, not standard)

The standard depends only on these three interfaces. The bundled adapters are samples and can be replaced:

- `ModelProvider` — [src/core/providers/](src/core/providers/) ships `anthropic` and `openai` via raw `fetch` (no SDK). Selected by `MAP_PROVIDER`. Override at runtime with `setProvider()`.
- `Embedder` — [src/core/embeddings/](src/core/embeddings/) ships `local` (lexical, deterministic, used by tests) and `openai`. Selected by `MAP_EMBEDDER`.
- `Retriever` — [src/core/retrievers/](src/core/retrievers/) ships `MemoryRetriever` (in-memory cosine) and `PrismaRetriever` (Postgres + pgvector with an injected client). Override with `setRetriever()`.

Prisma schema for production use: [prisma/schema.prisma](prisma/schema.prisma) (`Chunk` with pgvector + `MapRuntimeLog`).

## Non-negotiable rules (from AGENTS.md)

- **Never** import a model SDK or a provider adapter directly. The only path to the model is `runWithMap`. ESLint's `no-restricted-imports` enforces this — `src/core/gateway.ts` and `src/core/providers/**` are the only exceptions. If you find yourself disabling that rule, you are doing it wrong.
- A new capability is a **new map**, not new code in the gateway.
- A tool only exists for a task if it is listed in that map's `tools.allow`. Do not add tools without declaring them.
- Scope, budget, and output format come from the map, never from the prompt.
- Maps must be **task archetypes**, not domain verticals. Domain belongs in `ragScope.include`.
- No phased / MVP / "iterate later" maps. A map is defined complete or it does not land.

## Spec & conformance

The standard lives in [spec/](spec/): [SPEC.md](spec/SPEC.md), [map.schema.json](spec/map.schema.json), and [CONFORMANCE.md](spec/CONFORMANCE.md). "MAP-compliant" means single gateway, map applied by construction, and traceability. Two profiles: installable (hard rails) and MCP (advisory except for what flows through its tools).
