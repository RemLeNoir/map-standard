# Conformidad

Una implementación es **MAP-compliant** si cumple las tres reglas:

1. **Puerta única.** El modelo se alcanza por una sola vía. No hay forma soportada
   de llamar al proveedor del modelo saltándose la capa MAP. (En esta referencia:
   `runWithMap`, reforzado por la regla de ESLint que prohíbe importar los adapters
   de proveedor por fuera del core.)

2. **El map se aplica por construcción, no por petición.** El scope de retrieval,
   el allow/block de herramientas y el presupuesto se enforzan en código antes de
   que el modelo procese. Un chunk fuera de scope no llega; una herramienta
   bloqueada no se ejecuta; el contexto no supera `maxInputTokens`.

3. **Trazabilidad.** Cada ejecución registra al menos: map, modelo, tokens de
   entrada/salida y chunks usados.

Lo que **no** exige la conformidad: un stack concreto, un proveedor concreto, ni
MAP dinámico (el estático cumple igual).

## Dos perfiles de enforcement

- **Instalable (duro).** `runWithMap` enforza todo por código. Es compliant fuerte.
- **MCP (advisory + duro parcial).** `resolve_map` es advisory: orienta al modelo,
  no lo obliga. `scoped_search` SÍ enforza: filtra por scope y capa por presupuesto,
  porque la herramienta es del propio servidor. Verificado: ante un map que bloquea
  `scoped_search`, el servidor rechaza la llamada con error.
