import { defineMap } from "../schema";

export default defineMap({
  id: "extraccion_estructura",
  task: "Extraer campos a una estructura definida desde uno o varios documentos",
  ragScope: { include: ["docs"], exclude: ["marketing", "billing"] },
  reasoning: { depth: "medium", agenticLoop: false, missingDataPolicy: "mark_as_missing" },
  output: { format: "json_estructurado", requireSources: true },
  tools: { allow: ["scoped_search"], block: ["send_email", "write_file"] },
  budget: {
    maxInputTokens: 6000,
    maxOutputTokens: 1200,
    maxRetrievalChunks: 8,
    modelTier: "medium",
  },
});
