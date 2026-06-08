/**
 * Receta vertical: extracción estructurada de datos de facturas.
 *
 * NO forma parte de la librería estándar MAP. Es un ejemplo de cómo un usuario
 * adapta el arquetipo `extraccion_estructura` a contabilidad: scope sobre el
 * namespace de facturas, formato JSON cerrado, política estricta con datos
 * ausentes (no se inventa un NIF).
 */

import { defineMap } from "../../src/core/schema";

export default defineMap({
  id: "invoice_data_extraction",
  domain: "accounting",
  task: "Extraer importes, fechas, identificadores fiscales y líneas de factura a un JSON tipado",
  ragScope: {
    include: ["invoices"],
    exclude: ["marketing", "support.taxonomy", "contracts"],
  },
  reasoning: {
    depth: "medium",
    agenticLoop: false,
    missingDataPolicy: "mark_as_missing",
  },
  output: { format: "json_factura", requireSources: true },
  tools: { allow: ["scoped_search"], block: ["send_email", "write_file"] },
  budget: {
    maxInputTokens: 4000,
    maxOutputTokens: 800,
    maxRetrievalChunks: 6,
    modelTier: "medium",
  },
});
