import { defineMap } from "../schema";

export default defineMap({
  id: "clasificar",
  task: "Asignar una categoría a un texto entre un conjunto cerrado",
  ragScope: { include: ["taxonomy"] },
  reasoning: { depth: "low" },
  output: { format: "etiqueta_unica", requireSources: false },
  tools: { allow: [], block: ["send_email", "write_file", "scoped_search"] },
  budget: {
    maxInputTokens: 1500,
    maxOutputTokens: 50,
    maxRetrievalChunks: 3,
    modelTier: "cheap",
  },
});
