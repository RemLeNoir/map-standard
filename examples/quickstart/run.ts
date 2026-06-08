/**
 * Quickstart sin red ni API key.
 *
 *   tsx examples/quickstart/run.ts
 *
 * Monta un corpus de juguete en memoria, inyecta un proveedor falso y
 * ejecuta `runWithMap` con dos maps distintos para ver el contraste.
 */

import { runWithMap, setProvider, setRetriever, MemoryRetriever } from "../../src/core";
import { localEmbedder } from "../../src/core/embeddings/local";
import type { ModelProvider } from "../../src/core";
import type { Chunk } from "../../src/core";

// El namespace tiene que coincidir literal con `ragScope.include` del map.
// qa_documental por defecto trae `include: ["docs"]`.
const corpus: Chunk[] = [
  { id: "1", namespace: "docs", text: "Plazo de presentación: veinte días hábiles desde la publicación." },
  { id: "2", namespace: "docs", text: "Garantía provisional: dos por ciento del valor estimado." },
  { id: "3", namespace: "docs", text: "Las ofertas se presentan por sede electrónica." },
  { id: "4", namespace: "marketing", text: "¡Apúntate ya, plazas limitadas!" },
];

const echoProvider: ModelProvider = {
  name: "echo",
  modelFor: (tier) => `echo-${tier}`,
  async complete({ system, user, tier }) {
    const fuentes = (system.match(/\[\d+\]/g) ?? []).join(" ");
    return {
      text: `(${tier}) Pregunta: ${user}\nFuentes usadas: ${fuentes || "ninguna"}`,
      inputTokens: 100,
      outputTokens: 20,
      model: `echo-${tier}`,
    };
  },
};

async function main() {
  setProvider(echoProvider);

  const mem = new MemoryRetriever(localEmbedder);
  await mem.add(corpus);
  setRetriever(mem);

  // qa_documental: scope = ["docs"] por defecto. Cambia a ["docs.manuales", "docs.faq"]
  // para mostrar cómo el scope acota la retrieval.
  const qa = await runWithMap("qa_documental", "¿qué plazo aplica?");
  console.log("\n[qa_documental]");
  console.log(qa.text);
  console.log(`chunks=${qa.chunksUsed} tier=${qa.model}`);

  // clasificar: NO permite scoped_search, así que no recupera nada (chunks=0).
  const cls = await runWithMap("clasificar", "consulta sobre plazos");
  console.log("\n[clasificar] (sin retrieval)");
  console.log(cls.text);
  console.log(`chunks=${cls.chunksUsed} tier=${cls.model}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
