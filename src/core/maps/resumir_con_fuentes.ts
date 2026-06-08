import { defineMap } from "../schema";

export default defineMap({
  id: "resumir_con_fuentes",
  task: "Resumir un conjunto de documentos citando de dónde sale cada punto",
  ragScope: { include: ["docs"] },
  reasoning: { depth: "medium" },
  output: { format: "resumen_con_citas", requireSources: true },
  tools: { allow: ["scoped_search"], block: ["send_email", "write_file"] },
  budget: {
    maxInputTokens: 8000,
    maxOutputTokens: 1500,
    maxRetrievalChunks: 10,
    modelTier: "medium",
  },
});
