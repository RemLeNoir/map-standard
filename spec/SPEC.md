# Especificación MAP

**MAP (Model Active Parameters)** es una capa declarativa que define, para una
tarea concreta, qué contexto activa un modelo, qué herramientas puede usar y
cuánto puede gastar. No razona, no actúa: orienta y restringe antes de que el
modelo trabaje.

## El objeto `map`

El formato canónico está en [`map.schema.json`](./map.schema.json). Campos:

- `id`, `domain`, `task` — identidad y propósito.
- `ragScope.include` / `exclude` — namespaces del RAG que se consultan o se vetan.
- `reasoning.depth` / `agenticLoop` / `missingDataPolicy` — profundidad, si se
  permite iterar, y qué hacer con datos ausentes.
- `output.format` / `requireSources` — formato esperado y exigencia de fuentes.
- `tools.allow` / `block` — herramientas permitidas y vetadas.
- `budget` — `maxInputTokens`, `maxOutputTokens`, `maxRetrievalChunks`, `modelTier`.

## Dónde encaja

```
Usuario → Intent/Tarea → MAP → Retrieval filtrado → Modelo → (herramienta si el map la permite)
```

MAP se aplica **después** de saber qué tarea es y **antes** de tocar el RAG o el
modelo. No sustituye a RAG, MCP ni agentes. Sustituye al uso innecesario de
agentes para tareas que solo necesitan contexto bien dirigido.

## Estático vs dinámico

- **Estático**: una plantilla por tarea (recomendado; el ahorro es defendible).
- **Dinámico**: map compuesto en tiempo real. Cuidado: generarlo con otra llamada
  al modelo se come el ahorro. Úsalo solo si el estático no llega.

## Principio de diseño

> El MAP debe sustituir complejidad, no añadirla.
