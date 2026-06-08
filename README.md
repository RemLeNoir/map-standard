# MAP, Model Active Parameters

Capa declarativa que define, para cada tarea, **qué contexto activa un modelo, qué herramientas puede usar y cuánto puede gastar**. No es un agente. No razona. Orienta y restringe antes de que el modelo trabaje.

> MCP conecta. RAG informa. MAP orienta. El modelo razona. El agente actúa solo si hace falta.

---

## Tres capas (no las mezcles)

| Capa | Qué es | Vive en |
|---|---|---|
| **1. La spec MAP** | El contrato: el objeto `map`, el schema JSON, el principio de "puerta única". Independiente de lenguaje, de proveedor y de stack. | [`spec/`](./spec/) |
| **2. La librería TypeScript** | Implementación de referencia de la spec: `runWithMap`, gates de scope/tools/budget, resolver, logger, librería de maps por defecto. | [`src/core/`](./src/core/) |
| **3. Los adapters** | Fontanería para que arranques rápido: Anthropic y OpenAI vía fetch, embedder local y openai, retrievers en memoria y pgvector. | [`src/core/providers/`](./src/core/providers/), [`src/core/embeddings/`](./src/core/embeddings/), [`src/core/retrievers/`](./src/core/retrievers/) |

**MAP no es pgvector. No es OpenAI. No es Anthropic. No es MCP.** MAP es el contrato de ejecución. Los adapters son intercambiables; el contrato no.

---

## Qué te da

Tres cosas, en este orden:

1. **Control por construcción.** El scope de retrieval, las herramientas permitidas y el presupuesto no son sugerencias en el prompt. Son código que se aplica antes de que el modelo vea nada. No "el modelo se porta bien", sino "el código no le deja portarse mal". Una regla de ESLint impide importar el SDK del proveedor: la única vía al modelo es la gateway.
2. **Trazabilidad sin instrumentar nada.** Cada ejecución deja un registro estructurado (`MapRuntimeLog`) con map, modelo, tokens de entrada y salida, y chunks usados. Auditas y mides por tarea sin tocar tu código.
3. **Predictibilidad por tarea.** Mismo map, mismo comportamiento. El prompt deja de ser un cajón de sastre donde se cuela la lógica de negocio. Lo que cambia entre tareas es el map, no la llamada.

El ahorro de tokens, si aparece, es consecuencia de tener scope y budget capados. No es el argumento.

---

## Cómo se ubica frente a las alternativas

Tabla para ubicar, no para vender. Cada herramienta resuelve un problema distinto; no compiten directamente.

| Problema | Prompt largo "todo en uno" | Pipeline multiagente | RAG normal | MAP |
|---|---|---|---|---|
| Acotar qué contexto entra al modelo | Lo metes a mano en el prompt | Lo decide cada agente | Recupera todo lo similar | Scope por namespaces, aplicado por código |
| Limitar herramientas por tarea | Se lo pides al modelo | El orquestador decide | No aplica | Allow-list dura por map |
| Cap de tokens y tier por tarea | Hard-coded en el código que llama | Variable por agente | No aplica | Campo del map, capado al recorte de contexto |
| Trazabilidad de la decisión | La que tú instrumentes | La que tú instrumentes | Logs del retriever | `MapRuntimeLog` estructurado por ejecución |
| Coste de cambiar de proveedor | Reescritura | Reescritura | Independiente | Cambio de adapter |
| Cuándo encaja | Una tarea ocasional | Autonomía real, acciones encadenadas | Sustrato para Q&A o búsqueda | Muchas tareas distintas contra un mismo corpus |

MAP no sustituye a RAG (lo orienta) ni a un agente cuando hay autonomía real. Sustituye al uso de agentes en tareas que solo necesitaban contexto bien dirigido.

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

### Sobre `reasoning.depth`

`depth` (`low | medium | high`) es un **hint de perfil de ejecución**, no una garantía de razonamiento. Los providers lo usan para enrutar (tier de modelo, longitud de salida, presencia de cadenas de pensamiento si el provider las ofrece). Poner `high` no entrega "más profundidad"; cambia cómo se invoca al modelo. Léelo como `executionProfile`.

### Estático vs dinámico

Los maps de la librería son **estáticos**: una plantilla por tarea, versionada. Es el modo recomendado y el único cuyo ahorro es defendible.

Generar maps **dinámicamente con otra llamada al modelo** es posible pero peligroso: si necesitas un LLM para decidir el map, te comes el ahorro y diluyes el control. Úsalo solo cuando el estático genuinamente no llegue, y cuando lo hagas, versiona los maps producidos y trátalos como caché.

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
- [`examples/maps/`](./examples/maps/): **recetas verticales demostrativas**. `legal_contract_review`, `support_ticket_classifier`, `invoice_data_extraction`, `tender_requirement_analysis`, `crm_email_summarizer`. **No forman parte de la librería estándar**: son ejemplos de cómo adaptar un arquetipo a un dominio concreto. Ver [`examples/maps/README.md`](./examples/maps/README.md).

---

## El map es el producto

El schema es commodity. El valor está en la **librería de maps por defecto**: arquetipos de tarea, no de dominio (`qa_documental`, `extraccion_estructura`, `clasificar`, `resumir_con_fuentes`). Es el modelo de ESLint: nadie lo usa por poder escribir reglas, lo usa por `eslint:recommended`.

Por eso los verticales (legal, soporte, facturas, licitaciones, CRM) viven en `examples/maps/` como recetas, no en `src/core/maps/` como estándar. El dominio lo pone el usuario en `ragScope.include`; no se hornean veinte verticales en la librería.

---

## Estructura

```
spec/                       el estándar: SPEC.md, map.schema.json, CONFORMANCE.md
src/core/
  gateway.ts                única puerta al modelo (runWithMap)
  gates/                    scope, tools, budget (enforzados por código)
  maps/                     librería estándar (arquetipos de tarea)  <- el producto
  providers/                anthropic, openai (vía fetch)
  embeddings/                local, openai
  retrievers/                memory (coseno), prisma (pgvector)
  logger.ts                 MapRuntimeLog
src/mcp/                    server MCP (resolve_map, scoped_search)
tests/                      suite con node:test (12 tests)
examples/quickstart/        demo sin clave con proveedor inyectado
examples/benchmark/         multiagente naíf vs runWithMap (proveedor real)
examples/maps/              recetas verticales demostrativas (no librería)
prisma/schema.prisma        Chunk (pgvector) + MapRuntimeLog
eslint.config.js            regla anti-import directo del proveedor
scripts/                    test.mjs (runner cross-platform) y apply-ruleset.mjs
.github/rulesets/main.json  ruleset de protección de la rama por defecto
AGENTS.md, CLAUDE.md        instrucciones para agentes de código
```

---

## Conformidad

**MAP-compliant** = puerta única, map aplicado por construcción, y trazabilidad. Dos perfiles: instalable (duro) y MCP (advisory salvo lo que pasa por sus tools). Ver [`spec/CONFORMANCE.md`](./spec/CONFORMANCE.md).

---

## Lo que MAP no hace

- **No arregla un RAG malo.** Acota *qué* namespaces; no mejora el ranking dentro de ellos más allá del embedder que uses.
- **No te ahorra etiquetar.** El scope necesita chunks con `namespace`. No hay atajo.
- **No sustituye a un agente** cuando hay autonomía real: monitorización, acciones encadenadas, estado persistente.
- **No garantiza profundidad de razonamiento por poner `depth: "high"`.** Es un hint de enrutado, no una promesa.
- **No es magia.** Contra quien ya escribe prompts acotados a mano, el ahorro de tokens es marginal. Lo que ganas es control y trazabilidad sistemáticos.

---

## Gobernanza del repo

La rama por defecto se protege con un Repository Ruleset versionado en [`.github/rulesets/main.json`](./.github/rulesets/main.json): PR con revisión, historia lineal, sin force-push, y checks `typecheck`, `lint`, `test` obligatorios. El rol Admin puede overridear cuando haga falta. Para aplicarlo o actualizarlo en GitHub, con el [`gh` CLI](https://cli.github.com/) autenticado:

```bash
npm run protect                          # detecta OWNER/REPO del remote 'origin'
npm run protect -- tu-org/map-standard   # explícito
```

---

## Licencia

Apache-2.0. Ver [LICENSE](./LICENSE).
