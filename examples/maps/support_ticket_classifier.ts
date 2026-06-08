/**
 * Receta vertical: clasificación de tickets de soporte.
 *
 * NO forma parte de la librería estándar MAP. Es un ejemplo de cómo un usuario
 * adapta el arquetipo `clasificar` a soporte: scope sobre la taxonomía de
 * categorías, sin retrieval documental, tier barato, salida mínima.
 *
 * Aquí lo interesante: `tools.allow: []` (cero herramientas) y `requireSources:
 * false`. La tarea es decidir, no justificar.
 */

import { defineMap } from "../../src/core/schema";

export default defineMap({
  id: "support_ticket_classifier",
  domain: "support",
  task: "Asignar una categoría (billing | technical | account | feedback | spam) a un ticket entrante",
  ragScope: { include: ["support.taxonomy"] },
  reasoning: { depth: "low", agenticLoop: false },
  output: { format: "etiqueta_unica", requireSources: false },
  tools: { allow: [], block: ["send_email", "write_file", "scoped_search"] },
  budget: {
    maxInputTokens: 1200,
    maxOutputTokens: 30,
    maxRetrievalChunks: 3,
    modelTier: "cheap",
  },
});
