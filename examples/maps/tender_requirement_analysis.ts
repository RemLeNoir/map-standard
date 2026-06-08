/**
 * Receta vertical: análisis de requisitos en pliegos de licitación.
 *
 * NO forma parte de la librería estándar MAP. Es un ejemplo de cómo un usuario
 * adapta el arquetipo `qa_documental` (con presupuesto más holgado) a
 * procurement: scope sobre pliegos y anexos, exclusión explícita de marketing
 * y de la prensa del cliente, y exigencia de citar siempre la sección de
 * origen.
 */

import { defineMap } from "../../src/core/schema";

export default defineMap({
  id: "tender_requirement_analysis",
  domain: "procurement",
  task: "Listar los requisitos técnicos, plazos, garantías y criterios de adjudicación a partir del pliego",
  ragScope: {
    include: ["tenders.pcap", "tenders.ppt", "tenders.annexes"],
    exclude: ["marketing", "press", "internal_email"],
  },
  reasoning: {
    depth: "high",
    agenticLoop: false,
    missingDataPolicy: "mark_as_missing",
  },
  output: { format: "lista_requisitos_con_citas", requireSources: true },
  tools: { allow: ["scoped_search"], block: ["send_email", "write_file"] },
  budget: {
    maxInputTokens: 9000,
    maxOutputTokens: 1800,
    maxRetrievalChunks: 12,
    modelTier: "strong",
  },
});
