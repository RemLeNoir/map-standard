# Recetas verticales (no son librería estándar)

Estos cinco maps **no forman parte de la librería estándar MAP**. No están en
`src/core/maps/`, no están en `registry`, y `runWithMap("legal_contract_review", ...)`
falla a propósito si no los registras tú.

Existen como **ejemplos reconocibles** de cómo un usuario adapta un arquetipo
de tarea a un dominio concreto. Es el contraste deliberado entre las dos capas:

| Capa | Vive en | Es | Ejemplos |
|---|---|---|---|
| Arquetipos de tarea (estándar) | `src/core/maps/` | parte de MAP | `qa_documental`, `clasificar`, `extraccion_estructura`, `resumir_con_fuentes` |
| Recetas verticales (tu proyecto) | `examples/maps/` | ejemplos demostrativos | `legal_contract_review`, `support_ticket_classifier`, `invoice_data_extraction`, `tender_requirement_analysis`, `crm_email_summarizer` |

## Por qué la separación

[`AGENTS.md`](../../AGENTS.md) y [`CONTRIBUTING.md`](../../CONTRIBUTING.md) son
explícitos: los maps de la librería estándar son **arquetipos de tarea, no de
dominio**. El dominio lo pone el usuario en `ragScope.include`. Esto es lo que
hace que MAP escale: cuatro arquetipos cubren docenas de verticales si los
namespaces están bien definidos.

Si añadiéramos `legal_contract_review` a `src/core/maps/`, tendríamos que añadir
también `medical_record_review`, `procurement_clause_review`, etc., y la
librería se convertiría en un catálogo de dominios. Esa no es la idea.

## Para qué sirven entonces

Tres cosas concretas:

1. **Ver tareas reconocibles.** "Extraer datos de facturas a JSON" se lee mucho
   mejor que `extraccion_estructura`. Te ayuda a entender el patrón.
2. **Plantilla para copiar.** Si tu proyecto necesita uno de estos, copias el
   fichero a tu propio repo (no a `src/core/maps/`) y editas los namespaces.
3. **Mostrar el rango.** Tier `cheap` para clasificar tickets, `strong` para
   revisar contratos. El mismo schema, presupuestos muy distintos.

## Cómo usarlos en pruebas

No son del registry, pero puedes ejecutarlos con `runWithMap` si registras la
receta por código antes:

```ts
import { runWithMap } from "../../src/core";
import { registry } from "../../src/core/maps";
import invoice from "./invoice_data_extraction";

registry[invoice.id] = invoice; // tu proyecto, tu responsabilidad
const r = await runWithMap("invoice_data_extraction", "PDF de factura...");
```

Que el ejemplo te empuje a copiarlos a tu propio proyecto, no a meterlos en el
core de MAP.
