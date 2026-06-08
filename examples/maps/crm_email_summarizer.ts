/**
 * Receta vertical: resumen de hilos de correo del CRM con citas.
 *
 * NO forma parte de la librería estándar MAP. Es un ejemplo de cómo un usuario
 * adapta el arquetipo `resumir_con_fuentes` a ventas: scope sobre threads del
 * CRM, exclusión de billing y de soporte, citas obligatorias para que el
 * comercial pueda volver al mensaje original.
 */

import { defineMap } from "../../src/core/schema";

export default defineMap({
  id: "crm_email_summarizer",
  domain: "sales",
  task: "Resumir un hilo de correo entre comercial y cliente destacando acuerdos, objeciones y próximos pasos",
  ragScope: {
    include: ["crm.threads"],
    exclude: ["billing", "support.tickets", "marketing"],
  },
  reasoning: {
    depth: "medium",
    agenticLoop: false,
    missingDataPolicy: "best_effort",
  },
  output: { format: "resumen_acuerdos_objeciones_proximos", requireSources: true },
  tools: { allow: ["scoped_search"], block: ["send_email", "write_file"] },
  budget: {
    maxInputTokens: 5000,
    maxOutputTokens: 900,
    maxRetrievalChunks: 8,
    modelTier: "medium",
  },
});
