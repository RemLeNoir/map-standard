import { defineMap } from "../schema";

export default defineMap({
  id: "qa_documental",
  task: "Responder preguntas apoyándose en una base documental",
  ragScope: { include: ["docs"] },
  output: { format: "respuesta_breve_con_fuentes", requireSources: true },
  tools: { allow: ["scoped_search"], block: ["send_email", "write_file"] },
  budget: {
    maxInputTokens: 4000,
    maxOutputTokens: 800,
    maxRetrievalChunks: 6,
    modelTier: "cheap",
  },
});
