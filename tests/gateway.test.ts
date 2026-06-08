import { test } from "node:test";
import assert from "node:assert/strict";
import { runWithMap } from "../src/core/gateway";
import { setProvider } from "../src/core/providers";
import { setRetriever, MemoryRetriever } from "../src/core/retrievers";
import { localEmbedder } from "../src/core/embeddings/local";
import { getLogs } from "../src/core/logger";
import { fakeProvider } from "./fakes";
import type { Chunk } from "../src/core/retriever";

const corpus: Chunk[] = [
  { id: "1", namespace: "docs", text: "plazo de presentación veinte días hábiles" },
  { id: "2", namespace: "docs", text: "garantía provisional dos por ciento" },
  { id: "3", namespace: "taxonomy", text: "categorias plazos garantias criterios" },
];

test("runWithMap: una llamada, scope aplicado, log registrado", async () => {
  setProvider(fakeProvider);
  const mem = new MemoryRetriever(localEmbedder);
  await mem.add(corpus);
  setRetriever(mem);

  const before = getLogs().length;
  const res = await runWithMap("qa_documental", "qué plazo aplica");

  assert.equal(res.calls, 1);
  assert.ok(res.chunksUsed >= 1);
  assert.ok(res.chunksUsed <= 6, "no supera maxRetrievalChunks");
  assert.equal(getLogs().length, before + 1);

  setProvider(null); // limpia el override
});

test("clasificar bloquea scoped_search: 0 chunks recuperados", async () => {
  setProvider(fakeProvider);
  const res = await runWithMap("clasificar", "esto es sobre plazos");
  assert.equal(res.chunksUsed, 0);
  setProvider(null);
});
