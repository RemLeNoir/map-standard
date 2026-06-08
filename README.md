# MAP, Model Active Parameters

Capa declarativa que define, para cada tarea, **qué contexto activa un modelo, qué herramientas puede usar y cuánto puede gastar**. No es un agente. No razona. Orienta y restringe antes de que el modelo trabaje.

> MCP conecta. RAG informa. MAP orienta. El modelo razona. El agente actúa solo si hace falta.

---

## Qué te da

Tres cosas, en este orden:

1. **Control por construcción.** El scope de retrieval, las herramientas permitidas y el presupuesto no son sugerencias en el prompt. Son código que se aplica antes de que el modelo vea nada. No "el modelo se porta bien", sino "el código no le deja portarse mal". Una regla de ESLint impide importar el SDK del proveedor: la única vía al modelo es la gateway.
2. **Trazabilidad sin instrumentar nada.** Cada ejecución deja un registro estructurado (`MapRuntimeLog`) con map, modelo, tokens de entrada y salida, y chunks usados. Auditas y mides por tarea sin tocar tu código.
3. **Predictibilidad por tarea.** Mismo map, mismo comportamiento. El prompt deja de ser un cajón de sastre donde se cuela la lógica de negocio. Lo que cambia entre tareas es el map, no la llamada.

El ahorro de tokens, si aparece, es consecuencia de tener scope y budget capados. No es el argumento.

---

## Qué es MAP y qué es de tu proyecto

**MAP es la disciplina, no el stack.** Lo que define el estándar:

- el contrato (`map.schema.json` + `defineMap`),
- la gateway (`runWithMap`, la única puerta),
- las gates (scope, tools, budget),
- el resolver, el log y los **maps por defecto**,
- y las **interfaces** `Retriever`, `Embedder`, `ModelProvider`.

El **retriever, el embedder, el proveedor y la base de datos son de tu proyecto**, no de MAP. MAP solo necesita una implementación de esas interfaces que respete el scope; lo que haya detrás (memoria, pgvector, Pinecone, Anthropic, OpenAI…) le da igual.

Los adapters incluidos (`providers/`, `embeddings/`, `retrievers/`) son **fontanería de referencia** para que arranques y veas cómo se enchufa lo tuyo. No son el estándar: puedes sustituirlos o borrarlos.

---

## Cómo se usa

Cada tarea tiene un **map**: scope de retrieval, herramientas permitidas y bloqueadas, formato de salida y presupuesto. Todo el acceso al modelo pasa por una **única puerta** (`runWithMap`) que aplica el map por código.

```ts
import { runWithMap } from "./src/core";

const res = await runWithMap("qa_documental", pregunta);
// acotado al scope, capado al presupuesto, registrado en el log
```

Apuntar un map a tus datos son dos campos:

```ts
// src/core/maps/qa_documental.ts
ragScope: { include: ["docs.manuales", "docs.faq"], exclude: [] },
budget:   { modelTier: "cheap", maxRetrievalChunks: 6, maxOutputTokens: 800 },
```

---

## Arranque

```bash
npm install
npm test                                # 12 tests, sin red ni clave
npx tsx examples/quickstart/run.ts      # demo sin clave con proveedor "echo"
```

Para usar un proveedor real:

```bash
cp .env.example .env                    # pon MAP_PROVIDER + tu API key
```

- **Instalable** (raíles duros): `runWithMap` en tu código. El proveedor real va por env (`MAP_PROVIDER=anthropic|openai`).
- **MCP** (raíles blandos): `npm run mcp` levanta el server por stdio con las tools `resolve_map` y `scoped_search`.
- **Benchmark** (con clave): `MAP_PROVIDER=anthropic ANTHROPIC_API_KEY=... npm run benchmark` mide llamadas, tokens y latencia frente a un pipeline multiagente naíf. El ahorro es consecuencia del scope y el budget, no el objetivo.

No hay modo demo ni mock de producto: o conectas un proveedor real, o inyectas el tuyo con `setProvider()`. El único doble vive en `tests/`.

### Ejemplos incluidos

- [`examples/quickstart/`](./examples/quickstart/): corpus de juguete y proveedor "echo" inyectado. Ejecútalo sin instalar nada más. Muestra cómo `qa_documental` recupera con scope y cómo `clasificar` no recupera nada porque no tiene `scoped_search` en `tools.allow`.
- [`examples/benchmark/`](./examples/benchmark/): pipeline multiagente naíf (planner, researcher, answerer, sin scope ni budget) frente a una sola pasada por `runWithMap`. Imprime llamadas, tokens y latencia. Requiere proveedor real.

---

## Adapters de referencia (de tu proyecto, no del estándar)

Implementaciones de las interfaces para que arranques. Sustituibles por las tuyas:

- **Proveedores** (`src/core/providers/`): `anthropic` y `openai`, vía fetch, sin SDK. Verifica los nombres de modelo por tier en tu cuenta.
- **Embedders** (`src/core/embeddings/`): `local` (léxico, sin red, para corpus pequeños y tests) y `openai`. `MAP_EMBEDDER=local|openai`.
- **Retrievers** (`src/core/retrievers/`): `MemoryRetriever` (vector store en memoria, coseno real) y `PrismaRetriever` (Postgres + pgvector, cliente inyectado). `setRetriever()` para cambiar.

---

## El map es el producto

El schema es commodity. El valor está en la **librería de maps por defecto**: arquetipos de tarea, no de dominio (`qa_documental`, `extraccion_estructura`, `clasificar`, `resumir_con_fuentes`). Es el modelo de ESLint: nadie lo usa por poder escribir reglas, lo usa por `eslint:recommended`.

---

## Estructura

```
spec/                      el estándar: SPEC.md, map.schema.json, CONFORMANCE.md
src/core/
  gateway.ts               única puerta al modelo (runWithMap)
  gates/                   scope, tools, budget (enforzados por código)
  maps/                    librería de maps por defecto  <- el producto
  providers/               anthropic, openai (vía fetch)
  embeddings/              local, openai
  retrievers/              memory (coseno), prisma (pgvector)
  logger.ts                MapRuntimeLog
src/mcp/                   server MCP (resolve_map, scoped_search)
tests/                     suite con node:test (12 tests)
examples/quickstart/       demo sin clave con proveedor inyectado
examples/benchmark/        multiagente naíf vs runWithMap (proveedor real)
prisma/schema.prisma       Chunk (pgvector) + MapRuntimeLog
eslint.config.js           regla anti-import directo del proveedor
scripts/                   test.mjs (runner cross-platform) y apply-ruleset.mjs
.github/rulesets/main.json ruleset de protección de la rama por defecto
AGENTS.md, CLAUDE.md       instrucciones para agentes de código
```

---

## Conformidad

**MAP-compliant** = puerta única, map aplicado por construcción, y trazabilidad. Dos perfiles: instalable (duro) y MCP (advisory salvo lo que pasa por sus tools). Ver [`spec/CONFORMANCE.md`](./spec/CONFORMANCE.md).

---

## Lo que MAP no hace

- **No arregla un RAG malo.** Acota *qué* namespaces; no mejora el ranking dentro de ellos más allá del embedder que uses.
- **No te ahorra etiquetar.** El scope necesita chunks con `namespace`. No hay atajo.
- **No sustituye a un agente** cuando hay autonomía real: monitorización, acciones encadenadas, estado persistente.
- **No es magia.** Contra quien ya escribe prompts acotados a mano, el ahorro de tokens es marginal. Lo que ganas es control y trazabilidad sistemáticos.

---

## Gobernanza del repo

La rama por defecto se protege con un Repository Ruleset versionado en [`.github/rulesets/main.json`](./.github/rulesets/main.json): PR con revisión, historia lineal, sin force-push, y checks `typecheck`, `lint`, `test` obligatorios. Para aplicarlo o actualizarlo en GitHub, con el [`gh` CLI](https://cli.github.com/) autenticado:

```bash
npm run protect                          # detecta OWNER/REPO del remote 'origin'
npm run protect -- tu-org/map-standard   # explícito
```

---

## Licencia

Apache-2.0. Ver [LICENSE](./LICENSE).
