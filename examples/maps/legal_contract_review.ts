/**
 * Receta vertical: revisión de cláusulas en contratos.
 *
 * NO forma parte de la librería estándar MAP. Es un ejemplo de cómo un usuario
 * adapta el arquetipo `extraccion_estructura` a un dominio concreto (legal):
 * fija los namespaces de su corpus, restringe formato a JSON con campos
 * pactados, y eleva el tier porque la tarea no perdona alucinaciones.
 *
 * Si lo quisieras en tu proyecto, copiarías este fichero a `src/core/maps/`
 * y lo registrarías. Pero entonces ya no es "estándar MAP", es tu librería
 * interna.
 */

import { defineMap } from "../../src/core/schema";

export default defineMap({
  id: "legal_contract_review",
  domain: "legal",
  task: "Identificar y extraer cláusulas críticas (jurisdicción, plazo, penalidades, terminación, IP) y marcar las ausentes",
  ragScope: {
    include: ["contracts", "clauses_library"],
    exclude: ["marketing", "billing", "internal_email"],
  },
  reasoning: {
    depth: "high",
    agenticLoop: false,
    missingDataPolicy: "mark_as_missing",
  },
  output: { format: "json_clausulas", requireSources: true },
  tools: { allow: ["scoped_search"], block: ["send_email", "write_file"] },
  budget: {
    maxInputTokens: 8000,
    maxOutputTokens: 1500,
    maxRetrievalChunks: 10,
    modelTier: "strong",
  },
});
